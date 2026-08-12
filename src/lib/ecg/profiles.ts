import type { EcgProfile, HeartStatus } from "./types";

const BASE_MORPHOLOGY = {
  p: 0.12,
  q: -0.14,
  r: 1,
  s: -0.28,
  t: 0.3,
};

export const ECG_PROFILES: Record<HeartStatus, EcgProfile> = {
  low: {
    id: "low",
    label: "Baixo",
    description: "Frequência visual reduzida",
    bpm: 45,
    baselineNoise: 0.005,
    traceColor: { red: 56, green: 189, blue: 248 },
    traceOpacity: 1,
    morphology: {
      ...BASE_MORPHOLOGY,
      p: 0.13,
      r: 1.04,
      t: 0.32,
    },
  },
  normal: {
    id: "normal",
    label: "Normal",
    description: "Ritmo visual estável",
    bpm: 72,
    baselineNoise: 0.006,
    traceColor: { red: 52, green: 211, blue: 153 },
    traceOpacity: 1,
    morphology: BASE_MORPHOLOGY,
  },
  medium: {
    id: "medium",
    label: "Médio",
    description: "Frequência visual intermediária",
    bpm: 90,
    baselineNoise: 0.007,
    traceColor: { red: 250, green: 204, blue: 21 },
    traceOpacity: 1,
    morphology: {
      ...BASE_MORPHOLOGY,
      p: 0.11,
      r: 0.97,
      t: 0.27,
    },
  },
  high: {
    id: "high",
    label: "Alto",
    description: "Frequência visual elevada",
    bpm: 112,
    baselineNoise: 0.008,
    traceColor: { red: 248, green: 113, blue: 113 },
    traceOpacity: 1,
    morphology: {
      ...BASE_MORPHOLOGY,
      p: 0.1,
      r: 0.94,
      t: 0.25,
    },
  },
  "no-beat": {
    id: "no-beat",
    label: "Sem Batimento",
    description: "Linha visual sem pulsos",
    bpm: 0,
    baselineNoise: 0.003,
    traceColor: { red: 148, green: 163, blue: 184 },
    traceOpacity: 0.32,
    morphology: {
      p: 0,
      q: 0,
      r: 0,
      s: 0,
      t: 0,
    },
  },
};

export const HEART_STATUSES: HeartStatus[] = [
  "low",
  "normal",
  "medium",
  "high",
  "no-beat",
];
