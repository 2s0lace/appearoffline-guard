import { DEFAULT_SEAL_PUBLIC_KEY_SPKI } from "./seal-public-key";

export const SEAL_PREFIX = "UNRUMINATE-SEALED-V1:";

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const sealCodesForAi = async (
  codes: string[],
  publicKeySpkiBase64: string = DEFAULT_SEAL_PUBLIC_KEY_SPKI,
): Promise<string> => {
  const spkiBytes = base64ToBytes(publicKeySpkiBase64);
  const rsaPublicKey = await globalThis.crypto.subtle.importKey(
    "spki",
    spkiBytes.buffer as ArrayBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  const aesKey = await globalThis.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const iv = new Uint8Array(12);
  globalThis.crypto.getRandomValues(iv);

  const payload = JSON.stringify({
    v: 1,
    createdAt: new Date().toISOString(),
    codes,
  });

  const ciphertextBuf = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    aesKey,
    new TextEncoder().encode(payload),
  );

  const rawAesKey = await globalThis.crypto.subtle.exportKey("raw", aesKey);
  const wrappedKeyBuf = await globalThis.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    rsaPublicKey,
    rawAesKey,
  );

  const envelope = JSON.stringify({
    k: bytesToBase64(new Uint8Array(wrappedKeyBuf)),
    iv: bytesToBase64(iv),
    d: bytesToBase64(new Uint8Array(ciphertextBuf)),
  });

  return `${SEAL_PREFIX}${bytesToBase64(new TextEncoder().encode(envelope))}`;
};
