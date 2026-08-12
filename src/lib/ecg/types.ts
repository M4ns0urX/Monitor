export type HeartStatus = "low" | "normal" | "medium" | "high" | "no-beat";

export type BackgroundFont =
  | "geist-sans"
  | "geist-mono"
  | "system-sans"
  | "system-serif";

export type BackgroundTextSettings = {
  text: string;
  font: BackgroundFont;
  size: number;
  opacity: number;
};

export type StatusColors = Record<HeartStatus, string>;

export type MonitorAppearanceSettings = {
  statusColors: StatusColors;
  backgroundColor: string;
  pulseSpacing: number;
  bpmStepPerSecond: number;
};

export type AppearanceController = {
  settings: MonitorAppearanceSettings;
  currentBpm: number;
  targetBpm: number;
  update: (change: Partial<MonitorAppearanceSettings>) => void;
  setStatusColor: (status: HeartStatus, color: string) => void;
  resetStatusColor: (status: HeartStatus) => void;
  resetAll: () => void;
};

export type TextEntranceAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "typewriter";

export type TextExitAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "scale";

export type TextAnimationPhase =
  | "hidden"
  | "entering"
  | "visible"
  | "exiting";

export type AnimationStep = {
  id: string;
  status: HeartStatus;
  durationMs: number;
  background: BackgroundTextSettings;
  textTiming: {
    delayMs: number;
    visibleMs: number;
    enterAnimation: TextEntranceAnimation;
    enterDurationMs: number;
    exitAnimation: TextExitAnimation;
    exitDurationMs: number;
  };
};

export type SequencePreset =
  | "custom"
  | "full-demo"
  | "escalation"
  | "recovery";

export type SequencePlaybackState =
  | "idle"
  | "playing"
  | "paused"
  | "completed";

export type SequenceProgress = {
  state: SequencePlaybackState;
  stepIndex: number;
  elapsedMs: number;
  remainingMs: number;
  stepProgress: number;
  totalElapsedMs: number;
  totalProgress: number;
  textPhase: TextAnimationPhase;
};

export type SequenceController = {
  steps: AnimationStep[];
  selectedIndex: number;
  loop: boolean;
  progress: SequenceProgress;
  validation: {
    valid: boolean;
    globalError?: string;
    errors: Record<string, string>;
  };
  setSelectedIndex: (index: number) => void;
  setLoop: (loop: boolean) => void;
  updateStep: (index: number, step: AnimationStep) => void;
  addStep: () => void;
  duplicateStep: (index: number) => void;
  removeStep: (index: number) => void;
  moveStep: (index: number, direction: -1 | 1) => void;
  applyPreset: (preset: SequencePreset) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  restart: () => void;
  previous: () => void;
  next: () => void;
  preview: (index: number) => void;
};

export type EcgColor = {
  red: number;
  green: number;
  blue: number;
};

export type EcgMorphology = {
  p: number;
  q: number;
  r: number;
  s: number;
  t: number;
};

export type EcgProfile = {
  id: HeartStatus;
  label: string;
  description: string;
  bpm: number;
  baselineNoise: number;
  traceColor: EcgColor;
  traceOpacity: number;
  morphology: EcgMorphology;
};

export type AnimatedEcgProfile = Pick<
  EcgProfile,
  "bpm" | "baselineNoise" | "traceColor" | "traceOpacity" | "morphology"
>;
