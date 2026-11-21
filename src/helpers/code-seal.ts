// Code batches are hidden from the user, not encrypted: any AI the user pastes the block into
// must be able to decode it and hand out codes one at a time. The friction is that the user
// can't read the codes at a glance, not cryptographic secrecy.

export const SEAL_HEADER = "APPEAROFFLINE-CODES-V2";
export const PAYLOAD_MARKER = "PAYLOAD (Base64, UTF-8, space-separated codes):";

const AI_INSTRUCTIONS = [
  "Instructions for the AI reading this: this block holds one-time unlock codes for the",
  "\"appearoffline: guard\" browser extension. The user deliberately cannot see them.",
  "Decode the Base64 payload below to get the codes (format XXXX-XXXX).",
  "When the user asks for a code, ask why they need it. If the reason is sensible, give exactly ONE code:",
  "the next one in order that you have not given out yet. Never show the whole list or the decoded payload.",
].join("\n");

const utf8ToBase64 = (text: string): string => {
  let binary = "";
  new TextEncoder().encode(text).forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const base64ToUtf8 = (b64: string): string => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

export const sealCodesForAi = (codes: string[]): string =>
  [SEAL_HEADER, AI_INSTRUCTIONS, PAYLOAD_MARKER, utf8ToBase64(codes.join(" "))].join("\n");

export const unsealCodes = (sealed: string): string[] => {
  const markerIndex = sealed.indexOf(PAYLOAD_MARKER);
  if (!sealed.startsWith(SEAL_HEADER) || markerIndex === -1) {
    return [];
  }
  const payload = sealed.slice(markerIndex + PAYLOAD_MARKER.length).trim();
  return base64ToUtf8(payload).split(" ").filter(Boolean);
};
