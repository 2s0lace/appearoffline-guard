import { Schema } from "../storage";

type LockState = Pick<Schema, "enabled" | "unlockMode" | "settingsUnlockedUntil">;

export const isStrictMode = (state: Pick<Schema, "unlockMode">) =>
  state.unlockMode === "PAUSE_REASON_AND_CODE";

// Strict mode protects destructive changes (disabling, deleting history...) until unlocked with a code.
export const isSettingsLocked = (state: LockState, now: number) =>
  state.enabled && isStrictMode(state) && state.settingsUnlockedUntil <= now;
