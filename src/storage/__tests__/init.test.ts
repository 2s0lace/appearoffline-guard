import { getRevisitedSchema } from "../init";
import { Schema, DEFAULTS } from "../schema";

test("getRevisitedSchema() returns defaults for any invalid attribute", () => {
  expect(getRevisitedSchema({})).toEqual(DEFAULTS);

  expect(getRevisitedSchema(DEFAULTS)).toEqual({});

  expect(getRevisitedSchema({
    enabled: DEFAULTS.enabled,
    blocked: DEFAULTS.blocked,
  })).toEqual({
    contextMenu: false,
    counter: DEFAULTS.counter,
    counterShow: DEFAULTS.counterShow,
    counterPeriod: DEFAULTS.counterPeriod,
    resolution: DEFAULTS.resolution,
    unlockMode: DEFAULTS.unlockMode,
    language: DEFAULTS.language,
    theme: DEFAULTS.theme,
    temporaryUnlocks: DEFAULTS.temporaryUnlocks,
    usedCodeHashes: DEFAULTS.usedCodeHashes,
    customCodeHashes: DEFAULTS.customCodeHashes,
    unlockHistory: DEFAULTS.unlockHistory,
    settingsUnlockedUntil: DEFAULTS.settingsUnlockedUntil,
    emergencyUnlockRequestedAt: DEFAULTS.emergencyUnlockRequestedAt,
    lastSealedBatch: DEFAULTS.lastSealedBatch,
  } as Partial<Schema>);

  expect(getRevisitedSchema({
    ...DEFAULTS,
    enabled: "YES",     // invalid
    contextMenu: "YES", // invalid
  })).toEqual({
    enabled: DEFAULTS.enabled,
    contextMenu: DEFAULTS.contextMenu,
  } as Partial<Schema>);

  expect(getRevisitedSchema({
    ...DEFAULTS,
    enabled: "YES", // invalid
    blocked: "ALL", // invalid
    resolution: "BLOCK", // invalid
  })).toEqual({
    enabled: DEFAULTS.enabled,
    blocked: DEFAULTS.blocked,
    resolution: DEFAULTS.resolution,
  } as Partial<Schema>);
});
