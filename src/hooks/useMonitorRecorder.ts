"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  chooseRecordingMimeType,
  createRecordingFilename,
} from "@/lib/ecg/recording";

export type RecordingState =
  | "idle"
  | "requesting"
  | "recording"
  | "ready"
  | "error";

export type MonitorRecorderController = {
  supported: boolean;
  state: RecordingState;
  elapsedMs: number;
  downloadUrl: string | null;
  filename: string | null;
  error: string | null;
  start: () => Promise<boolean>;
  stop: () => void;
  discard: () => void;
};

const errorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "A seleção da tela foi cancelada ou a permissão foi negada.";
  }

  return "Não foi possível iniciar a gravação neste navegador.";
};

const subscribeToRecordingSupport = () => () => undefined;
const getRecordingSupport = () =>
  typeof navigator.mediaDevices?.getDisplayMedia === "function" &&
  typeof MediaRecorder !== "undefined";
const getServerRecordingSupport = () => false;

export function useMonitorRecorder(): MonitorRecorderController {
  const supported = useSyncExternalStore(
    subscribeToRecordingSupport,
    getRecordingSupport,
    getServerRecordingSupport,
  );
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const downloadUrlRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const revokeDownload = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
    setDownloadUrl(null);
    setFilename(null);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      const recorder = recorderRef.current;
      recorderRef.current = null;
      recorder?.stop();
      releaseStream();
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, [clearTimer, releaseStream]);

  const stop = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.stop();
    } else {
      releaseStream();
    }
  }, [clearTimer, releaseStream]);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.mediaDevices?.getDisplayMedia !== "function" ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("A gravação de tela não é suportada neste navegador.");
      setState("error");
      return false;
    }

    revokeDownload();
    setError(null);
    setElapsedMs(0);
    setState("requesting");

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 } },
        audio: false,
      });
      const mimeType = chooseRecordingMimeType(MediaRecorder.isTypeSupported);
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        clearTimer();
        releaseStream();
        recorderRef.current = null;
        const chunks = chunksRef.current;
        chunksRef.current = [];

        if (chunks.length === 0) {
          setError("A gravação terminou sem produzir conteúdo.");
          setState("error");
          return;
        }

        const blob = new Blob(chunks, {
          type: recorder.mimeType || "video/webm",
        });
        const url = URL.createObjectURL(blob);
        downloadUrlRef.current = url;
        setDownloadUrl(url);
        setFilename(createRecordingFilename());
        setState("ready");
      });

      stream.getVideoTracks()[0]?.addEventListener("ended", stop, { once: true });
      recorder.start(1_000);
      startedAtRef.current = performance.now();
      timerRef.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startedAtRef.current);
      }, 250);
      setState("recording");
      return true;
    } catch (caughtError) {
      releaseStream();
      setError(errorMessage(caughtError));
      setState("error");
      return false;
    }
  }, [clearTimer, releaseStream, revokeDownload, stop]);

  const discard = useCallback(() => {
    revokeDownload();
    setError(null);
    setElapsedMs(0);
    setState("idle");
  }, [revokeDownload]);

  return {
    supported,
    state,
    elapsedMs,
    downloadUrl,
    filename,
    error,
    start,
    stop,
    discard,
  };
}
