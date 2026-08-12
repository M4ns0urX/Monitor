import type {
  AnimationStep,
  HeartStatus,
  SequencePreset,
  TextAnimationPhase,
} from "./types.ts";

export const MIN_STEP_DURATION_MS = 1_000;
export const MAX_STEP_DURATION_MS = 300_000;

const PRESET_STATUSES: Record<SequencePreset, HeartStatus[]> = {
  custom: ["normal"],
  "full-demo": ["low", "normal", "medium", "high", "no-beat"],
  escalation: ["normal", "medium", "high"],
  recovery: ["high", "medium", "normal", "low"],
};

const DEFAULT_TEXTS: Record<HeartStatus, string> = {
  low: "BAIXO",
  normal: "ESTÁVEL",
  medium: "ATENÇÃO",
  high: "ALTO",
  "no-beat": "SEM SINAL",
};

export function createAnimationStep(
  status: HeartStatus = "normal",
  id = `step-${status}`,
): AnimationStep {
  return {
    id,
    status,
    durationMs: 5_000,
    background: {
      text: DEFAULT_TEXTS[status],
      font: "geist-sans",
      size: 18,
      opacity: 8,
    },
    textTiming: {
      delayMs: 0,
      visibleMs: 0,
      enterAnimation: "fade",
      enterDurationMs: 600,
      exitAnimation: "fade",
      exitDurationMs: 500,
    },
  };
}

export function createSequenceFromPreset(
  preset: SequencePreset,
): AnimationStep[] {
  return PRESET_STATUSES[preset].map((status, index) =>
    createAnimationStep(status, `${preset}-${index + 1}-${status}`),
  );
}

export function cloneAnimationStep(
  step: AnimationStep,
  id: string,
): AnimationStep {
  return {
    ...step,
    id,
    background: { ...step.background },
    textTiming: { ...step.textTiming },
  };
}

export function getSequenceDuration(steps: AnimationStep[]): number {
  return steps.reduce((total, step) => total + step.durationMs, 0);
}

export function calculateTextPhase(
  step: AnimationStep,
  elapsedMs: number,
): TextAnimationPhase {
  const { delayMs, visibleMs, enterDurationMs, exitDurationMs } =
    step.textTiming;
  const availableMs = Math.max(0, step.durationMs - delayMs);
  const visibleWindowMs =
    visibleMs === 0 ? availableMs : Math.min(visibleMs, availableMs);
  const visibleEndMs = delayMs + visibleWindowMs;
  const enterEndMs = Math.min(visibleEndMs, delayMs + enterDurationMs);
  const exitStartMs = Math.max(enterEndMs, visibleEndMs - exitDurationMs);

  if (elapsedMs < delayMs || elapsedMs >= visibleEndMs) {
    return "hidden";
  }

  if (elapsedMs < enterEndMs) {
    return "entering";
  }

  if (elapsedMs >= exitStartMs && exitDurationMs > 0) {
    return "exiting";
  }

  return "visible";
}

type SequenceValidation = {
  valid: boolean;
  globalError?: string;
  errors: Record<string, string>;
};

export function validateAnimationSequence(
  steps: AnimationStep[],
): SequenceValidation {
  const errors: Record<string, string> = {};

  if (steps.length === 0) {
    return {
      valid: false,
      globalError: "Adicione pelo menos uma etapa.",
      errors,
    };
  }

  for (const step of steps) {
    if (
      !Number.isFinite(step.durationMs) ||
      step.durationMs < MIN_STEP_DURATION_MS ||
      step.durationMs > MAX_STEP_DURATION_MS
    ) {
      errors[step.id] = "A duração deve ficar entre 1 e 300 segundos.";
      continue;
    }

    if (
      step.textTiming.delayMs < 0 ||
      step.textTiming.delayMs > step.durationMs
    ) {
      errors[step.id] = "O atraso do texto não pode superar a duração da etapa.";
      continue;
    }

    const availableMs = step.durationMs - step.textTiming.delayMs;
    if (
      step.textTiming.visibleMs < 0 ||
      (step.textTiming.visibleMs > 0 &&
        step.textTiming.visibleMs > availableMs)
    ) {
      errors[step.id] = "O tempo visível não cabe na duração da etapa.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}