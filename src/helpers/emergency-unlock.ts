// Fallback for strict mode when the user lost their one-time codes:
// request an emergency unlock, wait a long cooldown, then unlock settings once without a code.

export const EMERGENCY_UNLOCK_DELAY_MS = 24 * 60 * 60 * 1000;

export type EmergencyUnlockState =
  | { status: "IDLE" }
  | { status: "WAITING"; remainingMs: number }
  | { status: "READY" };

export const getEmergencyUnlockState = (
  requestedAt: number,
  now: number,
  delayMs = EMERGENCY_UNLOCK_DELAY_MS,
): EmergencyUnlockState => {
  if (!requestedAt || requestedAt <= 0) {
    return { status: "IDLE" };
  }
  const remainingMs = requestedAt + delayMs - now;
  return remainingMs > 0
    ? { status: "WAITING", remainingMs }
    : { status: "READY" };
};

export const formatRemaining = (remainingMs: number): { hours: number; minutes: number } => {
  const totalMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
};
