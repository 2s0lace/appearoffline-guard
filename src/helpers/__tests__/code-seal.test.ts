import crypto from "node:crypto";
import { sealCodesForAi, SEAL_PREFIX } from "../code-seal";

test("sealCodesForAi() encrypts codes with hybrid RSA-OAEP + AES-256-GCM", async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const sampleCodes = ["ABCD-2345", "EFGH-6789"];
  const sealed = await sealCodesForAi(sampleCodes, publicKey.toString("base64"));

  expect(sealed.startsWith(SEAL_PREFIX)).toBe(true);
  expect(sealed).not.toContain("ABCD-2345");
  expect(sealed).not.toContain("EFGH-6789");

  // Decrypt using private key to prove round-trip works
  const envelopeJson = Buffer.from(sealed.slice(SEAL_PREFIX.length), "base64").toString("utf8");
  const { k, iv, d } = JSON.parse(envelopeJson) as { k: string; iv: string; d: string };

  const aesKey = crypto.privateDecrypt(
    { key: privateKey, oaepHash: "sha256" },
    Buffer.from(k, "base64"),
  );

  const combined = Buffer.from(d, "base64");
  const authTag = combined.subarray(combined.length - 16);
  const ciphertext = combined.subarray(0, combined.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, Buffer.from(iv, "base64"));
  decipher.setAuthTag(authTag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  const parsed = JSON.parse(plain) as { v: number; codes: string[] };

  expect(parsed.v).toBe(1);
  expect(parsed.codes).toEqual(sampleCodes);
});
