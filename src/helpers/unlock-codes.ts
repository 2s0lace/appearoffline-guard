import { AI_CODE_HASHES } from "./unlock-code-hashes";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PBKDF2_PREFIX = "pbkdf2$";
const DEFAULT_PBKDF2_ITERATIONS = 100_000;

export type CodeVerifyResult =
  | { ok: true; hash: string; remainingCount: number }
  | { ok: false; error: "EMPTY" | "INVALID" | "ALREADY_USED" };

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

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
  return bytesToHex(new Uint8Array(hashBuffer));
};

export const pbkdf2Hash = async (
  input: string,
  saltHex: string,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
): Promise<string> => {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(input),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const saltBytes = hexToBytes(saltHex);
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes.buffer as ArrayBuffer,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return `${PBKDF2_PREFIX}${iterations}$${saltHex}$${bytesToHex(new Uint8Array(derivedBits))}`;
};

export const generateCodeBatch = async (
  count = 50,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
): Promise<{ codes: string[]; hashes: string[] }> => {
  const codes: string[] = [];
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
    }
  }

  const batchSaltBytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(batchSaltBytes);
  const batchSaltHex = bytesToHex(batchSaltBytes);

  const hashes = await Promise.all(
    codes.map((code) => pbkdf2Hash(code, batchSaltHex, iterations)),
  );

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

  let matchedHash: string | null = null;
  const derivedCache = new Map<string, string>();
  let legacySha256: string | null = null;

  for (const stored of validHashes) {
    if (stored.startsWith(PBKDF2_PREFIX)) {
      const parts = stored.split("$");
      if (parts.length !== 4) {
        continue;
      }
      const iterations = parseInt(parts[1], 10);
      const saltHex = parts[2];
      const cacheKey = `${iterations}$${saltHex}`;
      let candidate = derivedCache.get(cacheKey);
      if (!candidate) {
        candidate = await pbkdf2Hash(normalized, saltHex, iterations);
        derivedCache.set(cacheKey, candidate);
      }
      if (candidate === stored) {
        matchedHash = stored;
        break;
      }
    } else {
      if (!legacySha256) {
        legacySha256 = await sha256Hex(normalized);
      }
      if (legacySha256 === stored) {
        matchedHash = stored;
        break;
      }
    }
  }

  if (!matchedHash) {
    return { ok: false, error: "INVALID" };
  }

  if (usedCodeHashes.includes(matchedHash)) {
    return { ok: false, error: "ALREADY_USED" };
  }

  const nextUsed = [...usedCodeHashes, matchedHash];
  return {
    ok: true,
    hash: matchedHash,
    remainingCount: getRemainingCodesCount(nextUsed, validHashes),
  };
};
