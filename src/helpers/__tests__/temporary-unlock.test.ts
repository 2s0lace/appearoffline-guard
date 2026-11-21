import {
  grantTemporaryUnlock,
  isRuleTemporarilyUnlocked,
  pruneExpiredUnlocks,
  getSoonestUnlockExpiry,
} from "../temporary-unlock";

test("temporary unlock lifecycle works as expected", () => {
  const now = 1_700_000_000_000;
  const { temporaryUnlocks, expiresAt } = grantTemporaryUnlock("reddit.com", 15, {}, now);

  expect(expiresAt).toBe(now + 15 * 60_000);
  expect(isRuleTemporarilyUnlocked("reddit.com", temporaryUnlocks, now + 1000)).toBe(true);
  expect(isRuleTemporarilyUnlocked("reddit.com", temporaryUnlocks, expiresAt)).toBe(false);
  expect(isRuleTemporarilyUnlocked("youtube.com", temporaryUnlocks, now + 1000)).toBe(false);

  expect(getSoonestUnlockExpiry(temporaryUnlocks, now)).toBe(expiresAt);
  expect(pruneExpiredUnlocks(temporaryUnlocks, expiresAt + 1)).toEqual({});
});
