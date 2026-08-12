import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateTextPhase,
  createAnimationStep,
  createSequenceFromPreset,
  getSequenceDuration,
  validateAnimationSequence,
} from "./sequence.ts";

test("calcula as fases de entrada, visibilidade e saída do texto", () => {
  const step = createAnimationStep("normal", "phases");
  step.durationMs = 5_000;
  step.textTiming = {
    ...step.textTiming,
    delayMs: 1_000,
    visibleMs: 3_000,
    enterDurationMs: 500,
    exitDurationMs: 500,
  };

  assert.equal(calculateTextPhase(step, 500), "hidden");
  assert.equal(calculateTextPhase(step, 1_200), "entering");
  assert.equal(calculateTextPhase(step, 2_000), "visible");
  assert.equal(calculateTextPhase(step, 3_700), "exiting");
  assert.equal(calculateTextPhase(step, 4_500), "hidden");
});

test("cria uma etapa válida com valores padrão", () => {
  const step = createAnimationStep("normal", "step-test");

  assert.equal(step.id, "step-test");
  assert.equal(step.status, "normal");
  assert.equal(step.durationMs, 5_000);
  assert.equal(step.textTiming.delayMs, 0);
  assert.equal(step.textTiming.visibleMs, 0);
  assert.equal(step.textTiming.enterAnimation, "fade");
});

test("preset completo preserva a ordem dos cinco estados", () => {
  const steps = createSequenceFromPreset("full-demo");

  assert.deepEqual(
    steps.map((step) => step.status),
    ["low", "normal", "medium", "high", "no-beat"],
  );
  assert.equal(new Set(steps.map((step) => step.id)).size, steps.length);
});

test("calcula a duração total da sequência", () => {
  const steps = [
    { ...createAnimationStep("normal", "one"), durationMs: 2_000 },
    { ...createAnimationStep("high", "two"), durationMs: 3_500 },
  ];

  assert.equal(getSequenceDuration(steps), 5_500);
});

test("rejeita atraso de texto maior que a duração da etapa", () => {
  const step = createAnimationStep("normal", "invalid");
  step.durationMs = 2_000;
  step.textTiming.delayMs = 2_500;

  const result = validateAnimationSequence([step]);

  assert.equal(result.valid, false);
  assert.match(result.errors.invalid ?? "", /atraso/i);
});

test("rejeita sequência vazia", () => {
  const result = validateAnimationSequence([]);

  assert.equal(result.valid, false);
  assert.match(result.globalError ?? "", /etapa/i);
});
