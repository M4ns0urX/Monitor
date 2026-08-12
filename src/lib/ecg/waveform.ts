import type { AnimatedEcgProfile, EcgMorphology } from "./types";

const TWO_PI = Math.PI * 2;

function gaussian(phase: number, center: number, width: number) {
  const distance = (phase - center) / width;
  return Math.exp(-0.5 * distance * distance);
}

export function sampleEcgCycle(phase: number, morphology: EcgMorphology) {
  const normalizedPhase = ((phase % 1) + 1) % 1;

  return (
    morphology.p * gaussian(normalizedPhase, 0.18, 0.035) +
    morphology.q * gaussian(normalizedPhase, 0.37, 0.012) +
    morphology.r * gaussian(normalizedPhase, 0.4, 0.01) +
    morphology.s * gaussian(normalizedPhase, 0.43, 0.014) +
    morphology.t * gaussian(normalizedPhase, 0.66, 0.07)
  );
}

export function sampleBaselineNoise(seconds: number, intensity: number) {
  if (intensity <= 0) {
    return 0;
  }

  const slow = Math.sin(seconds * TWO_PI * 0.73);
  const medium = Math.sin(seconds * TWO_PI * 2.17 + 0.8);
  const fine = Math.sin(seconds * TWO_PI * 7.9 + 1.7);

  return intensity * (slow * 0.5 + medium * 0.3 + fine * 0.2);
}

export function interpolateProfile(
  from: AnimatedEcgProfile,
  to: AnimatedEcgProfile,
  progress: number,
): AnimatedEcgProfile {
  const amount = Math.min(1, Math.max(0, progress));
  const mix = (start: number, end: number) => start + (end - start) * amount;

  return {
    bpm: mix(from.bpm, to.bpm),
    baselineNoise: mix(from.baselineNoise, to.baselineNoise),
    traceColor: {
      red: mix(from.traceColor.red, to.traceColor.red),
      green: mix(from.traceColor.green, to.traceColor.green),
      blue: mix(from.traceColor.blue, to.traceColor.blue),
    },
    traceOpacity: mix(from.traceOpacity, to.traceOpacity),
    morphology: {
      p: mix(from.morphology.p, to.morphology.p),
      q: mix(from.morphology.q, to.morphology.q),
      r: mix(from.morphology.r, to.morphology.r),
      s: mix(from.morphology.s, to.morphology.s),
      t: mix(from.morphology.t, to.morphology.t),
    },
  };
}

export function copyAnimatedProfile(
  profile: AnimatedEcgProfile,
): AnimatedEcgProfile {
  return {
    bpm: profile.bpm,
    baselineNoise: profile.baselineNoise,
    traceColor: { ...profile.traceColor },
    traceOpacity: profile.traceOpacity,
    morphology: { ...profile.morphology },
  };
}
