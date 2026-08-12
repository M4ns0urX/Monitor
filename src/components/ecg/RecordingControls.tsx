"use client";

import type { MonitorRecorderController } from "@/hooks/useMonitorRecorder";
import { formatRecordingDuration } from "@/lib/ecg/recording";

import styles from "./MonitorDisplay.module.css";

type RecordingControlsProps = {
  recorder: MonitorRecorderController;
  onRecordingStarted: () => void;
};

export default function RecordingControls({
  recorder,
  onRecordingStarted,
}: RecordingControlsProps) {
  const startRecording = async () => {
    onRecordingStarted();
    await recorder.start();
  };

  return (
    <section className={styles.recordingSection} aria-label="Gravação do monitor">
      <div className={styles.recordingHeader}>
        <div>
          <h3>Gravar animação</h3>
          <p>Capture a aba completa e baixe o resultado em WebM.</p>
        </div>
        {recorder.state === "recording" ? (
          <output className={styles.recordingTimer} aria-live="polite">
            <span aria-hidden="true" />
            {formatRecordingDuration(recorder.elapsedMs)}
          </output>
        ) : null}
      </div>

      {!recorder.supported ? (
        <p className={styles.recordingMessage} role="status">
          Este navegador não oferece gravação de tela.
        </p>
      ) : null}

      {recorder.error ? (
        <p className={styles.fieldError} role="alert">{recorder.error}</p>
      ) : null}

      <div className={styles.recordingActions}>
        {recorder.state === "recording" ? (
          <button type="button" className={styles.stopRecordingButton} onClick={recorder.stop}>
            Parar gravação
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={!recorder.supported || recorder.state === "requesting"}
          >
            {recorder.state === "requesting" ? "Aguardando seleção…" : "Gravar vídeo"}
          </button>
        )}

        {recorder.downloadUrl && recorder.filename ? (
          <>
            <a href={recorder.downloadUrl} download={recorder.filename}>
              Baixar WebM
            </a>
            <button type="button" onClick={recorder.discard}>Descartar</button>
          </>
        ) : null}
      </div>

      <p className={styles.recordingHint}>
        Ao iniciar, escolha esta aba na janela do navegador. O painel será fechado antes da captura.
      </p>
    </section>
  );
}
