"use client";

import { ECG_PROFILES, HEART_STATUSES } from "@/lib/ecg/profiles";
import type {
  AnimationStep,
  BackgroundFont,
  HeartStatus,
  SequencePreset,
  TextEntranceAnimation,
  TextExitAnimation,
} from "@/lib/ecg/types";

import styles from "./MonitorDisplay.module.css";

type SequenceEditorProps = {
  steps: AnimationStep[];
  selectedIndex: number;
  disabled: boolean;
  errors: Record<string, string>;
  onSelect: (index: number) => void;
  onChange: (index: number, step: AnimationStep) => void;
  onAdd: () => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onPreview: (index: number) => void;
  onPreset: (preset: SequencePreset) => void;
};

const FONT_OPTIONS: Array<[BackgroundFont, string]> = [
  ["geist-sans", "Geist Sans"],
  ["geist-mono", "Geist Mono"],
  ["system-sans", "Sans Serif"],
  ["system-serif", "Serif"],
];
const ENTRANCE_OPTIONS: Array<[TextEntranceAnimation, string]> = [
  ["none", "Sem animação"], ["fade", "Fade"], ["slide-up", "Subir"],
  ["slide-down", "Descer"], ["slide-left", "Da esquerda"],
  ["slide-right", "Da direita"], ["scale", "Zoom"], ["typewriter", "Digitação"],
];
const EXIT_OPTIONS: Array<[TextExitAnimation, string]> = [
  ["none", "Sem animação"], ["fade", "Fade"], ["slide-up", "Subir"],
  ["slide-down", "Descer"], ["scale", "Encolher"],
];

export default function SequenceEditor({
  steps, selectedIndex, disabled, errors, onSelect, onChange, onAdd,
  onDuplicate, onRemove, onMove, onPreview, onPreset,
}: SequenceEditorProps) {
  const selected = steps[selectedIndex];
  const update = (change: Partial<AnimationStep>) => {
    if (selected) onChange(selectedIndex, { ...selected, ...change });
  };

  return (
    <div className={styles.sequenceEditor}>
      <label className={styles.field}>
        <span>Modelo de sequência</span>
        <select defaultValue="custom" disabled={disabled} onChange={(event) => onPreset(event.target.value as SequencePreset)}>
          <option value="custom">Personalizada</option>
          <option value="full-demo">Demonstração completa</option>
          <option value="escalation">Escalada</option>
          <option value="recovery">Recuperação</option>
        </select>
      </label>

      <div className={styles.stepList} aria-label="Etapas da sequência">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={index === selectedIndex ? styles.stepActive : styles.stepItem}
            onClick={() => onSelect(index)}
          >
            <span>{index + 1}. {ECG_PROFILES[step.status].label}</span>
            <small>{(step.durationMs / 1_000).toFixed(1)} s</small>
          </button>
        ))}
      </div>

      <div className={styles.stepActions}>
        <button type="button" disabled={disabled} onClick={onAdd}>Adicionar</button>
        <button type="button" disabled={disabled || !selected} onClick={() => onDuplicate(selectedIndex)}>Duplicar</button>
        <button type="button" disabled={disabled || !selected || steps.length <= 1} onClick={() => onRemove(selectedIndex)}>Remover</button>
        <button type="button" disabled={disabled || selectedIndex === 0} onClick={() => onMove(selectedIndex, -1)} aria-label="Mover etapa para cima">↑</button>
        <button type="button" disabled={disabled || selectedIndex >= steps.length - 1} onClick={() => onMove(selectedIndex, 1)} aria-label="Mover etapa para baixo">↓</button>
      </div>

      {selected ? (
        <fieldset className={styles.stepEditorFields} disabled={disabled}>
          <legend>Editar etapa {selectedIndex + 1}</legend>
          <p className={styles.selectedStepSummary} aria-live="polite">
            Status configurado: <strong>{ECG_PROFILES[selected.status].label}</strong>
          </p>
          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Status</span>
              <select value={selected.status} onChange={(event) => update({ status: event.target.value as HeartStatus })}>
                {HEART_STATUSES.map((status) => <option key={status} value={status}>{ECG_PROFILES[status].label}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Duração (s)</span>
              <input type="number" min="1" max="300" step="0.1" value={selected.durationMs / 1_000} onChange={(event) => update({ durationMs: Number(event.target.value) * 1_000 })} />
            </label>
          </div>

          <label className={styles.field}><span>Texto da etapa</span><input type="text" maxLength={40} value={selected.background.text} onChange={(event) => update({ background: { ...selected.background, text: event.target.value } })} /></label>
          <div className={styles.twoColumns}>
            <label className={styles.field}><span>Fonte</span><select value={selected.background.font} onChange={(event) => update({ background: { ...selected.background, font: event.target.value as BackgroundFont } })}>{FONT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className={styles.field}><span>Tamanho (vw)</span><input type="number" min="8" max="30" value={selected.background.size} onChange={(event) => update({ background: { ...selected.background, size: Number(event.target.value) } })} /></label>
          </div>
          <label className={styles.field}><span>Opacidade: {selected.background.opacity}%</span><input type="range" min="0" max="25" value={selected.background.opacity} onChange={(event) => update({ background: { ...selected.background, opacity: Number(event.target.value) } })} /></label>

          <div className={styles.twoColumns}>
            <label className={styles.field}><span>Aparecer após (s)</span><input type="number" min="0" step="0.1" value={selected.textTiming.delayMs / 1_000} onChange={(event) => update({ textTiming: { ...selected.textTiming, delayMs: Number(event.target.value) * 1_000 } })} /></label>
            <label className={styles.field}><span>Visível por (s, 0 = até fim)</span><input type="number" min="0" step="0.1" value={selected.textTiming.visibleMs / 1_000} onChange={(event) => update({ textTiming: { ...selected.textTiming, visibleMs: Number(event.target.value) * 1_000 } })} /></label>
          </div>
          <div className={styles.twoColumns}>
            <label className={styles.field}><span>Entrada</span><select value={selected.textTiming.enterAnimation} onChange={(event) => update({ textTiming: { ...selected.textTiming, enterAnimation: event.target.value as TextEntranceAnimation } })}>{ENTRANCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className={styles.field}><span>Duração entrada (s)</span><input type="number" min="0" max="5" step="0.1" value={selected.textTiming.enterDurationMs / 1_000} onChange={(event) => update({ textTiming: { ...selected.textTiming, enterDurationMs: Number(event.target.value) * 1_000 } })} /></label>
            <label className={styles.field}><span>Saída</span><select value={selected.textTiming.exitAnimation} onChange={(event) => update({ textTiming: { ...selected.textTiming, exitAnimation: event.target.value as TextExitAnimation } })}>{EXIT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className={styles.field}><span>Duração saída (s)</span><input type="number" min="0" max="5" step="0.1" value={selected.textTiming.exitDurationMs / 1_000} onChange={(event) => update({ textTiming: { ...selected.textTiming, exitDurationMs: Number(event.target.value) * 1_000 } })} /></label>
          </div>
          {errors[selected.id] ? <p className={styles.fieldError} role="alert">{errors[selected.id]}</p> : null}
          <button type="button" className={styles.previewButton} onClick={() => onPreview(selectedIndex)}>Visualizar etapa</button>
        </fieldset>
      ) : null}
    </div>
  );
}
