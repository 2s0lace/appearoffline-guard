import {
  normalizeCode,
  sha256Hex,
  verifyUnlockCode,
  getRemainingCodesCount,
  generateCodeBatch,
  resolveActiveHashes,
} from "../unlock-codes";

test("normalizeCode() formats 8-char codes with hyphen and uppercase", () => {
  expect(normalizeCode("ab7k9m2p")).toBe("AB7K-9M2P");
  expect(normalizeCode("  ab7k - 9m2p ")).toBe("AB7K-9M2P");
  expect(normalizeCode("AB7K-9M2P")).toBe("AB7K-9M2P");
});

test("verifyUnlockCode() validates legacy SHA-256 hashes and blocks reuse", async () => {
  const hash1 = await sha256Hex("ABCD-2345");
  const hash2 = await sha256Hex("EFGH-6789");
  const pool = [hash1, hash2];

  expect(await verifyUnlockCode("", [], pool)).toEqual({ ok: false, error: "EMPTY" });
  expect(await verifyUnlockCode("XXXX-9999", [], pool)).toEqual({ ok: false, error: "INVALID" });

  const okRes = await verifyUnlockCode("abcd2345", [], pool);
  expect(okRes).toEqual({ ok: true, hash: hash1, remainingCount: 1 });

  const reusedRes = await verifyUnlockCode("ABCD-2345", [hash1], pool);
  expect(reusedRes).toEqual({ ok: false, error: "ALREADY_USED" });

  expect(getRemainingCodesCount([hash1], pool)).toBe(1);
  expect(getRemainingCodesCount([hash1, hash2], pool)).toBe(0);
});

test("generateCodeBatch() produces unique salted PBKDF2-SHA256 hashes", async () => {
  const { codes, hashes } = await generateCodeBatch(5, 10_000);
  expect(codes).toHaveLength(5);
  expect(hashes).toHaveLength(5);
  expect(new Set(codes).size).toBe(5);
  expect(hashes[0].startsWith("pbkdf2$10000$")).toBe(true);

  const check = await verifyUnlockCode(codes[0], [], hashes);
  expect(check.ok).toBe(true);

  const reuse = await verifyUnlockCode(codes[0], [hashes[0]], hashes);
  expect(reuse).toEqual({ ok: false, error: "ALREADY_USED" });

  expect(resolveActiveHashes(hashes)).toEqual(hashes);
});
