import storage, {
  Schema,
  CounterPeriod,
  UnlockLogEntry,
  UnlockCategory,
  Language,
  Theme,
  COUNTER_PERIODS,
  UNLOCK_CATEGORIES,
} from "./storage";
import {
  computeCategoryStats,
  filterUnlockHistoryByPeriod,
} from "./helpers/unlock-history";
import { getTranslations, Translations } from "./helpers/i18n";
import { isSettingsLocked } from "./helpers/settings-lock";
import { setupBackButton } from "./helpers/back-button";
import {
  clearHistoryInCloud,
  deleteHistoryEntryFromCloud,
} from "./helpers/supabase-sync";

const KEYS: (keyof Schema)[] = [
  "enabled",
  "unlockMode",
  "settingsUnlockedUntil",
  "unlockHistory",
  "language",
  "theme",
];

window.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
  const settingsNavLink = document.getElementById("settings-nav-link") as HTMLAnchorElement;
  const heading = document.getElementById("history-heading") as HTMLSpanElement;
  const periodSelect = document.getElementById("history-period") as HTMLSelectElement;
  const resetCountersBtn = document.getElementById("reset-counters-btn") as HTMLButtonElement;
  const clearHistoryBtn = document.getElementById("clear-history-btn") as HTMLButtonElement;
  const lockedHint = document.getElementById("history-locked-hint") as HTMLParagraphElement;
  const historyEmpty = document.getElementById("history-empty") as HTMLDivElement;
  const historyEmptyText = document.getElementById("history-empty-text") as HTMLSpanElement;
  const historyList = document.getElementById("history-list") as HTMLDivElement;

  setupBackButton(backBtn);

  const state: Pick<Schema, "enabled" | "unlockMode" | "settingsUnlockedUntil" | "unlockHistory"> = {
    enabled: false,
    unlockMode: "PAUSE_AND_REASON",
    settingsUnlockedUntil: 0,
    unlockHistory: [],
  };
  let t: Translations = getTranslations("pl");

  const locked = () => isSettingsLocked(state, Date.now());

  const renderHistory = () => {
    const isLocked = locked();
    resetCountersBtn.disabled = isLocked;
    clearHistoryBtn.disabled = isLocked;
    lockedHint.hidden = !isLocked;

    const period = periodSelect.value as CounterPeriod;
    const filtered = filterUnlockHistoryByPeriod(state.unlockHistory, period);
    const stats = computeCategoryStats(filtered, true);

    UNLOCK_CATEGORIES.forEach((cat: UnlockCategory) => {
      const count = stats.counts[cat];
      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      const valEl = document.getElementById(`stat-${cat}`);
      const pctEl = document.getElementById(`stat-pct-${cat}`);
      if (valEl) {
        valEl.textContent = String(count);
      }
      if (pctEl) {
        pctEl.textContent = `${pct}%`;
      }
    });

    historyList.innerHTML = "";
    historyEmpty.hidden = filtered.length > 0;

    filtered.forEach((entry: UnlockLogEntry) => {
      const item = document.createElement("div");
      item.className = "history-item";

      const top = document.createElement("div");
      top.className = "history-item-top";

      const meta = document.createElement("div");
      meta.className = "history-meta";

      const badge = document.createElement("span");
      badge.className = `cat-badge cat-${entry.category}`;
      badge.textContent = entry.kind === "SETTINGS_UNLOCK"
        ? t.settingsChangeBadge
        : t.categoriesFull[entry.category];

      const ruleEl = document.createElement("span");
      ruleEl.className = "history-rule";
      ruleEl.textContent = entry.kind === "SETTINGS_UNLOCK"
        ? t.settingsPanelLabel
        : `${entry.rule} (${entry.durationMinutes} min)`;

      meta.appendChild(badge);
      meta.appendChild(ruleEl);

      const right = document.createElement("div");
      right.className = "history-item-right";

      const timeEl = document.createElement("span");
      timeEl.className = "history-time";
      timeEl.textContent = new Date(entry.timestamp).toLocaleString(t.locale);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "history-delete-btn";
      delBtn.textContent = "×";
      delBtn.title = t.deleteEntryTooltip;
      delBtn.disabled = isLocked;
      delBtn.addEventListener("click", () => {
        if (locked()) {
          return;
        }
        storage.set({ unlockHistory: state.unlockHistory.filter((e) => e.id !== entry.id) });
        storage.get(["accountSession"]).then(({ accountSession }) => {
          if (accountSession) {
            deleteHistoryEntryFromCloud(accountSession, entry.id);
          }
        });
      });

      right.appendChild(timeEl);
      right.appendChild(delBtn);
      top.appendChild(meta);
      top.appendChild(right);

      const reasonEl = document.createElement("p");
      reasonEl.className = "history-reason";
      reasonEl.textContent = entry.reason;

      item.appendChild(top);
      item.appendChild(reasonEl);
      historyList.appendChild(item);
    });
  };

  const applyLanguage = (lang: Language) => {
    t = getTranslations(lang);
    document.documentElement.lang = lang;
    document.title = t.historyPageTitle;
    heading.textContent = t.historyHeading;
    backBtn.textContent = `← ${t.backBtn}`;
    settingsNavLink.textContent = t.settingsNavLink;
    resetCountersBtn.textContent = t.resetCountersBtn;
    clearHistoryBtn.textContent = t.clearHistoryBtn;
    historyEmptyText.textContent = t.historyEmpty;
    lockedHint.textContent = t.historyLockedHint;
    periodSelect.setAttribute("aria-label", t.counterPeriodLabel);

    COUNTER_PERIODS.forEach((p) => {
      document.querySelectorAll(`[data-period-opt="${p}"]`).forEach((el) => {
        el.textContent = t.periodsTitle[p];
      });
    });
    UNLOCK_CATEGORIES.forEach((cat) => {
      document.querySelectorAll(`[data-stat-label="${cat}"]`).forEach((el) => {
        el.textContent = t.categoriesFull[cat];
      });
    });
  };

  const applyTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme === "DARK" ? "dark" : "light";
  };

  const init = (items: Partial<Schema>) => {
    if (items.enabled !== undefined) {
      state.enabled = items.enabled;
    }
    if (items.unlockMode !== undefined) {
      state.unlockMode = items.unlockMode;
    }
    if (items.settingsUnlockedUntil !== undefined) {
      state.settingsUnlockedUntil = items.settingsUnlockedUntil;
    }
    if (items.unlockHistory !== undefined) {
      state.unlockHistory = items.unlockHistory;
    }
    if (items.theme !== undefined) {
      applyTheme(items.theme);
    }
    if (items.language !== undefined) {
      applyLanguage(items.language);
    }
    renderHistory();
  };

  periodSelect.addEventListener("change", renderHistory);

  resetCountersBtn.addEventListener("click", () => {
    if (!locked() && window.confirm(t.confirmResetCounters)) {
      storage.set({ counter: {} });
    }
  });

  clearHistoryBtn.addEventListener("click", () => {
    if (!locked() && window.confirm(t.confirmClearHistory)) {
      storage.set({ unlockHistory: [] });
      storage.get(["accountSession"]).then(({ accountSession }) => {
        if (accountSession) {
          clearHistoryInCloud(accountSession);
        }
      });
    }
  });

  // Settings unlock expires on its own; refresh the disabled state.
  window.setInterval(renderHistory, 15_000);

  storage.get(KEYS).then((local) => {
    init(local);
    document.body.classList.add("ready");
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    const update: Partial<Schema> = {};
    KEYS.forEach((key) => {
      if (changes[key]) {
        (update as Record<string, unknown>)[key] = changes[key].newValue;
      }
    });
    if (Object.keys(update).length) {
      init(update);
    }
  });
});
