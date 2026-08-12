"use client";

import type { SequenceProgress } from "@/lib/ecg/types";

import styles from "./MonitorDisplay.module.css";

type SequencePlaybackControlsProps = {
  progress: SequenceProgress;
  stepCount: number;
  loop: boolean;
  canStart: boolean;
  onLoopChange: (loop: boolean) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  statusLabel?: string;
};

const PLAYBACK_LABELS = {
  idle: "Parado",
  playing: "Executando",
  paused: "Pausado",
  completed: "Concluído",
};

function formatSeconds(ms: number) {
  return `${(ms / 1_000).toFixed(1)} s`;
}

export default function SequencePlaybackControls({
  progress,
  stepCount,
  loop,
  canStart,
  onLoopChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onRestart,
  onPrevious,
  onNext,
  statusLabel,
}: SequencePlaybackControlsProps) {
  const active = progress.state === "playing" || progress.state === "paused";

  return (
    <section className={styles.playbackBox} aria-label="Reprodução da sequência">
      <div className={styles.playbackSummary} aria-live="polite">
        <strong>{PLAYBACK_LABELS[progress.state]}</strong>
        <span>
          Etapa {Math.min(progress.stepIndex + 1, stepCount)} de {stepCount}
          {statusLabel ? ` · ${statusLabel}` : ""}
        </span>
      </div>

      <div className={styles.progressLine}>
        <span>{formatSeconds(progress.elapsedMs)}</span>
        <progress value={progress.stepProgress} max={1}>
          {Math.round(progress.stepProgress * 100)}%
        </progress>
        <span>-{formatSeconds(progress.remainingMs)}</span>
      </div>

      <div className={styles.playbackActions}>
        <button type="button" onClick={onPrevious} disabled={!active || progress.stepIndex === 0} aria-label="Etapa anterior">◀</button>
        {progress.state === "playing" ? (
          <button type="button" onClick={onPause}>Pausar</button>
        ) : progress.state === "paused" ? (
          <button type="button" onClick={onResume}>Continuar</button>
        ) : (
          <button type="button" onClick={onStart} disabled={!canStart}>Iniciar</button>
        )}
        <button type="button" onClick={onNext} disabled={!active || progress.stepIndex >= stepCount - 1} aria-label="Próxima etapa">▶</button>
        <button type="button" onClick={onStop} disabled={!active}>Parar</button>
        <button type="button" onClick={onRestart} disabled={!canStart}>Reiniciar</button>
      </div>

      <label className={styles.checkField}>
        <input
          type="checkbox"
          checked={loop}
          onChange={(event) => onLoopChange(event.target.checked)}
        />
        Repetir continuamente
      </label>
    </section>
  );
}
