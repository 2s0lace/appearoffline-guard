import storage, {
  VALIDATORS,
  CounterPeriod,
  UnlockCategory,
  UNLOCK_CATEGORIES,
  UnlockLogEntry,
  UnlockMode,
  Language,
  Theme,
} from "./storage";
import {
  resolveActiveHashes,
  verifyUnlockCode,
} from "./helpers/unlock-codes";
import { grantTemporaryUnlock } from "./helpers/temporary-unlock";
import { getTranslations, Translations } from "./helpers/i18n";
import { wakeGhost } from "./helpers/ghost-wake";
import { pushHistoryEntriesToCloud } from "./helpers/supabase-sync";

const COUNTDOWN_TOTAL_MS = 30_000;
const MIN_REASON_LENGTH = 10;
const RING_RADIUS = 124;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const url = params.get("url");
  const rule = params.get("rule");
  if (!url || !rule) {
    return;
  }

  const count = parseInt(params.get("count") || "", 10);
  const period = params.get("period");

  const siteRuleEl = document.getElementById("site-rule") as HTMLSpanElement;
  const siteCountEl = document.getElementById("site-count") as HTMLSpanElement;
  siteRuleEl.textContent = rule;

  const ringWrapper = document.getElementById("ring-wrapper") as HTMLDivElement;
  const ringProgress = document.getElementById("ring-progress") as unknown as SVGCircleElement;
  const countdownNumber = document.getElementById("countdown-number") as HTMLSpanElement;
  const numberBlurVeil = document.getElementById("number-blur-veil") as HTMLDivElement;
  const countdownLabel = document.getElementById("countdown-label") as HTMLSpanElement;
  const countdownPausedHint = document.getElementById("countdown-paused-hint") as HTMLDivElement;

  const drawerToggle = document.getElementById("drawer-toggle") as HTMLButtonElement;
  const drawerToggleText = document.getElementById("drawer-toggle-text") as HTMLSpanElement;
  const unlockDrawer = document.getElementById("unlock-drawer") as HTMLDivElement;
  const unlockForm = document.getElementById("unlock-form") as HTMLFormElement;
  const reasonInput = document.getElementById("reason-input") as HTMLTextAreaElement;
  const reasonCounter = document.getElementById("reason-counter") as HTMLSpanElement;
  const durationSelect = document.getElementById("duration-select") as HTMLSelectElement;
  const aiCodeInput = document.getElementById("ai-code-input") as HTMLInputElement;
  const formError = document.getElementById("form-error") as HTMLDivElement;
  const unlockButton = document.getElementById("unlock-button") as HTMLButtonElement;
  const closeTabButton = document.getElementById("close-tab-button") as HTMLButtonElement;
  const historyLink = document.getElementById("history-link") as HTMLAnchorElement;
  const settingsLink = document.getElementById("settings-link") as HTMLAnchorElement;

  ringProgress.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ringProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

  let elapsedMs = 0;
  let lastFrameTime: number | null = null;
  let lastDisplayedStep = 30;
  let currentMode: UnlockMode = "PAUSE_AND_REASON";
  let t: Translations = getTranslations("pl");

  const getRemainingSeconds = () =>
    Math.max(0, Math.ceil((COUNTDOWN_TOTAL_MS - elapsedMs) / 1000));

  const getDisplayedStep = () => {
    const remainingMs = Math.max(0, COUNTDOWN_TOTAL_MS - elapsedMs);
    return Math.ceil(remainingMs / 3000) * 3;
  };

  let swapTimerId: number | null = null;
  let clearTimerId: number | null = null;

  const morphDisplayedNumber = (nextValue: number) => {
    if (swapTimerId !== null) {
      window.clearTimeout(swapTimerId);
    }
    if (clearTimerId !== null) {
      window.clearTimeout(clearTimerId);
    }

    numberBlurVeil.classList.remove("is-pulsing");
    countdownNumber.classList.remove("is-pulsing");
    void numberBlurVeil.offsetWidth;
    numberBlurVeil.classList.add("is-pulsing");
    countdownNumber.classList.add("is-pulsing");

    swapTimerId = window.setTimeout(() => {
      countdownNumber.textContent = String(nextValue);
      swapTimerId = null;
    }, 340);

    clearTimerId = window.setTimeout(() => {
      numberBlurVeil.classList.remove("is-pulsing");
      countdownNumber.classList.remove("is-pulsing");
      clearTimerId = null;
    }, 700);
  };

  const getSelectedCategory = (): UnlockCategory | null => {
    const checked = unlockForm.querySelector<HTMLInputElement>("input[name='category']:checked");
    if (!checked) {
      return null;
    }
    const val = checked.value as UnlockCategory;
    return UNLOCK_CATEGORIES.includes(val) ? val : null;
  };

  const showError = (text: string) => {
    formError.textContent = text;
    formError.hidden = false;
  };

  const clearError = () => {
    formError.textContent = "";
    formError.hidden = true;
  };

  const updateSubmitState = () => {
    const reasonLen = reasonInput.value.trim().length;
    const hasCategory = getSelectedCategory() !== null;
    const requiresCode = currentMode === "PAUSE_REASON_AND_CODE";
    const hasCode = !requiresCode || aiCodeInput.value.trim().length > 0;
    // A one-time code is already a deliberate permission, so it skips the 30s pause.
    const countdownDone = elapsedMs >= COUNTDOWN_TOTAL_MS || requiresCode;

    reasonCounter.textContent = reasonLen >= MIN_REASON_LENGTH
      ? t.charsOk(reasonLen)
      : t.charsMin(reasonLen, MIN_REASON_LENGTH);
    reasonCounter.parentElement?.classList.toggle("valid", reasonLen >= MIN_REASON_LENGTH);

    if (!countdownDone) {
      unlockButton.textContent = t.waitBtn;
      unlockButton.disabled = true;
      return;
    }

    const mins = durationSelect.value || "15";
    unlockButton.textContent = t.unlockForBtn(mins);
    unlockButton.disabled = !(hasCategory && reasonLen >= MIN_REASON_LENGTH && hasCode);
  };

  const applyTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme === "DARK" ? "dark" : "light";
  };

  const applyLanguage = (lang: Language) => {
    t = getTranslations(lang);
    document.documentElement.lang = lang;
    document.title = t.blockedTitle;

    if (!isNaN(count) && VALIDATORS.counterPeriod(period)) {
      siteCountEl.textContent = `· ${count}× ${t.periods[period as CounterPeriod]}`;
      siteCountEl.hidden = false;
    }

    countdownLabel.textContent = elapsedMs >= COUNTDOWN_TOTAL_MS ? t.stillWantLabel : t.breatheLabel;
    countdownPausedHint.textContent = t.pausedHint;
    drawerToggleText.textContent = t.enterReasonToggle;
    reasonInput.placeholder = t.reasonPlaceholder;
    aiCodeInput.placeholder = t.codePlaceholder;

    closeTabButton.title = t.closeTabTooltip;
    closeTabButton.setAttribute("aria-label", t.closeTabTooltip);
    historyLink.title = t.historyTooltip;
    historyLink.setAttribute("aria-label", t.historyTooltip);
    settingsLink.title = t.settingsTooltip;
    settingsLink.setAttribute("aria-label", t.settingsTooltip);

    UNLOCK_CATEGORIES.forEach((cat) => {
      const span = document.querySelector<HTMLSpanElement>(`[data-cat-label="${cat}"]`);
      if (span) {
        span.textContent = t.categories[cat];
      }
    });

    updateSubmitState();
  };

  const renderFrame = (timestamp: number) => {
    if (document.visibilityState === "visible") {
      countdownPausedHint.hidden = true;
      if (lastFrameTime !== null) {
        elapsedMs = Math.min(COUNTDOWN_TOTAL_MS, elapsedMs + (timestamp - lastFrameTime));
      }
      lastFrameTime = timestamp;
    } else {
      lastFrameTime = null;
      if (elapsedMs < COUNTDOWN_TOTAL_MS) {
        countdownPausedHint.hidden = false;
      }
    }

    const progress = elapsedMs / COUNTDOWN_TOTAL_MS;
    ringProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE * (1 - progress)}`;

    const displayedStep = getDisplayedStep();
    if (displayedStep !== lastDisplayedStep) {
      lastDisplayedStep = displayedStep;
      morphDisplayedNumber(displayedStep);
      updateSubmitState();
    }

    if (elapsedMs >= COUNTDOWN_TOTAL_MS) {
      if (lastDisplayedStep !== 0) {
        lastDisplayedStep = 0;
        morphDisplayedNumber(0);
      }
      countdownLabel.textContent = t.stillWantLabel;
      ringWrapper.classList.add("done");
      wakeGhost(document.getElementById("blocked-ghost") as SVGSVGElement | null);
      countdownPausedHint.hidden = true;
      updateSubmitState();
      return;
    }

    window.requestAnimationFrame(renderFrame);
  };

  updateSubmitState();
  window.requestAnimationFrame(renderFrame);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      lastFrameTime = null;
      if (elapsedMs < COUNTDOWN_TOTAL_MS) {
        countdownPausedHint.hidden = false;
      }
    }
  });

  drawerToggle.addEventListener("click", () => {
    const isOpen = unlockDrawer.dataset.open === "true";
    drawerToggle.setAttribute("aria-expanded", String(!isOpen));
    unlockDrawer.dataset.open = String(!isOpen);
    if (!isOpen) {
      window.setTimeout(() => reasonInput.focus(), 180);
    }
  });

  unlockForm.addEventListener("change", () => {
    clearError();
    updateSubmitState();
  });

  const autoResizeReason = () => {
    reasonInput.style.height = "auto";
    const maxHeight = 180;
    const nextHeight = Math.min(reasonInput.scrollHeight, maxHeight);
    reasonInput.style.height = `${nextHeight}px`;
    reasonInput.style.overflowY = reasonInput.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  reasonInput.addEventListener("input", () => {
    autoResizeReason();
    clearError();
    updateSubmitState();
  });

  aiCodeInput.addEventListener("input", () => {
    clearError();
    updateSubmitState();
  });

  closeTabButton.addEventListener("click", () => {
    if (chrome.tabs && chrome.tabs.getCurrent) {
      chrome.tabs.getCurrent((tab) => {
        if (tab?.id) {
          chrome.tabs.remove(tab.id);
        } else {
          window.close();
        }
      });
    } else {
      window.close();
    }
  });

  storage.get(["unlockMode", "language", "theme"]).then(({
    unlockMode,
    language,
    theme,
  }) => {
    currentMode = unlockMode || "PAUSE_AND_REASON";
    aiCodeInput.hidden = currentMode !== "PAUSE_REASON_AND_CODE";
    applyTheme(theme || "LIGHT");
    applyLanguage(language || "pl");
    document.body.classList.add("ready");
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes["theme"]) {
      applyTheme(changes["theme"].newValue as Theme);
    }
    if (changes["language"]) {
      applyLanguage(changes["language"].newValue as Language);
    }
    if (changes["unlockMode"]) {
      currentMode = changes["unlockMode"].newValue as UnlockMode;
      aiCodeInput.hidden = currentMode !== "PAUSE_REASON_AND_CODE";
      updateSubmitState();
    }
  });

  unlockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    if (elapsedMs < COUNTDOWN_TOTAL_MS && currentMode !== "PAUSE_REASON_AND_CODE") {
      showError(t.errWait(getRemainingSeconds()));
      return;
    }

    const category = getSelectedCategory();
    if (!category) {
      showError(t.errCategory);
      return;
    }

    const reason = reasonInput.value.trim();
    if (reason.length < MIN_REASON_LENGTH) {
      showError(t.errReasonMin(MIN_REASON_LENGTH));
      return;
    }

    const durationMinutes = parseInt(durationSelect.value, 10) || 15;

    unlockButton.disabled = true;
    unlockButton.textContent = t.unlockingBtn;

    const {
      unlockMode = "PAUSE_AND_REASON",
      usedCodeHashes = [],
      customCodeHashes = [],
      temporaryUnlocks = {},
      unlockHistory = [],
      accountSession = null,
    } = await storage.get([
      "unlockMode",
      "usedCodeHashes",
      "customCodeHashes",
      "temporaryUnlocks",
      "unlockHistory",
      "accountSession",
    ]);

    let nextUsedCodeHashes = usedCodeHashes;

    if (unlockMode === "PAUSE_REASON_AND_CODE") {
      const activeHashes = resolveActiveHashes(customCodeHashes);
      const verification = await verifyUnlockCode(aiCodeInput.value, usedCodeHashes, activeHashes);
      if (!verification.ok) {
        if (verification.error === "ALREADY_USED") {
          showError(t.errCodeUsed);
        } else if (verification.error === "INVALID") {
          showError(t.errCodeInvalid);
        } else {
          showError(t.errCodeEmpty);
        }
        updateSubmitState();
        return;
      }
      nextUsedCodeHashes = [...usedCodeHashes, verification.hash];
    }

    const now = Date.now();
    const { temporaryUnlocks: nextTemporaryUnlocks } = grantTemporaryUnlock(
      rule,
      durationMinutes,
      temporaryUnlocks,
      now,
    );

    const logEntry: UnlockLogEntry = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now,
      url,
      rule,
      category,
      reason,
      durationMinutes,
      kind: "SITE_UNLOCK",
    };

    await storage.set({
      usedCodeHashes: nextUsedCodeHashes,
      temporaryUnlocks: nextTemporaryUnlocks,
      unlockHistory: [logEntry, ...unlockHistory],
    });

    if (accountSession) {
      await Promise.race([
        pushHistoryEntriesToCloud(accountSession, [logEntry]),
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ]);
    }

    window.location.replace(url);
  });
});
