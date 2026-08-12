import { ECG_PROFILES } from "./profiles.ts";
import type {
  EcgColor,
  MonitorAppearanceSettings,
  StatusColors,
} from "./types.ts";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function colorToHex(color: EcgColor): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${channel(color.red)}${channel(color.green)}${channel(color.blue)}`;
}

export function validateHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
}

export function hexToColor(value: string): EcgColor {
  if (!validateHexColor(value)) throw new Error("Cor hexadecimal inválida.");
  return {
    red: Number.parseInt(value.slice(1, 3), 16),
    green: Number.parseInt(value.slice(3, 5), 16),
    blue: Number.parseInt(value.slice(5, 7), 16),
  };
}

export function createDefaultStatusColors(): StatusColors {
  return {
    low: colorToHex(ECG_PROFILES.low.traceColor),
    normal: colorToHex(ECG_PROFILES.normal.traceColor),
    medium: colorToHex(ECG_PROFILES.medium.traceColor),
    high: colorToHex(ECG_PROFILES.high.traceColor),
    "no-beat": colorToHex(ECG_PROFILES["no-beat"].traceColor),
  };
}

export function createDefaultMonitorAppearance(): MonitorAppearanceSettings {
  return {
    statusColors: createDefaultStatusColors(),
    backgroundColor: "#01040D",
    pulseSpacing: 1,
    bpmStepPerSecond: 5,
  };
}

export function advanceBpm(current: number, target: number, step: number): number {
  const safeStep = Math.max(1, step);
  if (current < target) return Math.min(target, current + safeStep);
  if (current > target) return Math.max(target, current - safeStep);
  return target;
}

export function effectiveBpm(bpm: number, pulseSpacing: number): number {
  if (bpm <= 0) return 0;
  return Math.round(bpm / Math.max(0.5, pulseSpacing));
}