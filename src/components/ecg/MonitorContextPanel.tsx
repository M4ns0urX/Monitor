"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import type { MonitorRecorderController } from "@/hooks/useMonitorRecorder";
import { ECG_PROFILES, HEART_STATUSES } from "@/lib/ecg/profiles";
import type {
  AppearanceController,
  BackgroundFont,
  BackgroundTextSettings,
  HeartStatus,
  SequenceController,
} from "@/lib/ecg/types";

import styles from "./MonitorDisplay.module.css";
import RecordingControls from "./RecordingControls";
import SequenceEditor from "./SequenceEditor";
import SequencePlaybackControls from "./SequencePlaybackControls";

type MonitorContextPanelProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  settings: BackgroundTextSettings;
  status: HeartStatus;
  sequence: SequenceController;
  appearance: AppearanceController;
  recorder: MonitorRecorderController;
  onSettingsChange: (settings: BackgroundTextSettings) => void;
  onStatusChange: (status: HeartStatus) => void;
  onClose: () => void;
};

const FONT_OPTIONS: Array<{ value: BackgroundFont; label: string }> = [
  { value: "geist-sans", label: "Geist Sans" },
  { value: "geist-mono", label: "Geist Mono" },
  { value: "system-sans", label: "Sans Serif" },
  { value: "system-serif", label: "Serif" },
];

export default function MonitorContextPanel({
  panelRef, settings, status, sequence, appearance, recorder, onSettingsChange,
  onStatusChange, onClose,
}: MonitorContextPanelProps) {
  const textInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"appearance" | "sequence">("appearance");
  const automationActive = sequence.progress.state === "playing" || sequence.progress.state === "paused";

  useEffect(() => {
    textInputRef.current?.focus();
    textInputRef.current?.select();
  }, []);

  const updateSettings = (change: Partial<BackgroundTextSettings>) => {
    onSettingsChange({ ...settings, ...change });
  };

  return (
    <div id="monitor-settings-panel" ref={panelRef} className={styles.contextPanel} role="dialog" aria-modal="false" aria-label="Configurações do monitor" onContextMenu={(event) => event.stopPropagation()}>
      <div className={styles.panelHeader}>
        <h2>Configurações</h2>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar configurações">×</button>
      </div>

      <div className={styles.panelTabs} role="tablist" aria-label="Seções das configurações">
        <button type="button" role="tab" aria-selected={activeTab === "appearance"} onClick={() => setActiveTab("appearance")}>Aparência</button>
        <button type="button" role="tab" aria-selected={activeTab === "sequence"} onClick={() => setActiveTab("sequence")}>Sequência</button>
      </div>

      <RecordingControls recorder={recorder} onRecordingStarted={onClose} />

      {activeTab === "appearance" ? (
        <div role="tabpanel" className={styles.tabPanel}>
          <label className={styles.field}><span>Texto</span><input ref={textInputRef} type="text" value={settings.text} maxLength={40} onChange={(event) => updateSettings({ text: event.target.value })} /></label>
          <label className={styles.field}><span>Fonte</span><select value={settings.font} onChange={(event) => updateSettings({ font: event.target.value as BackgroundFont })}>{FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className={styles.field}><span className={styles.rangeLabel}><span>Tamanho</span><output>{settings.size} vw</output></span><input type="range" min="8" max="30" step="1" value={settings.size} onChange={(event) => updateSettings({ size: Number(event.target.value) })} /></label>
          <label className={styles.field}><span className={styles.rangeLabel}><span>Opacidade</span><output>{settings.opacity}%</output></span><input type="range" min="0" max="25" step="1" value={settings.opacity} onChange={(event) => updateSettings({ opacity: Number(event.target.value) })} /></label>
          <label className={styles.field}><span>Status</span><select value={status} disabled={automationActive} onChange={(event) => onStatusChange(event.target.value as HeartStatus)}>{HEART_STATUSES.map((heartStatus) => <option key={heartStatus} value={heartStatus}>{ECG_PROFILES[heartStatus].label}</option>)}</select></label>
          <section className={styles.appearanceSection} aria-label="Cores e ritmo visual">
            <div className={styles.colorField}>
              <label htmlFor="status-color">Cor de {ECG_PROFILES[status].label}</label>
              <input
                id="status-color"
                type="color"
                value={appearance.settings.statusColors[status]}
                onChange={(event) => appearance.setStatusColor(status, event.target.value.toUpperCase())}
              />
              <code>{appearance.settings.statusColors[status]}</code>
              <button type="button" onClick={() => appearance.resetStatusColor(status)}>Restaurar</button>
            </div>
            <div className={styles.colorField}>
              <label htmlFor="background-color">Cor do fundo</label>
              <input
                id="background-color"
                type="color"
                value={appearance.settings.backgroundColor}
                onChange={(event) => appearance.update({ backgroundColor: event.target.value.toUpperCase() })}
              />
              <code>{appearance.settings.backgroundColor}</code>
            </div>
            <label className={styles.field}>
              <span className={styles.rangeLabel}><span>Espaçamento dos pulsos</span><output>{appearance.settings.pulseSpacing.toFixed(1)}×</output></span>
              <input type="range" min="0.5" max="2" step="0.1" value={appearance.settings.pulseSpacing} onChange={(event) => appearance.update({ pulseSpacing: Number(event.target.value) })} />
            </label>
            <p className={styles.helpText}>BPM-alvo visual: {appearance.targetBpm}. O traçado e a leitura permanecem sincronizados.</p>
            <label className={styles.field}>
              <span className={styles.rangeLabel}><span>Progressão do BPM</span><output>{appearance.settings.bpmStepPerSecond} BPM/s</output></span>
              <input type="range" min="1" max="30" step="1" value={appearance.settings.bpmStepPerSecond} onChange={(event) => appearance.update({ bpmStepPerSecond: Number(event.target.value) })} />
            </label>
            <button type="button" className={styles.previewButton} onClick={appearance.resetAll}>Restaurar todas as cores e ajustes</button>
          </section>
          {automationActive ? <p className={styles.helpText}>A sequência está controlando o estado do monitor.</p> : null}
        </div>
      ) : (
        <div role="tabpanel" className={styles.tabPanel}>
          <SequencePlaybackControls
            progress={sequence.progress}
            stepCount={sequence.steps.length}
            loop={sequence.loop}
            canStart={sequence.validation.valid}
            onLoopChange={sequence.setLoop}
            onStart={sequence.start}
            onPause={sequence.pause}
            onResume={sequence.resume}
            onStop={sequence.stop}
            onRestart={sequence.restart}
            onPrevious={sequence.previous}
            onNext={sequence.next}
            statusLabel={ECG_PROFILES[sequence.steps[sequence.progress.stepIndex]?.status ?? status].label}
          />
          {sequence.validation.globalError ? <p className={styles.fieldError} role="alert">{sequence.validation.globalError}</p> : null}
          <SequenceEditor
            steps={sequence.steps}
            selectedIndex={sequence.selectedIndex}
            disabled={automationActive}
            errors={sequence.validation.errors}
            onSelect={sequence.setSelectedIndex}
            onChange={sequence.updateStep}
            onAdd={sequence.addStep}
            onDuplicate={sequence.duplicateStep}
            onRemove={sequence.removeStep}
            onMove={sequence.moveStep}
            onPreview={sequence.preview}
            onPreset={sequence.applyPreset}
          />
        </div>
      )}
    </div>
  );
}
