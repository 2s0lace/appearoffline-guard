import storage, { Schema } from "./storage";
import { getTranslations } from "./helpers/i18n";
import { isSettingsLocked } from "./helpers/settings-lock";
import { computeCategoryStats, filterUnlockHistoryByPeriod } from "./helpers/unlock-history";
import { pushSettingsToCloud, syncAllWithCloud } from "./helpers/supabase-sync";

const POPUP_COPY = {
  pl: {
    on: "Aktywna",
    off: "Wyłączona",
    sitesCount: (n: number) => (n === 1 ? "1 zablokowana strona" : `${n} zablokowanych stron`),
    blockSite: "Zablokuj tę stronę",
    alreadyBlocked: "Na liście blokad ✓",
    notSignedIn: "Brak konta",
    signIn: "Zaloguj",
    sync: "Sync",
    syncing: "…",
    synced: "Zsynchronizowano ✓",
  },
  en: {
    on: "Active",
    off: "Paused",
    sitesCount: (n: number) => (n === 1 ? "1 blocked site" : `${n} blocked sites`),
    blockSite: "Block this site",
    alreadyBlocked: "On blocklist ✓",
    notSignedIn: "Not signed in",
    signIn: "Sign in",
    sync: "Sync",
    syncing: "…",
    synced: "Synced ✓",
  },
  es: {
    on: "Activo",
    off: "Pausado",
    sitesCount: (n: number) => (n === 1 ? "1 sitio bloqueado" : `${n} sitios bloqueados`),
    blockSite: "Bloquear este sitio",
    alreadyBlocked: "Ya bloqueado ✓",
    notSignedIn: "Sin cuenta",
    signIn: "Entrar",
    sync: "Sync",
    syncing: "…",
    synced: "Sincronizado ✓",
  },
  fr: {
    on: "Actif",
    off: "En pause",
    sitesCount: (n: number) => (n === 1 ? "1 site bloqué" : `${n} sites bloqués`),
    blockSite: "Bloquer ce site",
    alreadyBlocked: "Déjà bloqué ✓",
    notSignedIn: "Non connecté",
    signIn: "Connexion",
    sync: "Sync",
    syncing: "…",
    synced: "Synchronisé ✓",
  },
  de: {
    on: "Aktiv",
    off: "Pausiert",
    sitesCount: (n: number) => (n === 1 ? "1 gesperrte Seite" : `${n} gesperrte Seiten`),
    blockSite: "Diese Seite sperren",
    alreadyBlocked: "Bereits gesperrt ✓",
    notSignedIn: "Nicht angemeldet",
    signIn: "Anmelden",
    sync: "Sync",
    syncing: "…",
    synced: "Synchronisiert ✓",
  },
} as const;

window.addEventListener("DOMContentLoaded", async () => {
  const statusBtn = document.getElementById("popup-status-btn") as HTMLButtonElement;
  const statusText = document.getElementById("popup-status-text") as HTMLSpanElement;
  const blockedCountEl = document.getElementById("popup-blocked-count") as HTMLSpanElement;
  const siteCard = document.getElementById("popup-site-card") as HTMLElement;
  const siteHostEl = document.getElementById("popup-site-host") as HTMLDivElement;
  const blockSiteBtn = document.getElementById("popup-block-site-btn") as HTMLButtonElement;
  const accountDot = document.getElementById("popup-account-dot") as HTMLSpanElement;
  const accountText = document.getElementById("popup-account-text") as HTMLSpanElement;
  const syncBtn = document.getElementById("popup-sync-btn") as HTMLButtonElement;
  const loginBtn = document.getElementById("popup-login-btn") as HTMLButtonElement;
  const syncStatus = document.getElementById("popup-sync-status") as HTMLDivElement;
  const statsSection = document.getElementById("popup-stats") as HTMLElement;
  const statsTitle = document.getElementById("popup-stats-title") as HTMLDivElement;
  const lblBoredom = document.getElementById("popup-lbl-boredom") as HTMLSpanElement;
  const lblRumination = document.getElementById("popup-lbl-rumination") as HTMLSpanElement;
  const lblNeed = document.getElementById("popup-lbl-need") as HTMLSpanElement;
  const valBoredom = document.getElementById("popup-val-boredom") as HTMLElement;
  const valRumination = document.getElementById("popup-val-rumination") as HTMLElement;
  const valNeed = document.getElementById("popup-val-need") as HTMLElement;
  const historyBtn = document.getElementById("popup-history-btn") as HTMLButtonElement;
  const optionsBtn = document.getElementById("popup-options-btn") as HTMLButtonElement;

  const keys: (keyof Schema)[] = [
    "enabled",
    "unlockMode",
    "language",
    "theme",
    "blocked",
    "resolution",
    "counterShow",
    "counterPeriod",
    "unlockHistory",
    "settingsUnlockedUntil",
    "accountSession",
  ];

  let state = await storage.get(keys);
  let activeHost = "";

  const getCopy = () => POPUP_COPY[state.language || "pl"] || POPUP_COPY.pl;

  const render = () => {
    const lang = state.language || "pl";
    const t = getTranslations(lang);
    const copy = getCopy();

    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = state.theme === "DARK" ? "dark" : "light";

    const enabled = Boolean(state.enabled);
    const locked = isSettingsLocked({
      enabled,
      unlockMode: state.unlockMode || "PAUSE_AND_REASON",
      settingsUnlockedUntil: state.settingsUnlockedUntil || 0,
    }, Date.now());

    const blockedCount = (state.blocked || []).filter((line) => line.trim() && !line.trim().startsWith("#")).length;
    blockedCountEl.textContent = copy.sitesCount(blockedCount);

    statusBtn.classList.toggle("is-on", enabled);
    statusText.textContent = enabled ? copy.on : copy.off;
    statusBtn.disabled = enabled && locked;

    if (activeHost) {
      siteCard.hidden = false;
      siteHostEl.textContent = activeHost;
      const alreadyBlocked = (state.blocked || []).includes(activeHost);
      blockSiteBtn.textContent = alreadyBlocked ? copy.alreadyBlocked : copy.blockSite;
      blockSiteBtn.disabled = alreadyBlocked;
    }

    const session = state.accountSession;
    if (session && session.accessToken) {
      accountDot.hidden = false;
      accountText.textContent = session.user.email;
      syncBtn.hidden = false;
      syncBtn.textContent = copy.sync;
      loginBtn.hidden = true;
    } else {
      accountDot.hidden = true;
      accountText.textContent = copy.notSignedIn;
      syncBtn.hidden = true;
      loginBtn.hidden = false;
      loginBtn.textContent = copy.signIn;
    }

    const weekHistory = filterUnlockHistoryByPeriod(state.unlockHistory || [], "THIS_WEEK");
    const stats = computeCategoryStats(weekHistory, true);
    statsTitle.textContent = t.thisWeekPrefix;
    lblBoredom.textContent = t.categories.BOREDOM;
    lblRumination.textContent = t.categories.RUMINATION;
    lblNeed.textContent = t.categories.NEED;
    valBoredom.textContent = String(stats.counts.BOREDOM);
    valRumination.textContent = String(stats.counts.RUMINATION);
    valNeed.textContent = String(stats.counts.NEED);
    statsSection.hidden = false;

    historyBtn.textContent = t.historyNavLink;
    optionsBtn.textContent = t.settingsNavLink;
  };

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.startsWith("http")) {
      activeHost = new URL(tab.url).hostname.replace(/^www\./, "");
    }
  } catch {
    // Ignore tabs query failure.
  }

  render();
  document.body.classList.add("ready");

  const runSync = async (silent: boolean) => {
    const copy = getCopy();
    if (!silent) {
      syncBtn.disabled = true;
      syncBtn.textContent = copy.syncing;
      syncStatus.hidden = true;
    }
    const res = await syncAllWithCloud();
    if (!silent) {
      syncBtn.disabled = false;
      syncBtn.textContent = copy.sync;
    }
    if (res.ok) {
      state = await storage.get(keys);
      render();
      if (!silent) {
        syncStatus.textContent = copy.synced;
        syncStatus.hidden = false;
      }
    } else if (!silent) {
      syncStatus.textContent = res.error;
      syncStatus.hidden = false;
    }
  };

  // Quiet background auto-sync when popup opens
  if (state.accountSession?.accessToken) {
    void runSync(true);
  }

  statusBtn.addEventListener("click", async () => {
    const nextEnabled = !state.enabled;
    const locked = isSettingsLocked({
      enabled: Boolean(state.enabled),
      unlockMode: state.unlockMode || "PAUSE_AND_REASON",
      settingsUnlockedUntil: state.settingsUnlockedUntil || 0,
    }, Date.now());
    if (!nextEnabled && locked) {
      return;
    }
    state = { ...state, enabled: nextEnabled };
    await storage.set({ enabled: nextEnabled });
    render();
  });

  blockSiteBtn.addEventListener("click", async () => {
    if (!activeHost) {
      return;
    }
    const blocked = state.blocked || [];
    if (blocked.includes(activeHost)) {
      return;
    }
    const nextBlocked = [...blocked, activeHost];
    state = { ...state, blocked: nextBlocked };
    await storage.set({ blocked: nextBlocked });
    render();

    if (state.accountSession) {
      void pushSettingsToCloud(state.accountSession, {
        blocked: nextBlocked,
        unlockMode: state.unlockMode || "PAUSE_AND_REASON",
        language: state.language || "pl",
        theme: state.theme || "LIGHT",
        resolution: state.resolution || "SHOW_BLOCKED_INFO_PAGE",
        counterShow: state.counterShow ?? true,
        counterPeriod: state.counterPeriod || "ALL_TIME",
      });
    }
  });

  syncBtn.addEventListener("click", () => {
    void runSync(false);
  });

  const openPage = (page: string) => {
    chrome.tabs.create({ url: chrome.runtime.getURL(page) });
    window.close();
  };

  loginBtn.addEventListener("click", () => openPage("options.html"));
  historyBtn.addEventListener("click", () => openPage("history.html"));
  optionsBtn.addEventListener("click", () => openPage("options.html"));
});
