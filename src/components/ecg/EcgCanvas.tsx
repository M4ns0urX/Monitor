"use client";

import { useEffect, useRef } from "react";

import type { AnimatedEcgProfile, EcgProfile } from "@/lib/ecg/types";
import {
  copyAnimatedProfile,
  interpolateProfile,
  sampleBaselineNoise,
  sampleEcgCycle,
} from "@/lib/ecg/waveform";

type EcgCanvasProps = {
  profile: EcgProfile;
};

type Transition = {
  from: AnimatedEcgProfile;
  to: AnimatedEcgProfile;
  startedAt: number;
};

const SAMPLES_PER_SECOND = 140;
const TRANSITION_DURATION_MS = 500;

export default function EcgCanvas({ profile }: EcgCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentProfileRef = useRef<AnimatedEcgProfile>(
    copyAnimatedProfile(profile),
  );
  const transitionRef = useRef<Transition | null>(null);
  const reducedMotionRef = useRef(false);
  const redrawStaticRef = useRef<((value: AnimatedEcgProfile) => void) | null>(
    null,
  );

  useEffect(() => {
    const target = copyAnimatedProfile(profile);

    if (reducedMotionRef.current) {
      currentProfileRef.current = target;
      transitionRef.current = null;
      redrawStaticRef.current?.(target);
      return;
    }

    transitionRef.current = {
      from: copyAnimatedProfile(currentProfileRef.current),
      to: target,
      startedAt: performance.now(),
    };
  }, [profile]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let samples = new Float32Array(1);
    let head = 0;
    let phase = 0;
    let signalSeconds = 0;
    let accumulator = 0;
    let previousTime = performance.now();
    let frameId = 0;
    let width = 1;
    let height = 1;

    const orderedSample = (index: number) =>
      samples[(head + index) % samples.length];

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const baseline = height * 0.55;
      const amplitude = height * 0.25;
      const horizontalStep = width / Math.max(1, samples.length - 1);
      const { traceColor, traceOpacity } = currentProfileRef.current;
      const red = Math.round(traceColor.red);
      const green = Math.round(traceColor.green);
      const blue = Math.round(traceColor.blue);
      const rgba = (opacity: number) =>
        `rgba(${red}, ${green}, ${blue}, ${opacity * traceOpacity})`;

      context.beginPath();

      for (let index = 0; index < samples.length; index += 1) {
        const x = index * horizontalStep;
        const y = baseline - orderedSample(index) * amplitude;

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = rgba(0.17);
      context.lineWidth = 10;
      context.shadowColor = rgba(0.55);
      context.shadowBlur = 16;
      context.stroke();

      context.strokeStyle = rgba(0.42);
      context.lineWidth = 5;
      context.shadowBlur = 8;
      context.stroke();

      context.strokeStyle = rgba(1);
      context.lineWidth = 2.2;
      context.shadowBlur = 4;
      context.stroke();
      context.restore();

      const latestIndex = (head - 1 + samples.length) % samples.length;
      const latestY = baseline - samples[latestIndex] * amplitude;
      const glow = context.createRadialGradient(
        width - 3,
        latestY,
        0,
        width - 3,
        latestY,
        13,
      );
      glow.addColorStop(0, rgba(1));
      glow.addColorStop(0.22, rgba(0.9));
      glow.addColorStop(1, rgba(0));
      context.fillStyle = glow;
      context.beginPath();
      context.arc(width - 3, latestY, 13, 0, Math.PI * 2);
      context.fill();
    };

    const renderStatic = (value: AnimatedEcgProfile) => {
      const visibleSeconds = width / SAMPLES_PER_SECOND;

      for (let index = 0; index < samples.length; index += 1) {
        const seconds = (index / Math.max(1, samples.length - 1)) * visibleSeconds;
        const staticPhase = value.bpm > 0 ? (seconds * value.bpm) / 60 : 0;
        samples[index] =
          sampleEcgCycle(staticPhase, value.morphology) +
          sampleBaselineNoise(seconds, value.baselineNoise);
      }

      head = 0;
      draw();
    };

    redrawStaticRef.current = renderStatic;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      const previous = Array.from(
        { length: samples.length },
        (_, index) => orderedSample(index),
      );
      const nextSamples = new Float32Array(nextWidth);
      const preservedCount = Math.min(previous.length, nextSamples.length);
      const sourceOffset = previous.length - preservedCount;
      const targetOffset = nextSamples.length - preservedCount;

      for (let index = 0; index < preservedCount; index += 1) {
        nextSamples[targetOffset + index] = previous[sourceOffset + index];
      }

      samples = nextSamples;
      head = 0;
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (reducedMotionRef.current) {
        renderStatic(currentProfileRef.current);
      } else {
        draw();
      }
    };

    const appendSample = (value: AnimatedEcgProfile) => {
      phase = (phase + value.bpm / 60 / SAMPLES_PER_SECOND) % 1;
      signalSeconds += 1 / SAMPLES_PER_SECOND;
      samples[head] =
        sampleEcgCycle(phase, value.morphology) +
        sampleBaselineNoise(signalSeconds, value.baselineNoise);
      head = (head + 1) % samples.length;
    };

    const animate = (now: number) => {
      const deltaSeconds = Math.min((now - previousTime) / 1000, 0.1);
      previousTime = now;

      const transition = transitionRef.current;

      if (transition) {
        const progress = (now - transition.startedAt) / TRANSITION_DURATION_MS;
        currentProfileRef.current = interpolateProfile(
          transition.from,
          transition.to,
          progress,
        );

        if (progress >= 1) {
          currentProfileRef.current = copyAnimatedProfile(transition.to);
          transitionRef.current = null;
        }
      }

      accumulator += deltaSeconds * SAMPLES_PER_SECOND;
      const pendingSamples = Math.floor(accumulator);
      accumulator -= pendingSamples;

      for (let index = 0; index < pendingSamples; index += 1) {
        appendSample(currentProfileRef.current);
      }

      draw();
      frameId = requestAnimationFrame(animate);
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionPreference = (reduce: boolean) => {
      reducedMotionRef.current = reduce;
      cancelAnimationFrame(frameId);

      if (reduce) {
        currentProfileRef.current = transitionRef.current
          ? copyAnimatedProfile(transitionRef.current.to)
          : currentProfileRef.current;
        transitionRef.current = null;
        renderStatic(currentProfileRef.current);
      } else {
        previousTime = performance.now();
        frameId = requestAnimationFrame(animate);
      }
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      applyMotionPreference(event.matches);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    mediaQuery.addEventListener("change", handleMotionPreference);
    resize();
    applyMotionPreference(mediaQuery.matches);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionPreference);
      redrawStaticRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
