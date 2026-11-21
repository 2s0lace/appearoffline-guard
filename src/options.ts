import storage, {
  Schema,
  Resolution,
  CounterPeriod,
  RESOLUTIONS,
  BLOCKED_EXAMPLE,
  UnlockLogEntry,
  UnlockCategory,
  UnlockMode,
  Language,
  Theme,
  COUNTER_PERIODS,
  UNLOCK_CATEGORIES,
} from "./storage";
import {
  generateCodeBatch,
  getRemainingCodesCount,
  getTotalCodesCount,
  resolveActiveHashes,
  verifyUnlockCode,
} from "./helpers/unlock-codes";
import { sealCodesForAi } from "./helpers/code-seal";
import {
  computeCategoryStats,
  filterUnlockHistoryByPeriod,
} from "./helpers/unlock-history";
import { getTranslations, Translations } from "./helpers/i18n";

const SETTINGS_UNLOCK_MINUTES = 5;
const MIN_SETTINGS_REASON_LENGTH = 10;

const UI = (() => {
  const elements = {
    enabled: document.getElementById("enabled") as HTMLSelectElement,
    unlockMode: document.getElementById("unlock-mode") as HTMLSelectElement,
    language: document.getElementById("language") as HTMLSelectElement,
    theme: document.getElementById("theme") as HTMLSelectElement,
    codesOption: document.getElementById("codes-option") as HTMLDivElement,
    generateCodesBtn: document.getElementById("generate-codes-btn") as HTMLButtonElement,
    generatedCodesBox: document.getElementById("generated-codes-box") as HTMLDivElement,
    generatedCodesOutput: document.getElementById("generated-codes-output") as HTMLTextAreaElement,
    copyCodesBtn: document.getElementById("copy-codes-btn") as HTMLButtonElement,
    hideCodesBtn: document.getElementById("hide-codes-btn") as HTMLButtonElement,
    contextMenu: document.getElementById("context-menu") as HTMLSelectElement,
    blockedList: document.getElementById("blocked-list") as HTMLTextAreaElement,
    resolution: document.getElementById("resolution") as HTMLSelectElement,
    counterShow: document.getElementById("counter-show") as HTMLSelectElement,
    counterPeriod: document.getElementById("counter-period") as HTMLSelectElement,
    codesRemaining: document.getElementById("options-codes-remaining") as HTMLSpanElement,
    quickAddForm: document.getElementById("quick-add-form") as HTMLFormElement,
    quickAddInput: document.getElementById("quick-add-input") as HTMLInputElement,
    lockBanner: document.getElementById("lock-banner") as HTMLDivElement,
    lockStatusTitle: document.getElementById("lock-status-title") as HTMLElement,
    lockStatusDesc: document.getElementById("lock-status-desc") as HTMLSpanElement,
    toggleUnlockSettingsBtn: document.getElementById("toggle-unlock-settings-btn") as HTMLButtonElement,
    relockSettingsBtn: document.getElementById("relock-settings-btn") as HTMLButtonElement,
    settingsUnlockForm: document.getElementById("settings-unlock-form") as HTMLFormElement,
    settingsUnlockReason: document.getElementById("settings-unlock-reason") as HTMLInputElement,
    settingsUnlockCode: document.getElementById("settings-unlock-code") as HTMLInputElement,
    settingsUnlockError: document.getElementById("settings-unlock-error") as HTMLDivElement,
    historyPeriod: document.getElementById("history-period") as HTMLSelectElement,
    resetCountersBtn: document.getElementById("reset-counters-btn") as HTMLButtonElement,
    clearHistoryBtn: document.getElementById("clear-history-btn") as HTMLButtonElement,
    historyEmpty: document.getElementById("history-empty") as HTMLDivElement,
    historyList: document.getElementById("history-list") as HTMLDivElement,
  };

  elements.blockedList.placeholder = BLOCKED_EXAMPLE.join("\n");

  const currentState: Pick<
    Schema,
    "enabled" | "unlockMode" | "language" | "theme" | "blocked" | "usedCodeHashes" | "customCodeHashes" | "unlockHistory" | "settingsUnlockedUntil"
  > = {
    enabled: false,
    unlockMode: "PAUSE_AND_REASON",
    language: "pl",
    theme: "LIGHT",
    blocked: [],
    usedCodeHashes: [],
    customCodeHashes: [],
    unlockHistory: [],
    settingsUnlockedUntil: 0,
  };

  let t: Translations = getTranslations("pl");

  const booleanToString = (b: boolean) => b ? "YES" : "NO";
  const stringToBoolean = (s: string) => s === "YES";
  const getEventTargetValue = (event: Event) => (event.target as HTMLTextAreaElement | HTMLSelectElement).value;
  const stringToBlocked = (string: string) => string.split("\n").map((s) => s.trim()).filter(Boolean);

  const isStrictMode = () => currentState.unlockMode === "PAUSE_REASON_AND_CODE";

  const isSettingsLocked = () =>
    currentState.enabled && isStrictMode() && currentState.settingsUnlockedUntil <= Date.now();

  const applyTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme === "DARK" ? "dark" : "light";
  };

  const renderCodesCounter = () => {
    const activeHashes = resolveActiveHashes(currentState.customCodeHashes);
    const remaining = getRemainingCodesCount(currentState.usedCodeHashes, activeHashes);
    const total = getTotalCodesCount(activeHashes);
    elements.codesRemaining.textContent = t.codesRemaining(remaining, total);
  };

  const applyLockState = () => {
    const strict = isStrictMode();
    const locked = isSettingsLocked();
    const temporarilyUnlocked = currentState.enabled && strict && !locked;

    elements.codesOption.hidden = !strict;
    elements.lockBanner.hidden = !(currentState.enabled && strict);
    elements.lockBanner.classList.toggle("unlocked", temporarilyUnlocked);
    elements.toggleUnlockSettingsBtn.hidden = temporarilyUnlocked;
    elements.relockSettingsBtn.hidden = !temporarilyUnlocked;

    if (temporarilyUnlocked) {
      const remainingMin = Math.max(1, Math.ceil((currentState.settingsUnlockedUntil - Date.now()) / 60_000));
      elements.lockStatusTitle.textContent = t.unlockedTitle(remainingMin);
      elements.lockStatusDesc.textContent = t.unlockedDesc;
      elements.settingsUnlockForm.hidden = true;
    } else {
      elements.lockStatusTitle.textContent = t.lockTitle;
      elements.lockStatusDesc.textContent = t.lockDesc;
    }

    elements.enabled.disabled = locked;
    elements.unlockMode.disabled = locked;
    elements.generateCodesBtn.disabled = locked;
    elements.blockedList.disabled = locked;
    elements.resolution.disabled = locked;
    elements.clearHistoryBtn.disabled = locked;
    elements.resetCountersBtn.disabled = locked;

    document.querySelectorAll<HTMLButtonElement>(".history-delete-btn").forEach((btn) => {
      btn.disabled = locked;
    });
  };

  const renderHistory = () => {
    const period = elements.historyPeriod.value as CounterPeriod;
    const filtered = filterUnlockHistoryByPeriod(currentState.unlockHistory, period);
    const stats = computeCategoryStats(filtered, true);

    (["BOREDOM", "RUMINATION", "NEED", "OTHER"] as UnlockCategory[]).forEach((cat) => {
      const valEl = document.getElementById(`stat-${cat}`);
      const pctEl = document.getElementById(`stat-pct-${cat}`);
      const count = stats.counts[cat];
      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      if (valEl) {
        valEl.textContent = String(count);
      }
      if (pctEl) {
        pctEl.textContent = `${pct}%`;
      }
    });

    elements.historyList.innerHTML = "";
    elements.historyEmpty.hidden = filtered.length > 0;
    const locked = isSettingsLocked();

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
      delBtn.disabled = locked;
      delBtn.addEventListener("click", () => {
        if (isSettingsLocked()) {
          return;
        }
        const nextHistory = currentState.unlockHistory.filter((itemEntry) => itemEntry.id !== entry.id);
        storage.set({ unlockHistory: nextHistory });
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
      elements.historyList.appendChild(item);
    });
  };

  const applyLanguage = (lang: Language) => {
    t = getTranslations(lang);
    document.documentElement.lang = lang;
    document.title = t.optionsTitle;

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = text;
      }
    };

    setText("toggle-unlock-settings-btn", t.unlockSettingsBtn);
    setText("relock-settings-btn", t.relockSettingsBtn);
    setText("settings-unlock-confirm-btn", t.confirmBtn);
    setText("label-enabled", t.enabledLabel);
    setText("label-unlock-mode", t.unlockModeLabel);
    setText("opt-mode-standard", t.modeStandard);
    setText("opt-mode-code", t.modeWithCode);
    setText("label-language", t.languageLabel);
    setText("label-theme", t.themeLabel);
    setText("opt-theme-light", t.themeLight);
    setText("opt-theme-dark", t.themeDark);
    setText("label-codes-pool", t.codesPoolLabel);
    setText("generate-codes-btn", t.generateCodesBtn);
    setText("generated-title", t.generatedTitle);
    setText("generated-desc", t.generatedDesc);
    setText("copy-codes-btn", t.copyCodesBtn);
    setText("hide-codes-btn", t.hideCodesBtn);
    setText("label-context-menu", t.contextMenuLabel);
    setText("quick-add-btn", t.addSiteBtn);
    setText("blocked-sites-heading", t.blockedSitesHeading);
    setText("label-resolution", t.resolutionLabel);
    setText("opt-res-page", t.resShowPage);
    setText("opt-res-close", t.resCloseTab);
    setText("label-counter-show", t.showCounterLabel);
    setText("label-counter-period", t.counterPeriodLabel);
    setText("history-heading", t.historyHeading);
    setText("reset-counters-btn", t.resetCountersBtn);
    setText("clear-history-btn", t.clearHistoryBtn);
    setText("history-empty", t.historyEmpty);

    elements.settingsUnlockReason.placeholder = t.settingsReasonPlaceholder;
    elements.settingsUnlockCode.placeholder = t.codePlaceholder;
    elements.quickAddInput.placeholder = t.quickAddPlaceholder;

    document.querySelectorAll("[data-i18n-yes]").forEach((el) => {
      el.textContent = t.yes;
    });
    document.querySelectorAll("[data-i18n-no]").forEach((el) => {
      el.textContent = t.no;
    });
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

    renderCodesCounter();
    applyLockState();
    renderHistory();
  };

  elements.enabled.addEventListener("change", (event) => {
    const enabled = stringToBoolean(getEventTargetValue(event));
    if (!enabled && isSettingsLocked()) {
      elements.enabled.value = "YES";
      return;
    }
    storage.set({ enabled });
  });

  elements.unlockMode.addEventListener("change", (event) => {
    if (isSettingsLocked()) {
      elements.unlockMode.value = currentState.unlockMode;
      return;
    }
    const unlockMode = getEventTargetValue(event) as UnlockMode;
    storage.set({ unlockMode });
  });

  elements.language.addEventListener("change", (event) => {
    const language = getEventTargetValue(event) as Language;
    storage.set({ language });
  });

  elements.theme.addEventListener("change", (event) => {
    const theme = getEventTargetValue(event) as Theme;
    storage.set({ theme });
  });

  elements.generateCodesBtn.addEventListener("click", async () => {
    if (isSettingsLocked()) {
      return;
    }
    elements.generateCodesBtn.disabled = true;
    try {
      const { codes, hashes } = await generateCodeBatch(50);
      const sealedBlob = await sealCodesForAi(codes);
      await storage.set({
        customCodeHashes: hashes,
        usedCodeHashes: [],
      });
      elements.generatedCodesOutput.value = sealedBlob;
      elements.generatedCodesBox.hidden = false;
    } finally {
      applyLockState();
    }
  });

  elements.copyCodesBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.generatedCodesOutput.value);
      elements.copyCodesBtn.textContent = t.copiedBtn;
      window.setTimeout(() => {
        elements.copyCodesBtn.textContent = t.copyCodesBtn;
      }, 2000);
    } catch {
      elements.generatedCodesOutput.select();
    }
  });

  elements.hideCodesBtn.addEventListener("click", () => {
    elements.generatedCodesOutput.value = "";
    elements.generatedCodesBox.hidden = true;
  });

  elements.contextMenu.addEventListener("change", (event) => {
    const contextMenu = stringToBoolean(getEventTargetValue(event));
    storage.set({ contextMenu });
  });

  elements.blockedList.addEventListener("input", (event) => {
    if (isSettingsLocked()) {
      return;
    }
    const blocked = stringToBlocked(getEventTargetValue(event));
    storage.set({ blocked });
  });

  elements.quickAddForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = elements.quickAddInput.value.trim();
    if (!raw) {
      return;
    }
    const cleaned = raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (!cleaned) {
      return;
    }
    if (!currentState.blocked.includes(cleaned)) {
      storage.set({ blocked: [...currentState.blocked, cleaned] });
    }
    elements.quickAddInput.value = "";
  });

  elements.resolution.addEventListener("change", (event) => {
    if (isSettingsLocked()) {
      return;
    }
    const resolution = getEventTargetValue(event) as Resolution;
    storage.set({ resolution });
  });

  elements.counterShow.addEventListener("change", (event) => {
    const counterShow = stringToBoolean(getEventTargetValue(event));
    storage.set({ counterShow });
  });

  elements.counterPeriod.addEventListener("change", (event) => {
    const counterPeriod = getEventTargetValue(event) as CounterPeriod;
    storage.set({ counterPeriod });
  });

  elements.toggleUnlockSettingsBtn.addEventListener("click", () => {
    elements.settingsUnlockForm.hidden = !elements.settingsUnlockForm.hidden;
    elements.settingsUnlockError.hidden = true;
  });

  elements.relockSettingsBtn.addEventListener("click", () => {
    storage.set({ settingsUnlockedUntil: 0 });
  });

  elements.settingsUnlockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.settingsUnlockError.hidden = true;

    const reason = elements.settingsUnlockReason.value.trim();
    if (reason.length < MIN_SETTINGS_REASON_LENGTH) {
      elements.settingsUnlockError.textContent = t.errReasonMin(MIN_SETTINGS_REASON_LENGTH);
      elements.settingsUnlockError.hidden = false;
      return;
    }

    const { usedCodeHashes = [], customCodeHashes = [], unlockHistory = [] } = await storage.get([
      "usedCodeHashes",
      "customCodeHashes",
      "unlockHistory",
    ]);

    const activeHashes = resolveActiveHashes(customCodeHashes);
    const verification = await verifyUnlockCode(elements.settingsUnlockCode.value, usedCodeHashes, activeHashes);
    if (!verification.ok) {
      elements.settingsUnlockError.textContent = verification.error === "ALREADY_USED"
        ? t.errCodeUsed
        : t.errCodeInvalid;
      elements.settingsUnlockError.hidden = false;
      return;
    }

    const now = Date.now();
    const logEntry: UnlockLogEntry = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now,
      url: "options.html",
      rule: "SETTINGS",
      category: "OTHER",
      reason,
      durationMinutes: SETTINGS_UNLOCK_MINUTES,
      kind: "SETTINGS_UNLOCK",
    };

    await storage.set({
      usedCodeHashes: [...usedCodeHashes, verification.hash],
      settingsUnlockedUntil: now + SETTINGS_UNLOCK_MINUTES * 60_000,
      unlockHistory: [logEntry, ...unlockHistory],
    });

    elements.settingsUnlockReason.value = "";
    elements.settingsUnlockCode.value = "";
    elements.settingsUnlockForm.hidden = true;
  });

  elements.historyPeriod.addEventListener("change", () => {
    renderHistory();
  });

  elements.resetCountersBtn.addEventListener("click", () => {
    if (isSettingsLocked()) {
      return;
    }
    if (window.confirm(t.confirmResetCounters)) {
      storage.set({ counter: {} });
    }
  });

  elements.clearHistoryBtn.addEventListener("click", () => {
    if (isSettingsLocked()) {
      return;
    }
    if (window.confirm(t.confirmClearHistory)) {
      storage.set({ unlockHistory: [] });
    }
  });

  window.setInterval(() => {
    applyLockState();
  }, 15_000);

  const init = <T extends Partial<Schema>>(items: T) => {
    if (items.enabled !== undefined) {
      currentState.enabled = items.enabled;
      elements.enabled.value = booleanToString(items.enabled);
    }

    if (items.unlockMode !== undefined) {
      currentState.unlockMode = items.unlockMode;
      elements.unlockMode.value = items.unlockMode;
    }

    if (items.language !== undefined) {
      currentState.language = items.language;
      elements.language.value = items.language;
      applyLanguage(items.language);
    }

    if (items.theme !== undefined) {
      currentState.theme = items.theme;
      elements.theme.value = items.theme;
      applyTheme(items.theme);
    }

    if (items.contextMenu !== undefined) {
      elements.contextMenu.value = booleanToString(items.contextMenu);
    }

    if (items.blocked !== undefined) {
      currentState.blocked = items.blocked;
      const valueAsBlocked = stringToBlocked(elements.blockedList.value);
      if (JSON.stringify(valueAsBlocked) !== JSON.stringify(items.blocked)) {
        elements.blockedList.value = items.blocked.join("\r\n");
      }
    }

    if (items.resolution !== undefined) {
      elements.resolution.value = items.resolution;
      RESOLUTIONS.forEach((oneResolution) => {
        document.body.classList.remove(`resolution-${oneResolution}`);
      });
      document.body.classList.add(`resolution-${items.resolution}`);
    }

    if (items.counterShow !== undefined) {
      elements.counterShow.value = booleanToString(items.counterShow);
      document.body.classList.toggle("counter-show", items.counterShow);
    }

    if (items.counterPeriod !== undefined) {
      elements.counterPeriod.value = items.counterPeriod;
    }

    if (items.usedCodeHashes !== undefined) {
      currentState.usedCodeHashes = items.usedCodeHashes;
      renderCodesCounter();
    }

    if (items.customCodeHashes !== undefined) {
      currentState.customCodeHashes = items.customCodeHashes;
      renderCodesCounter();
    }

    if (items.unlockHistory !== undefined) {
      currentState.unlockHistory = items.unlockHistory;
      renderHistory();
    }

    if (items.settingsUnlockedUntil !== undefined) {
      currentState.settingsUnlockedUntil = items.settingsUnlockedUntil;
    }

    applyLockState();
  };

  return { elements, init };
})();

window.addEventListener("DOMContentLoaded", () => {
  const keys: (keyof Schema)[] = [
    "enabled",
    "unlockMode",
    "language",
    "theme",
    "contextMenu",
    "blocked",
    "resolution",
    "counterShow",
    "counterPeriod",
    "usedCodeHashes",
    "customCodeHashes",
    "unlockHistory",
    "settingsUnlockedUntil",
  ];

  storage.get(keys).then((local) => {
    UI.init(local);
    document.body.classList.add("ready");
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    keys.forEach((key) => {
      if (changes[key]) {
        UI.init({ [key]: changes[key].newValue });
      }
    });
  });
});
