import {
  EMERGENCY_UNLOCK_DELAY_MS,
  formatRemaining,
  getEmergencyUnlockState,
} from "../emergency-unlock";

test("getEmergencyUnlockState() is IDLE without a request", () => {
  expect(getEmergencyUnlockState(0, 1_000)).toEqual({ status: "IDLE" });
});

test("getEmergencyUnlockState() waits for the full delay, then becomes READY", () => {
  const requestedAt = 1_000_000;
  expect(getEmergencyUnlockState(requestedAt, requestedAt)).toEqual({
    status: "WAITING",
    remainingMs: EMERGENCY_UNLOCK_DELAY_MS,
  });
  expect(getEmergencyUnlockState(requestedAt, requestedAt + EMERGENCY_UNLOCK_DELAY_MS - 1)).toEqual({
    status: "WAITING",
    remainingMs: 1,
  });
  expect(getEmergencyUnlockState(requestedAt, requestedAt + EMERGENCY_UNLOCK_DELAY_MS)).toEqual({ status: "READY" });
});

test("formatRemaining() rounds up to whole minutes", () => {
  expect(formatRemaining(EMERGENCY_UNLOCK_DELAY_MS)).toEqual({ hours: 24, minutes: 0 });
  expect(formatRemaining(61 * 60_000 + 1)).toEqual({ hours: 1, minutes: 2 });
  expect(formatRemaining(1)).toEqual({ hours: 0, minutes: 1 });
});
