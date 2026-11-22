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
import {
  refreshSession,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from "./helpers/supabase-auth";
import {
  pushSettingsToCloud,
  syncAllWithCloud,
} from "./helpers/supabase-sync";

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
    generateFriendCodesBtn: document.getElementById("generate-friend-codes-btn") as HTMLButtonElement,
    generatedCodesBox: document.getElementById("generated-codes-box") as HTMLDivElement,
    generatedCodesOutput: document.getElementById("generated-codes-output") as HTMLTextAreaElement,
    generatedTitle: document.getElementById("generated-title") as HTMLElement,
    generatedDesc: document.getElementById("generated-desc") as HTMLSpanElement,
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
    accountConnected: document.getElementById("account-connected") as HTMLDivElement,
    accountEmailLabel: document.getElementById("account-email-label") as HTMLSpanElement,
    accountSyncBtn: document.getElementById("account-sync-btn") as HTMLButtonElement,
    accountSignOutBtn: document.getElementById("account-signout-btn") as HTMLButtonElement,
    accountForm: document.getElementById("account-form") as HTMLFormElement,
    accountEmail: document.getElementById("account-email") as HTMLInputElement,
    accountPassword: document.getElementById("account-password") as HTMLInputElement,
    accountSignInBtn: document.getElementById("account-signin-btn") as HTMLButtonElement,
    accountSignUpBtn: document.getElementById("account-signup-btn") as HTMLButtonElement,
    accountMessage: document.getElementById("account-message") as HTMLDivElement,
  };

  elements.blockedList.placeholder = BLOCKED_EXAMPLE.join("\n");

  const currentState: Pick<
    Schema,
    "enabled" | "unlockMode" | "language" | "theme" | "blocked" | "usedCodeHashes" | "customCodeHashes" | "settingsUnlockedUntil"
    | "emergencyUnlockRequestedAt" | "lastSealedBatch" | "accountSession"
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
    accountSession: null,
  };

  let t: Translations = getTranslations("pl");
  let generatedBoxMode: "AI" | "FRIEND" = "AI";
  let pendingFriendPayload = "";

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

  const renderAccountState = () => {
    const session = currentState.accountSession;
    const isSignedIn = Boolean(session && session.accessToken);
    elements.accountConnected.hidden = !isSignedIn;
    elements.accountForm.hidden = isSignedIn;
    if (isSignedIn && session) {
      elements.accountEmailLabel.textContent = t.accountConnectedAs(session.user.email);
    }
  };

  const showAccountMessage = (text: string, isError = false) => {
    elements.accountMessage.textContent = text;
    elements.accountMessage.classList.toggle("is-error", isError);
    elements.accountMessage.hidden = !text;
  };

  const setAccountBusy = (busy: boolean) => {
    elements.accountSignInBtn.disabled = busy;
    elements.accountSignUpBtn.disabled = busy;
    elements.accountEmail.disabled = busy;
    elements.accountPassword.disabled = busy;
    elements.accountSignInBtn.textContent = busy ? t.accountSigningIn : t.accountSignInBtn;
  };

  const runCloudSync = async () => {
    elements.accountSyncBtn.disabled = true;
    elements.accountSyncBtn.textContent = t.accountSyncing;
    try {
      const res = await syncAllWithCloud();
      if (!res.ok) {
        showAccountMessage(res.error, true);
        return;
      }
      const timeStr = new Date(res.syncedAt).toLocaleTimeString(t.locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
      showAccountMessage(t.accountSyncedAt(timeStr, res.historyCount), false);
    } finally {
      elements.accountSyncBtn.disabled = false;
      elements.accountSyncBtn.textContent = t.accountSyncNowBtn;
    }
  };

  let settingsPushTimer: number | null = null;
  const scheduleSettingsCloudPush = () => {
    if (!currentState.accountSession) {
      return;
    }
    if (settingsPushTimer !== null) {
      window.clearTimeout(settingsPushTimer);
    }
    settingsPushTimer = window.setTimeout(() => {
      settingsPushTimer = null;
      storage.get([
        "accountSession",
        "blocked",
        "unlockMode",
        "language",
        "theme",
        "resolution",
        "counterShow",
        "counterPeriod",
      ]).then((s) => {
        if (!s.accountSession) {
          return;
        }
        pushSettingsToCloud(s.accountSession, {
          blocked: s.blocked || [],
          unlockMode: s.unlockMode || "PAUSE_AND_REASON",
          language: s.language || "pl",
          theme: s.theme || "LIGHT",
          resolution: s.resolution || "SHOW_BLOCKED_INFO_PAGE",
          counterShow: s.counterShow ?? true,
          counterPeriod: s.counterPeriod || "ALL_TIME",
        });
      });
    }, 800);
  };

  const handleAccountAuth = async (mode: "SIGN_IN" | "SIGN_UP") => {
    showAccountMessage("");
    const email = elements.accountEmail.value.trim();
    const password = elements.accountPassword.value;
    if (!email || password.length < 6) {
      showAccountMessage(t.accountFillFields, true);
      return;
    }

    setAccountBusy(true);
    try {
      const result = mode === "SIGN_IN"
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password);

      if (!result.ok) {
        showAccountMessage(result.error, true);
        return;
      }

      if (result.status === "CONFIRM_EMAIL") {
        showAccountMessage(t.accountConfirmEmail(result.email), false);
        elements.accountPassword.value = "";
        return;
      }

      await storage.set({ accountSession: result.session });
      currentState.accountSession = result.session;
      elements.accountEmail.value = "";
      elements.accountPassword.value = "";
      showAccountMessage(t.accountSignedInOk, false);
      await runCloudSync();
    } finally {
      setAccountBusy(false);
    }
  };

  elements.accountSyncBtn.addEventListener("click", () => {
    runCloudSync();
  });

  elements.accountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAccountAuth("SIGN_IN");
  });

  elements.accountSignUpBtn.addEventListener("click", () => {
    handleAccountAuth("SIGN_UP");
  });

  elements.accountSignOutBtn.addEventListener("click", async () => {
    const token = currentState.accountSession?.accessToken;
    await storage.set({ accountSession: null });
    showAccountMessage("");
    if (token) {
      await signOut(token);
    }
  });

  const renderBlockedSitesHeading = () => {
    const heading = document.getElementById("blocked-sites-heading");
    if (!heading) {
      return;
    }
    const count = currentState.blocked.filter((line) => line.trim() && !line.trim().startsWith("#")).length;
    heading.textContent = `${t.blockedSitesHeading} (${count})`;
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
    elements.generateFriendCodesBtn.disabled = locked;
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
    setText("generate-friend-codes-btn", t.generateFriendCodesBtn);
    setText("generated-title", generatedBoxMode === "FRIEND" ? t.friendGeneratedTitle : t.generatedTitle);
    setText("generated-desc", generatedBoxMode === "FRIEND" ? t.friendGeneratedDesc : t.generatedDesc);
    setText("copy-codes-btn", generatedBoxMode === "FRIEND" ? t.copyFriendCodesBtn : t.copyCodesBtn);
    setText("hide-codes-btn", generatedBoxMode === "FRIEND" ? t.clearFriendClipboardBtn : t.hideCodesBtn);
    setText("show-last-batch-btn", t.showLastBatchBtn);
    setText("emergency-title", t.emergencyTitle);
    setText("emergency-request-btn", t.emergencyRequestBtn);
    setText("emergency-cancel-btn", t.emergencyCancelBtn);
    setText("emergency-confirm-btn", t.emergencyConfirmBtn);
    setText("label-context-menu", t.contextMenuLabel);
    setText("quick-add-btn", t.addSiteBtn);
    renderBlockedSitesHeading();
    setText("label-resolution", t.resolutionLabel);
    setText("opt-res-page", t.resShowPage);
    setText("opt-res-close", t.resCloseTab);
    setText("label-counter-show", t.showCounterLabel);
    setText("label-counter-period", t.counterPeriodLabel);
    setText("history-nav-link", t.historyNavLink);
    setText("account-title", t.accountTitle);
    setText("account-desc", t.accountDesc);
    setText("account-signin-btn", t.accountSignInBtn);
    setText("account-signup-btn", t.accountSignUpBtn);
    setText("account-sync-btn", t.accountSyncNowBtn);
    setText("account-signout-btn", t.accountSignOutBtn);
    elements.accountEmail.placeholder = t.accountEmailPlaceholder;
    elements.accountPassword.placeholder = t.accountPasswordPlaceholder;
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
    renderAccountState();
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
    scheduleSettingsCloudPush();
  });

  elements.language.addEventListener("change", (event) => {
    const language = getEventTargetValue(event) as Language;
    storage.set({ language });
    scheduleSettingsCloudPush();
  });

  elements.theme.addEventListener("change", (event) => {
    const theme = getEventTargetValue(event) as Theme;
    storage.set({ theme });
    scheduleSettingsCloudPush();
  });

  const showAiBatchBox = (sealedBlob: string) => {
    generatedBoxMode = "AI";
    pendingFriendPayload = "";
    elements.generatedTitle.textContent = t.generatedTitle;
    elements.generatedDesc.textContent = t.generatedDesc;
    elements.copyCodesBtn.textContent = t.copyCodesBtn;
    elements.hideCodesBtn.textContent = t.hideCodesBtn;
    elements.generatedCodesOutput.hidden = false;
    elements.generatedCodesOutput.value = sealedBlob;
    elements.generatedCodesBox.hidden = false;
  };

  const showFriendBatchBox = (payload: string) => {
    generatedBoxMode = "FRIEND";
    pendingFriendPayload = payload;
    elements.generatedTitle.textContent = t.friendGeneratedTitle;
    elements.generatedDesc.textContent = t.friendGeneratedDesc;
    elements.copyCodesBtn.textContent = t.copyFriendCodesBtn;
    elements.hideCodesBtn.textContent = t.clearFriendClipboardBtn;
    elements.generatedCodesOutput.value = "";
    elements.generatedCodesOutput.hidden = true;
    elements.generatedCodesBox.hidden = false;
  };

  elements.generateCodesBtn.addEventListener("click", async () => {
    if (isSettingsLocked()) {
      return;
    }
    elements.generateCodesBtn.disabled = true;
    elements.generateFriendCodesBtn.disabled = true;
    try {
      const { codes, hashes } = await generateCodeBatch(50);
      const sealedBlob = sealCodesForAi(codes);
      await storage.set({
        customCodeHashes: hashes,
        usedCodeHashes: [],
        // Sealed with the AI's public key, so keeping it lets the user re-copy it without revealing codes.
        lastSealedBatch: sealedBlob,
      });
      showAiBatchBox(sealedBlob);
    } finally {
      applyLockState();
    }
  });

  elements.generateFriendCodesBtn.addEventListener("click", async () => {
    if (isSettingsLocked()) {
      return;
    }
    elements.generateCodesBtn.disabled = true;
    elements.generateFriendCodesBtn.disabled = true;
    try {
      const { codes, hashes } = await generateCodeBatch(50);
      const formattedMessage = [
        t.friendCodesMessageHeader,
        "",
        ...codes.map((code, idx) => `${idx + 1}. ${code}`),
      ].join("\n");

      await storage.set({
        customCodeHashes: hashes,
        usedCodeHashes: [],
        lastSealedBatch: "",
      });

      try {
        await navigator.clipboard.writeText(formattedMessage);
      } catch {
        // Clipboard permission might fail if window lost focus; user can click Copy again.
      }

      showFriendBatchBox(formattedMessage);
    } finally {
      applyLockState();
    }
  });

  elements.copyCodesBtn.addEventListener("click", async () => {
    const textToCopy = generatedBoxMode === "FRIEND"
      ? pendingFriendPayload
      : elements.generatedCodesOutput.value;
    const defaultLabel = generatedBoxMode === "FRIEND"
      ? t.copyFriendCodesBtn
      : t.copyCodesBtn;

    try {
      await navigator.clipboard.writeText(textToCopy);
      elements.copyCodesBtn.textContent = t.copiedBtn;
      window.setTimeout(() => {
        elements.copyCodesBtn.textContent = defaultLabel;
      }, 2000);
    } catch {
      if (generatedBoxMode === "AI") {
        elements.generatedCodesOutput.select();
      }
    }
  });

  elements.showLastBatchBtn.addEventListener("click", () => {
    if (!currentState.lastSealedBatch) {
      return;
    }
    showAiBatchBox(currentState.lastSealedBatch);
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

  elements.hideCodesBtn.addEventListener("click", async () => {
    if (generatedBoxMode === "FRIEND") {
      pendingFriendPayload = "";
      try {
        await navigator.clipboard.writeText("");
      } catch {
        // Ignore clipboard clear errors.
      }
    }
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
    scheduleSettingsCloudPush();
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
      scheduleSettingsCloudPush();
    }
    elements.quickAddInput.value = "";
  });

  elements.resolution.addEventListener("change", (event) => {
    if (isSettingsLocked()) {
      return;
    }
    const resolution = getEventTargetValue(event) as Resolution;
    storage.set({ resolution });
    scheduleSettingsCloudPush();
  });

  elements.counterShow.addEventListener("change", (event) => {
    const counterShow = stringToBoolean(getEventTargetValue(event));
    storage.set({ counterShow });
    scheduleSettingsCloudPush();
  });

  elements.counterPeriod.addEventListener("change", (event) => {
    const counterPeriod = getEventTargetValue(event) as CounterPeriod;
    storage.set({ counterPeriod });
    scheduleSettingsCloudPush();
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
      renderBlockedSitesHeading();
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

    if (items.accountSession !== undefined) {
      currentState.accountSession = items.accountSession;
      renderAccountState();
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
    "accountSession",
  ];

  storage.get(keys).then((local) => {
    UI.init(local);
    document.body.classList.add("ready");

    const session = local.accountSession;
    if (session && session.refreshToken && session.expiresAt < Date.now() + 60_000) {
      refreshSession(session.refreshToken).then((refreshed) => {
        storage.set({ accountSession: refreshed });
        if (refreshed) {
          void syncAllWithCloud();
        }
      });
    } else if (session && session.accessToken) {
      void syncAllWithCloud();
    }
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    keys.forEach((key) => {
      if (changes[key]) {
        UI.init({ [key]: changes[key].newValue });
      }
    });
  });
});
