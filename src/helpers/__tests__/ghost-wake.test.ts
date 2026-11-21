import { waveAngle } from "../ghost-wake";

test("waveAngle() swings ±10° around the -12° rest pose", () => {
  expect(waveAngle(0)).toBeCloseTo(-12);
  expect(waveAngle(0.25)).toBeCloseTo(-2);
  expect(waveAngle(0.5)).toBeCloseTo(-12);
  expect(waveAngle(0.75)).toBeCloseTo(-22);
  expect(waveAngle(1)).toBeCloseTo(-12);
});
