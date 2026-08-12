"use client";

import { useEffect, useState } from "react";

import { advanceBpm } from "@/lib/ecg/appearance";

type UseAnimatedBpmOptions = {
  target: number;
  stepPerSecond: number;
  paused?: boolean;
};

export function useAnimatedBpm({
  target,
  stepPerSecond,
  paused = false,
}: UseAnimatedBpmOptions) {
  const [bpm, setBpm] = useState(target);

  useEffect(() => {
    if (paused || bpm === target) return;

    const timer = window.setInterval(() => {
      setBpm((current) => advanceBpm(current, target, stepPerSecond));
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [bpm, paused, stepPerSecond, target]);

  return bpm;
}
