import storage, {
  Schema,
  Resolution,
  CounterPeriod,
  RESOLUTIONS,
  BLOCKED_EXAMPLE,
  UnlockLogEntry,
  UnlockMode,
  Language,
  Theme,
  COUNTER_PERIODS,
} from "./storage";
import {
  generateCodeBatch,
  getRemainingCodesCount,
  getTotalCodesCount,
  resolveActiveHashes,
  verifyUnlockCode,
} from "./helpers/unlock-codes";
import { sealCodesForAi } from "./helpers/code-seal";
import { getTranslations, Translations } from "./helpers/i18n";
import { formatRemaining, getEmergencyUnlockState } from "./helpers/emergency-unlock";
import { setupBackButton } from "./helpers/back-button";

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
    backBtn: document.getElementById("back-btn") as HTMLButtonElement,
    showLastBatchBtn: document.getElementById("show-last-batch-btn") as HTMLButtonElement,
    emergencyDesc: document.getElementById("emergency-desc") as HTMLSpanElement,
    emergencyRequestBtn: document.getElementById("emergency-request-btn") as HTMLButtonElement,
    emergencyCancelBtn: document.getElementById("emergency-cancel-btn") as HTMLButtonElement,
    emergencyConfirmBtn: document.getElementById("emergency-confirm-btn") as HTMLButtonElement,
  };

  elements.blockedList.placeholder = BLOCKED_EXAMPLE.join("\n");

  const currentState: Pick<
    Schema,
    "enabled" | "unlockMode" | "language" | "theme" | "blocked" | "usedCodeHashes" | "customCodeHashes" | "settingsUnlockedUntil"
    | "emergencyUnlockRequestedAt" | "lastSealedBatch"
  > = {
    enabled: false,
    unlockMode: "PAUSE_AND_REASON",
    language: "pl",
    theme: "LIGHT",
    blocked: [],
    usedCodeHashes: [],
    customCodeHashes: [],
    settingsUnlockedUntil: 0,
    emergencyUnlockRequestedAt: 0,
    lastSealedBatch: "",
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
    const countValue = document.getElementById("codes-count-value");
    const meterFill = document.getElementById("codes-meter-fill");
    if (countValue) {
      countValue.textContent = String(remaining);
    }
    if (meterFill) {
      const ratio = total > 0 ? remaining / total : 0;
      meterFill.style.width = `${Math.round(ratio * 100)}%`;
      meterFill.classList.toggle("low", ratio <= 0.2);
    }
  };

  const renderEmergencyState = () => {
    const state = getEmergencyUnlockState(currentState.emergencyUnlockRequestedAt, Date.now());
    elements.emergencyRequestBtn.hidden = state.status !== "IDLE";
    elements.emergencyCancelBtn.hidden = state.status === "IDLE";
    elements.emergencyConfirmBtn.hidden = state.status !== "READY";
    elements.emergencyDesc.classList.toggle("waiting", state.status === "WAITING");
    if (state.status === "WAITING") {
      const { hours, minutes } = formatRemaining(state.remainingMs);
      elements.emergencyDesc.textContent = t.emergencyWaiting(hours, minutes);
    } else if (state.status === "READY") {
      elements.emergencyDesc.textContent = t.emergencyReady;
    } else {
      elements.emergencyDesc.textContent = t.emergencyDesc;
    }
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
    elements.showLastBatchBtn.hidden = !currentState.lastSealedBatch;

    renderEmergencyState();
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
    setText("codes-pool-desc", t.codesPoolDesc);
    setText("generate-codes-btn", t.generateCodesBtn);
    setText("generated-title", t.generatedTitle);
    setText("generated-desc", t.generatedDesc);
    setText("copy-codes-btn", t.copyCodesBtn);
    setText("hide-codes-btn", t.hideCodesBtn);
    setText("show-last-batch-btn", t.showLastBatchBtn);
    setText("emergency-title", t.emergencyTitle);
    setText("emergency-request-btn", t.emergencyRequestBtn);
    setText("emergency-cancel-btn", t.emergencyCancelBtn);
    setText("emergency-confirm-btn", t.emergencyConfirmBtn);
    setText("label-context-menu", t.contextMenuLabel);
    setText("quick-add-btn", t.addSiteBtn);
    setText("blocked-sites-heading", t.blockedSitesHeading);
    setText("label-resolution", t.resolutionLabel);
    setText("opt-res-page", t.resShowPage);
    setText("opt-res-close", t.resCloseTab);
    setText("label-counter-show", t.showCounterLabel);
    setText("label-counter-period", t.counterPeriodLabel);
    setText("history-nav-link", t.historyNavLink);
    elements.backBtn.textContent = `← ${t.backBtn}`;

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

    renderCodesCounter();
    applyLockState();
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
      const sealedBlob = sealCodesForAi(codes);
      await storage.set({
        customCodeHashes: hashes,
        usedCodeHashes: [],
        // Sealed with the AI's public key, so keeping it lets the user re-copy it without revealing codes.
        lastSealedBatch: sealedBlob,
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

  elements.showLastBatchBtn.addEventListener("click", () => {
    if (!currentState.lastSealedBatch) {
      return;
    }
    elements.generatedCodesOutput.value = currentState.lastSealedBatch;
    elements.generatedCodesBox.hidden = false;
  });

  elements.emergencyRequestBtn.addEventListener("click", () => {
    storage.set({ emergencyUnlockRequestedAt: Date.now() });
  });

  elements.emergencyCancelBtn.addEventListener("click", () => {
    storage.set({ emergencyUnlockRequestedAt: 0 });
  });

  elements.emergencyConfirmBtn.addEventListener("click", async () => {
    elements.settingsUnlockError.hidden = true;

    const { emergencyUnlockRequestedAt = 0, unlockHistory = [] } = await storage.get([
      "emergencyUnlockRequestedAt",
      "unlockHistory",
    ]);
    if (getEmergencyUnlockState(emergencyUnlockRequestedAt, Date.now()).status !== "READY") {
      renderEmergencyState();
      return;
    }

    const reason = elements.settingsUnlockReason.value.trim();
    if (reason.length < MIN_SETTINGS_REASON_LENGTH) {
      elements.settingsUnlockError.textContent = t.errReasonMin(MIN_SETTINGS_REASON_LENGTH);
      elements.settingsUnlockError.hidden = false;
      elements.settingsUnlockReason.focus();
      return;
    }

    const now = Date.now();
    const logEntry: UnlockLogEntry = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now,
      url: "options.html",
      rule: "SETTINGS",
      category: "OTHER",
      reason: `${t.emergencyHistoryPrefix}${reason}`,
      durationMinutes: SETTINGS_UNLOCK_MINUTES,
      kind: "SETTINGS_UNLOCK",
    };

    await storage.set({
      emergencyUnlockRequestedAt: 0,
      settingsUnlockedUntil: now + SETTINGS_UNLOCK_MINUTES * 60_000,
      unlockHistory: [logEntry, ...unlockHistory],
    });

    elements.settingsUnlockReason.value = "";
    elements.settingsUnlockForm.hidden = true;
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

  setupBackButton(elements.backBtn);

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

    if (items.settingsUnlockedUntil !== undefined) {
      currentState.settingsUnlockedUntil = items.settingsUnlockedUntil;
    }

    if (items.emergencyUnlockRequestedAt !== undefined) {
      currentState.emergencyUnlockRequestedAt = items.emergencyUnlockRequestedAt;
    }

    if (items.lastSealedBatch !== undefined) {
      currentState.lastSealedBatch = items.lastSealedBatch;
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
    "settingsUnlockedUntil",
    "emergencyUnlockRequestedAt",
    "lastSealedBatch",
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
