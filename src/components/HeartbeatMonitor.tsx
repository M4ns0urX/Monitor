"use client";

import { useCallback, useRef, useState } from "react";

import MonitorDisplay from "@/components/ecg/MonitorDisplay";
import {
  createDefaultMonitorAppearance,
  createDefaultStatusColors,
  effectiveBpm,
  hexToColor,
} from "@/lib/ecg/appearance";
import { ECG_PROFILES } from "@/lib/ecg/profiles";
import {
  cloneAnimationStep,
  createAnimationStep,
  createSequenceFromPreset,
  validateAnimationSequence,
} from "@/lib/ecg/sequence";
import { useAnimationSequence } from "@/hooks/useAnimationSequence";
import { useAnimatedBpm } from "@/hooks/useAnimatedBpm";
import type {
  AnimationStep,
  BackgroundTextSettings,
  HeartStatus,
  SequencePreset,
} from "@/lib/ecg/types";

const DEFAULT_BACKGROUND_TEXT: BackgroundTextSettings = {
  text: "CARDIO",
  font: "geist-sans",
  size: 18,
  opacity: 8,
};

export default function HeartbeatMonitor() {
  const [status, setStatus] = useState<HeartStatus>("normal");
  const [backgroundText, setBackgroundText] =
    useState<BackgroundTextSettings>(DEFAULT_BACKGROUND_TEXT);
  const [steps, setSteps] = useState(() => createSequenceFromPreset("full-demo"));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loop, setLoop] = useState(false);
  const [appearance, setAppearance] = useState(createDefaultMonitorAppearance);
  const idCounter = useRef(0);
  const baseProfile = ECG_PROFILES[status];

  const applySequenceStep = useCallback((step: AnimationStep) => {
    setStatus(step.status);
    setBackgroundText(step.background);
  }, []);

  const playback = useAnimationSequence({
    steps,
    loop,
    onStepChange: applySequenceStep,
  });
  const targetBpm = effectiveBpm(baseProfile.bpm, appearance.pulseSpacing);
  const currentBpm = useAnimatedBpm({
    target: targetBpm,
    stepPerSecond: appearance.bpmStepPerSecond,
    paused: playback.progress.state === "paused",
  });
  const profile = {
    ...baseProfile,
    bpm: currentBpm,
    traceColor: hexToColor(appearance.statusColors[status]),
  };
  const validation = validateAnimationSequence(steps);

  const nextId = () => {
    idCounter.current += 1;
    return `custom-step-${idCounter.current}`;
  };

  const updateStep = (index: number, step: AnimationStep) => {
    setSteps((current) => current.map((item, itemIndex) => itemIndex === index ? step : item));
  };

  const addStep = () => {
    setSteps((current) => [...current, createAnimationStep("normal", nextId())]);
    setSelectedIndex(steps.length);
  };

  const duplicateStep = (index: number) => {
    setSteps((current) => {
      const source = current[index];
      if (!source) return current;
      const copy = cloneAnimationStep(source, nextId());
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    setSelectedIndex(index + 1);
  };

  const removeStep = (index: number) => {
    setSteps((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setSelectedIndex((current) => Math.max(0, Math.min(current, steps.length - 2)));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    setSteps((current) => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setSelectedIndex(target);
  };

  const applyPreset = (preset: SequencePreset) => {
    const presetSteps = createSequenceFromPreset(preset).map((step) => ({
      ...step,
      id: nextId(),
    }));
    setSteps(presetSteps);
    setSelectedIndex(0);
  };

  const preview = (index: number) => {
    const step = steps[index];
    if (step) playback.preview(step, index);
  };

  const sequence = {
    steps, selectedIndex, loop, progress: playback.progress, validation,
    setSelectedIndex, setLoop, updateStep, addStep, duplicateStep, removeStep,
    moveStep, applyPreset, start: playback.start, pause: playback.pause,
    resume: playback.resume, stop: playback.stop, restart: playback.restart,
    previous: playback.previous, next: playback.next, preview,
  };

  const appearanceController = {
    settings: appearance,
    currentBpm,
    targetBpm,
    update: (change: Partial<typeof appearance>) =>
      setAppearance((current) => ({ ...current, ...change })),
    setStatusColor: (heartStatus: HeartStatus, color: string) =>
      setAppearance((current) => ({
        ...current,
        statusColors: { ...current.statusColors, [heartStatus]: color },
      })),
    resetStatusColor: (heartStatus: HeartStatus) =>
      setAppearance((current) => ({
        ...current,
        statusColors: {
          ...current.statusColors,
          [heartStatus]: createDefaultStatusColors()[heartStatus],
        },
      })),
    resetAll: () => setAppearance(createDefaultMonitorAppearance()),
  };

  return (
    <MonitorDisplay
      profile={profile}
      status={status}
      onStatusChange={setStatus}
      backgroundText={backgroundText}
      onBackgroundTextChange={setBackgroundText}
      sequence={sequence}
      appearance={appearanceController}
    />
  );
}
