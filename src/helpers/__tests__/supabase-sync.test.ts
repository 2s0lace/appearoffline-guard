import { mergeUnlockHistory } from "../supabase-sync";
import { UnlockLogEntry } from "../../storage";

test("mergeUnlockHistory() deduplicates by id and sorts newest first", () => {
  const local: UnlockLogEntry[] = [
    {
      id: "a",
      timestamp: 1000,
      url: "https://reddit.com",
      rule: "reddit.com",
      category: "BOREDOM",
      reason: "Local entry",
      durationMinutes: 10,
      kind: "SITE_UNLOCK",
    },
    {
      id: "b",
      timestamp: 3000,
      url: "https://youtube.com",
      rule: "youtube.com",
      category: "NEED",
      reason: "Newest local",
      durationMinutes: 15,
      kind: "SITE_UNLOCK",
    },
  ];

  const remote: UnlockLogEntry[] = [
    {
      id: "a",
      timestamp: 1000,
      url: "https://reddit.com",
      rule: "reddit.com",
      category: "BOREDOM",
      reason: "Remote duplicate",
      durationMinutes: 10,
      kind: "SITE_UNLOCK",
    },
    {
      id: "c",
      timestamp: 2000,
      url: "https://x.com",
      rule: "x.com",
      category: "RUMINATION",
      reason: "Remote only",
      durationMinutes: 5,
      kind: "SITE_UNLOCK",
    },
  ];

  const merged = mergeUnlockHistory(local, remote);
  expect(merged.map((e) => e.id)).toEqual(["b", "c", "a"]);
});
