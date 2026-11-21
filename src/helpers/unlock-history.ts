import { CounterPeriod, UnlockCategory, UnlockLogEntry, UNLOCK_CATEGORIES } from "../storage";
import { counterPeriodToTimeStamp } from "./counter";

export const CATEGORY_LABELS: Record<UnlockCategory, string> = {
  NEED: "Potrzeba / Konkretny cel",
  BOREDOM: "Nuda / Prokrastynacja",
  RUMINATION: "Ruminacja / Impuls",
  OTHER: "Inne",
};

export const CATEGORY_SHORT_LABELS: Record<UnlockCategory, string> = {
  NEED: "Potrzeba",
  BOREDOM: "Nuda",
  RUMINATION: "Ruminacja",
  OTHER: "Inne",
};

export interface CategoryStats {
  total: number
  counts: Record<UnlockCategory, number>
}

export const filterUnlockHistoryByPeriod = (
  history: UnlockLogEntry[],
  period: CounterPeriod,
  now = Date.now(),
): UnlockLogEntry[] => {
  const fromTimeStamp = counterPeriodToTimeStamp(period, now);
  return history.filter((entry) => entry.timestamp >= fromTimeStamp);
};

export const computeCategoryStats = (
  history: UnlockLogEntry[],
  onlySiteUnlocks = true,
): CategoryStats => {
  const counts: Record<UnlockCategory, number> = {
    NEED: 0,
    BOREDOM: 0,
    RUMINATION: 0,
    OTHER: 0,
  };

  let total = 0;
  history.forEach((entry) => {
    if (onlySiteUnlocks && entry.kind === "SETTINGS_UNLOCK") {
      return;
    }
    if (UNLOCK_CATEGORIES.includes(entry.category)) {
      counts[entry.category] += 1;
      total += 1;
    }
  });

  return { total, counts };
};
