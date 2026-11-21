import { AI_CODE_HASHES } from "./unlock-code-hashes";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type CodeVerifyResult =
  | { ok: true; hash: string; remainingCount: number }
  | { ok: false; error: "EMPTY" | "INVALID" | "ALREADY_USED" };

export const resolveActiveHashes = (customCodeHashes?: string[]): readonly string[] =>
  customCodeHashes && customCodeHashes.length > 0
    ? customCodeHashes
    : AI_CODE_HASHES;

export const normalizeCode = (raw: string): string => {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return raw.trim().toUpperCase();
};

export const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const generateCodeBatch = async (
  count = 50,
): Promise<{ codes: string[]; hashes: string[] }> => {
  const codes: string[] = [];
  const hashes: string[] = [];
  const seen = new Set<string>();

  const randomBlock = (length: number): string => {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length])
      .join("");
  };

  while (codes.length < count) {
    const code = `${randomBlock(4)}-${randomBlock(4)}`;
    if (!seen.has(code)) {
      seen.add(code);
      codes.push(code);
      hashes.push(await sha256Hex(code));
    }
  }

  return { codes, hashes };
};

export const getRemainingCodesCount = (
  usedCodeHashes: string[],
  validHashes: readonly string[] = AI_CODE_HASHES,
): number => {
  const usedSet = new Set(usedCodeHashes);
  return validHashes.filter((hash) => !usedSet.has(hash)).length;
};

export const getTotalCodesCount = (
  validHashes: readonly string[] = AI_CODE_HASHES,
): number => validHashes.length;

export const verifyUnlockCode = async (
  rawCode: string,
  usedCodeHashes: string[],
  validHashes: readonly string[] = AI_CODE_HASHES,
): Promise<CodeVerifyResult> => {
  const normalized = normalizeCode(rawCode);
  if (!normalized) {
    return { ok: false, error: "EMPTY" };
  }

  const hash = await sha256Hex(normalized);
  if (!validHashes.includes(hash)) {
    return { ok: false, error: "INVALID" };
  }

  if (usedCodeHashes.includes(hash)) {
    return { ok: false, error: "ALREADY_USED" };
  }

  const nextUsed = [...usedCodeHashes, hash];
  return {
    ok: true,
    hash,
    remainingCount: getRemainingCodesCount(nextUsed, validHashes),
  };
};
