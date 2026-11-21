export const isRuleTemporarilyUnlocked = (
  rulePath: string,
  temporaryUnlocks: Record<string, number>,
  now = Date.now(),
): boolean => {
  const expiresAt = temporaryUnlocks[rulePath];
  return typeof expiresAt === "number" && expiresAt > now;
};

export const pruneExpiredUnlocks = (
  temporaryUnlocks: Record<string, number>,
  now = Date.now(),
): Record<string, number> => {
  const active: Record<string, number> = {};
  Object.entries(temporaryUnlocks).forEach(([rulePath, expiresAt]) => {
    if (typeof expiresAt === "number" && expiresAt > now) {
      active[rulePath] = expiresAt;
    }
  });
  return active;
};

export const grantTemporaryUnlock = (
  rulePath: string,
  durationMinutes: number,
  temporaryUnlocks: Record<string, number>,
  now = Date.now(),
): { temporaryUnlocks: Record<string, number>; expiresAt: number } => {
  const active = pruneExpiredUnlocks(temporaryUnlocks, now);
  const expiresAt = now + durationMinutes * 60_000;
  return {
    temporaryUnlocks: {
      ...active,
      [rulePath]: expiresAt,
    },
    expiresAt,
  };
};

export const getSoonestUnlockExpiry = (
  temporaryUnlocks: Record<string, number>,
  now = Date.now(),
): number | null => {
  const futureTimestamps = Object.values(temporaryUnlocks).filter(
    (expiresAt) => typeof expiresAt === "number" && expiresAt > now,
  );
  if (!futureTimestamps.length) {
    return null;
  }
  return Math.min(...futureTimestamps);
};
