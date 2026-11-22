import storage, {
  AccountSession,
  CounterPeriod,
  Language,
  Resolution,
  Schema,
  Theme,
  UnlockCategory,
  UnlockLogEntry,
  UnlockMode,
  VALIDATORS,
} from "../storage";
import {
  refreshSession,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "./supabase-auth";

export type SyncResult =
  | { ok: true; syncedAt: number; historyCount: number }
  | { ok: false; error: string };

interface RemoteSettingsRow {
  user_id: string
  blocked: string[]
  unlock_mode: string
  language: string
  theme: string
  resolution: string
  counter_show: boolean
  counter_period: string
  updated_at?: string
}

interface RemoteHistoryRow {
  user_id: string
  id: string
  timestamp_ms: number
  url: string
  rule: string
  category: string
  reason: string
  duration_minutes: number
  kind?: string
}

const restHeaders = (accessToken: string, extra?: Record<string, string>): Record<string, string> => ({
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
  ...extra,
});

export const ensureValidSession = async (
  session: AccountSession | null,
): Promise<AccountSession | null> => {
  if (!session || !session.accessToken) {
    return null;
  }
  if (session.expiresAt > Date.now() + 60_000) {
    return session;
  }
  if (!session.refreshToken) {
    return null;
  }
  const refreshed = await refreshSession(session.refreshToken);
  await storage.set({ accountSession: refreshed });
  return refreshed;
};

export const mergeUnlockHistory = (
  local: UnlockLogEntry[],
  remote: UnlockLogEntry[],
): UnlockLogEntry[] => {
  const map = new Map<string, UnlockLogEntry>();
  remote.forEach((entry) => map.set(entry.id, entry));
  local.forEach((entry) => map.set(entry.id, entry));
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
};

const toRemoteHistoryRow = (userId: string, entry: UnlockLogEntry): RemoteHistoryRow => ({
  user_id: userId,
  id: entry.id,
  timestamp_ms: entry.timestamp,
  url: entry.url,
  rule: entry.rule,
  category: entry.category,
  reason: entry.reason,
  duration_minutes: entry.durationMinutes,
  kind: entry.kind || "SITE_UNLOCK",
});

const fromRemoteHistoryRow = (row: RemoteHistoryRow): UnlockLogEntry => ({
  id: row.id,
  timestamp: Number(row.timestamp_ms),
  url: row.url,
  rule: row.rule,
  category: (row.category as UnlockCategory) || "OTHER",
  reason: row.reason,
  durationMinutes: Number(row.duration_minutes) || 15,
  kind: row.kind === "SETTINGS_UNLOCK" ? "SETTINGS_UNLOCK" : "SITE_UNLOCK",
});

export const pushSettingsToCloud = async (
  session: AccountSession | null,
  settings: Pick<
    Schema,
    "blocked" | "unlockMode" | "language" | "theme" | "resolution" | "counterShow" | "counterPeriod"
  >,
): Promise<boolean> => {
  const valid = await ensureValidSession(session);
  if (!valid || !valid.user.id) {
    return false;
  }

  const row: RemoteSettingsRow = {
    user_id: valid.user.id,
    blocked: settings.blocked,
    unlock_mode: settings.unlockMode,
    language: settings.language,
    theme: settings.theme,
    resolution: settings.resolution,
    counter_show: settings.counterShow,
    counter_period: settings.counterPeriod,
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_settings`, {
      method: "POST",
      headers: restHeaders(valid.accessToken, {
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify(row),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const pushHistoryEntriesToCloud = async (
  session: AccountSession | null,
  entries: UnlockLogEntry[],
): Promise<boolean> => {
  if (!entries.length) {
    return true;
  }
  const valid = await ensureValidSession(session);
  if (!valid || !valid.user.id) {
    return false;
  }

  const rows = entries.map((entry) => toRemoteHistoryRow(valid.user.id, entry));

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/unlock_history`, {
      method: "POST",
      headers: restHeaders(valid.accessToken, {
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify(rows),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteHistoryEntryFromCloud = async (
  session: AccountSession | null,
  entryId: string,
): Promise<boolean> => {
  const valid = await ensureValidSession(session);
  if (!valid || !valid.user.id) {
    return false;
  }
  try {
    const params = new URLSearchParams({
      user_id: `eq.${valid.user.id}`,
      id: `eq.${entryId}`,
    });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/unlock_history?${params.toString()}`, {
      method: "DELETE",
      headers: restHeaders(valid.accessToken),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const clearHistoryInCloud = async (
  session: AccountSession | null,
): Promise<boolean> => {
  const valid = await ensureValidSession(session);
  if (!valid || !valid.user.id) {
    return false;
  }
  try {
    const params = new URLSearchParams({
      user_id: `eq.${valid.user.id}`,
    });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/unlock_history?${params.toString()}`, {
      method: "DELETE",
      headers: restHeaders(valid.accessToken),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncAllWithCloud = async (): Promise<SyncResult> => {
  const local = await storage.get([
    "accountSession",
    "blocked",
    "unlockMode",
    "language",
    "theme",
    "resolution",
    "counterShow",
    "counterPeriod",
    "unlockHistory",
  ]);

  const valid = await ensureValidSession(local.accountSession || null);
  if (!valid || !valid.user.id) {
    return { ok: false, error: "Not signed in." };
  }

  try {
    const [settingsRes, historyRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/user_settings?user_id=eq.${encodeURIComponent(valid.user.id)}&select=*`, {
        headers: restHeaders(valid.accessToken),
      }),
      fetch(`${SUPABASE_URL}/rest/v1/unlock_history?user_id=eq.${encodeURIComponent(valid.user.id)}&order=timestamp_ms.desc&limit=500`, {
        headers: restHeaders(valid.accessToken),
      }),
    ]);

    if (!settingsRes.ok) {
      const errText = await settingsRes.text();
      return { ok: false, error: errText || `Settings HTTP ${settingsRes.status}` };
    }
    if (!historyRes.ok) {
      const errText = await historyRes.text();
      return { ok: false, error: errText || `History HTTP ${historyRes.status}` };
    }

    const remoteSettingsArr = (await settingsRes.json()) as RemoteSettingsRow[];
    const remoteHistoryRows = (await historyRes.json()) as RemoteHistoryRow[];

    const localHistory = local.unlockHistory || [];
    const remoteHistory = remoteHistoryRows.map(fromRemoteHistoryRow);
    const mergedHistory = mergeUnlockHistory(localHistory, remoteHistory);

    const remoteIds = new Set(remoteHistory.map((e) => e.id));
    const missingInCloud = localHistory.filter((e) => !remoteIds.has(e.id));
    if (missingInCloud.length > 0) {
      await pushHistoryEntriesToCloud(valid, missingInCloud);
    }

    const storagePatch: Partial<Schema> = {
      unlockHistory: mergedHistory,
    };

    const remoteSettings = remoteSettingsArr[0];
    if (remoteSettings && (!local.blocked || local.blocked.length === 0)) {
      if (Array.isArray(remoteSettings.blocked)) {
        storagePatch.blocked = remoteSettings.blocked;
      }
      if (VALIDATORS.unlockMode(remoteSettings.unlock_mode)) {
        storagePatch.unlockMode = remoteSettings.unlock_mode as UnlockMode;
      }
      if (VALIDATORS.language(remoteSettings.language)) {
        storagePatch.language = remoteSettings.language as Language;
      }
      if (VALIDATORS.theme(remoteSettings.theme)) {
        storagePatch.theme = remoteSettings.theme as Theme;
      }
      if (VALIDATORS.resolution(remoteSettings.resolution)) {
        storagePatch.resolution = remoteSettings.resolution as Resolution;
      }
      if (typeof remoteSettings.counter_show === "boolean") {
        storagePatch.counterShow = remoteSettings.counter_show;
      }
      if (VALIDATORS.counterPeriod(remoteSettings.counter_period)) {
        storagePatch.counterPeriod = remoteSettings.counter_period as CounterPeriod;
      }
    } else {
      await pushSettingsToCloud(valid, {
        blocked: local.blocked || [],
        unlockMode: local.unlockMode || "PAUSE_AND_REASON",
        language: local.language || "pl",
        theme: local.theme || "LIGHT",
        resolution: local.resolution || "SHOW_BLOCKED_INFO_PAGE",
        counterShow: local.counterShow ?? true,
        counterPeriod: local.counterPeriod || "ALL_TIME",
      });
    }

    await storage.set(storagePatch);

    return {
      ok: true,
      syncedAt: Date.now(),
      historyCount: mergedHistory.length,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Sync failed" };
  }
};
