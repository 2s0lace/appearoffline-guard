import { sealCodesForAi, unsealCodes, SEAL_HEADER } from "../code-seal";

test("sealCodesForAi() hides codes from a glance but stays decodable by any AI", () => {
  const sampleCodes = ["ABCD-2345", "EFGH-6789"];
  const sealed = sealCodesForAi(sampleCodes);

  expect(sealed.startsWith(SEAL_HEADER)).toBe(true);
  expect(sealed).toContain("Instructions for the AI");
  expect(sealed).not.toContain("ABCD-2345");
  expect(sealed).not.toContain("EFGH-6789");

  // Plain Base64 decoding (what an AI would do) recovers the codes.
  const payload = sealed.split("\n").pop() as string;
  expect(Buffer.from(payload, "base64").toString("utf8")).toBe("ABCD-2345 EFGH-6789");
  expect(unsealCodes(sealed)).toEqual(sampleCodes);
});

test("unsealCodes() ignores unrelated text", () => {
  expect(unsealCodes("hello")).toEqual([]);
});
