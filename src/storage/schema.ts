export const RESOLUTIONS = [
  "CLOSE_TAB",
  "SHOW_BLOCKED_INFO_PAGE",
] as const;

export const COUNTER_PERIODS = [
  "ALL_TIME",
  "THIS_MONTH",
  "THIS_WEEK",
  "TODAY",
] as const;

export const UNLOCK_CATEGORIES = [
  "NEED",
  "BOREDOM",
  "RUMINATION",
  "OTHER",
] as const;

export const UNLOCK_MODES = [
  "PAUSE_AND_REASON",
  "PAUSE_REASON_AND_CODE",
] as const;

export const LANGUAGES = [
  "pl",
  "en",
  "es",
  "fr",
  "de",
] as const;

export const THEMES = [
  "LIGHT",
  "DARK",
] as const;

export type Resolution = typeof RESOLUTIONS[number];
export type CounterPeriod = typeof COUNTER_PERIODS[number];
export type UnlockCategory = typeof UNLOCK_CATEGORIES[number];
export type UnlockMode = typeof UNLOCK_MODES[number];
export type Language = typeof LANGUAGES[number];
export type Theme = typeof THEMES[number];

export interface UnlockLogEntry {
  id: string
  timestamp: number
  url: string
  rule: string
  category: UnlockCategory
  reason: string
  durationMinutes: number
  kind?: "SITE_UNLOCK" | "SETTINGS_UNLOCK"
}

export interface AccountSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string
  }
}

export interface Schema {
  enabled: boolean
  contextMenu: boolean
  blocked: string[]
  counter: Record<string, number[]>
  counterShow: boolean
  counterPeriod: CounterPeriod
  resolution: Resolution
  unlockMode: UnlockMode
  language: Language
  theme: Theme
  temporaryUnlocks: Record<string, number>
  usedCodeHashes: string[]
  customCodeHashes: string[]
  unlockHistory: UnlockLogEntry[]
  settingsUnlockedUntil: number
  emergencyUnlockRequestedAt: number
  lastSealedBatch: string
  accountSession: AccountSession | null
}

export const DEFAULTS: Readonly<Schema> = {
  enabled: false,
  contextMenu: false,
  blocked: [],
  counter: {},
  counterShow: true,
  counterPeriod: "ALL_TIME",
  resolution: "SHOW_BLOCKED_INFO_PAGE",
  unlockMode: "PAUSE_AND_REASON",
  language: "pl",
  theme: "LIGHT",
  temporaryUnlocks: {},
  usedCodeHashes: [],
  customCodeHashes: [],
  unlockHistory: [],
  settingsUnlockedUntil: 0,
  emergencyUnlockRequestedAt: 0,
  lastSealedBatch: "",
  accountSession: null,
};

export const VALIDATORS: Readonly<Record<keyof Schema, (value: unknown) => boolean>> = {
  enabled: (value) => typeof value === "boolean",
  contextMenu: (value) => typeof value === "boolean",
  blocked: (value) => Array.isArray(value),
  counter: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
  counterShow: (value) => typeof value === "boolean",
  counterPeriod: (value) => COUNTER_PERIODS.includes(value as CounterPeriod),
  resolution: (value) => RESOLUTIONS.includes(value as Resolution),
  unlockMode: (value) => UNLOCK_MODES.includes(value as UnlockMode),
  language: (value) => LANGUAGES.includes(value as Language),
  theme: (value) => THEMES.includes(value as Theme),
  temporaryUnlocks: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
  usedCodeHashes: (value) => Array.isArray(value),
  customCodeHashes: (value) => Array.isArray(value),
  unlockHistory: (value) => Array.isArray(value),
  settingsUnlockedUntil: (value) => typeof value === "number" && !Number.isNaN(value),
  emergencyUnlockRequestedAt: (value) => typeof value === "number" && !Number.isNaN(value),
  lastSealedBatch: (value) => typeof value === "string",
  accountSession: (value) => value === null || (typeof value === "object" && !Array.isArray(value)),
};

export const BLOCKED_EXAMPLE: string[] = [
  "example.com          # any page (same as example.com/*)",
  "example.com/         # main page only",
  "example.com/*        # any page",
  "",

  "!one.example.com     # ! = exclude",
  "*.example.com        # * = any zero or more characters",
  "",

  "example.com/???/     # ? = any one character",
  "example.com/app/*",
];
