import { isSettingsLocked } from "../settings-lock";

const NOW = 1_000_000;

test("isSettingsLocked() locks only enabled strict mode without an active unlock", () => {
  expect(isSettingsLocked({ enabled: true, unlockMode: "PAUSE_REASON_AND_CODE", settingsUnlockedUntil: 0 }, NOW)).toBe(true);
  expect(isSettingsLocked({ enabled: true, unlockMode: "PAUSE_REASON_AND_CODE", settingsUnlockedUntil: NOW + 1 }, NOW)).toBe(false);
  expect(isSettingsLocked({ enabled: true, unlockMode: "PAUSE_AND_REASON", settingsUnlockedUntil: 0 }, NOW)).toBe(false);
  expect(isSettingsLocked({ enabled: false, unlockMode: "PAUSE_REASON_AND_CODE", settingsUnlockedUntil: 0 }, NOW)).toBe(false);
});
