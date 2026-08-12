"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  calculateTextPhase,
  getSequenceDuration,
} from "@/lib/ecg/sequence";
import type {
  AnimationStep,
  SequenceProgress,
} from "@/lib/ecg/types";

type UseAnimationSequenceOptions = {
  steps: AnimationStep[];
  loop: boolean;
  onStepChange: (step: AnimationStep) => void;
};

const INITIAL_PROGRESS: SequenceProgress = {
  state: "idle",
  stepIndex: 0,
  elapsedMs: 0,
  remainingMs: 0,
  stepProgress: 0,
  totalElapsedMs: 0,
  totalProgress: 0,
  textPhase: "hidden",
};

export function useAnimationSequence({
  steps,
  loop,
  onStepChange,
}: UseAnimationSequenceOptions) {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const snapshotRef = useRef<AnimationStep[]>([]);
  const stepIndexRef = useRef(0);
  const stepStartedAtRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const onStepChangeRef = useRef(onStepChange);
  const loopRef = useRef(loop);

  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const applyStep = useCallback((index: number, elapsedMs = 0) => {
    const step = snapshotRef.current[index];
    if (!step) return;
    stepIndexRef.current = index;
    pausedElapsedRef.current = elapsedMs;
    stepStartedAtRef.current = performance.now() - elapsedMs;
    onStepChangeRef.current(step);
  }, []);

  const updateProgress = useCallback(
    (state: SequenceProgress["state"], elapsedMs: number) => {
      const sequence = snapshotRef.current;
      const index = stepIndexRef.current;
      const step = sequence[index];
      if (!step) return;
      const duration = getSequenceDuration(sequence);
      const priorDuration = sequence
        .slice(0, index)
        .reduce((sum, item) => sum + item.durationMs, 0);
      const boundedElapsed = Math.min(elapsedMs, step.durationMs);
      const totalElapsed = priorDuration + boundedElapsed;
      setProgress({
        state,
        stepIndex: index,
        elapsedMs: boundedElapsed,
        remainingMs: Math.max(0, step.durationMs - boundedElapsed),
        stepProgress: step.durationMs ? boundedElapsed / step.durationMs : 0,
        totalElapsedMs: totalElapsed,
        totalProgress: duration ? totalElapsed / duration : 0,
        textPhase: calculateTextPhase(step, boundedElapsed),
      });
    },
    [],
  );

  useEffect(() => {
    if (progress.state !== "playing") return;

    const timer = window.setInterval(() => {
      const sequence = snapshotRef.current;
      const current = sequence[stepIndexRef.current];
      if (!current) return;
      const now = performance.now();
      const elapsed = now - stepStartedAtRef.current;

      if (elapsed < current.durationMs) {
        updateProgress("playing", elapsed);
        return;
      }

      const nextIndex = stepIndexRef.current + 1;
      if (nextIndex < sequence.length) {
        applyStep(nextIndex);
        updateProgress("playing", 0);
        return;
      }

      if (loopRef.current && sequence.length > 0) {
        applyStep(0);
        updateProgress("playing", 0);
        return;
      }

      updateProgress("completed", current.durationMs);
    }, 100);

    return () => window.clearInterval(timer);
  }, [applyStep, progress.state, updateProgress]);

  const start = useCallback(() => {
    if (steps.length === 0) return;
    snapshotRef.current = steps.map((step) => ({
      ...step,
      background: { ...step.background },
      textTiming: { ...step.textTiming },
    }));
    applyStep(0);
    updateProgress("playing", 0);
  }, [applyStep, steps, updateProgress]);

  const pause = useCallback(() => {
    if (progress.state !== "playing") return;
    const elapsed = performance.now() - stepStartedAtRef.current;
    pausedElapsedRef.current = elapsed;
    updateProgress("paused", elapsed);
  }, [progress.state, updateProgress]);

  const resume = useCallback(() => {
    if (progress.state !== "paused") return;
    stepStartedAtRef.current = performance.now() - pausedElapsedRef.current;
    updateProgress("playing", pausedElapsedRef.current);
  }, [progress.state, updateProgress]);

  const stop = useCallback(() => {
    setProgress((current) => ({ ...current, state: "idle" }));
  }, []);

  const restart = useCallback(() => {
    if (snapshotRef.current.length === 0) {
      snapshotRef.current = steps;
    }
    applyStep(0);
    updateProgress("playing", 0);
  }, [applyStep, steps, updateProgress]);

  const goTo = useCallback(
    (direction: -1 | 1) => {
      const sequence = snapshotRef.current.length
        ? snapshotRef.current
        : steps;
      if (sequence.length === 0) return;
      snapshotRef.current = sequence;
      const nextIndex = Math.min(
        sequence.length - 1,
        Math.max(0, stepIndexRef.current + direction),
      );
      applyStep(nextIndex);
      updateProgress(progress.state === "paused" ? "paused" : "playing", 0);
    },
    [applyStep, progress.state, steps, updateProgress],
  );

  const preview = useCallback((step: AnimationStep, index: number) => {
    stepIndexRef.current = index;
    onStepChangeRef.current(step);
    setProgress((current) => ({
      ...current,
      state: "idle",
      stepIndex: index,
      elapsedMs: 0,
      remainingMs: step.durationMs,
      stepProgress: 0,
      textPhase: "entering",
    }));
  }, []);

  return {
    progress,
    start,
    pause,
    resume,
    stop,
    restart,
    previous: () => goTo(-1),
    next: () => goTo(1),
    preview,
  };
}
