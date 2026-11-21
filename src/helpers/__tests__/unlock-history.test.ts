import { computeCategoryStats, filterUnlockHistoryByPeriod } from "../unlock-history";
import { UnlockLogEntry } from "../../storage";

test("computeCategoryStats() counts boredom, rumination, need, and excludes settings unlocks", () => {
  const now = new Date("2026-11-21T12:00:00Z").getTime();
  const history: UnlockLogEntry[] = [
    {
      id: "1",
      timestamp: now - 1000,
      url: "https://reddit.com",
      rule: "reddit.com",
      category: "BOREDOM",
      reason: "Nudzilo mi sie po obiedzie",
      durationMinutes: 10,
      kind: "SITE_UNLOCK",
    },
    {
      id: "2",
      timestamp: now - 2000,
      url: "https://instagram.com",
      rule: "instagram.com",
      category: "RUMINATION",
      reason: "Impuls zeby sprawdzic profil",
      durationMinutes: 5,
      kind: "SITE_UNLOCK",
    },
    {
      id: "3",
      timestamp: now - 3000,
      url: "https://youtube.com",
      rule: "youtube.com",
      category: "BOREDOM",
      reason: "Chcialem cos wlaczyc w tle",
      durationMinutes: 15,
      kind: "SITE_UNLOCK",
    },
    {
      id: "4",
      timestamp: now - 4000,
      url: "options.html",
      rule: "SETTINGS",
      category: "OTHER",
      reason: "Dodanie wyjatku",
      durationMinutes: 5,
      kind: "SETTINGS_UNLOCK",
    },
  ];

  const today = filterUnlockHistoryByPeriod(history, "TODAY", now);
  expect(today).toHaveLength(4);

  const stats = computeCategoryStats(today, true);
  expect(stats.total).toBe(3);
  expect(stats.counts).toEqual({
    NEED: 0,
    BOREDOM: 2,
    RUMINATION: 1,
    OTHER: 0,
  });
});
