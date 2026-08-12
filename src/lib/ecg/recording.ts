const WEBM_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

export function chooseRecordingMimeType(
  isSupported: (mimeType: string) => boolean,
): string {
  return WEBM_MIME_TYPES.find(isSupported) ?? "";
}

export function createRecordingFilename(date = new Date()): string {
  return `cardio-monitor-${date.toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
}

export function formatRecordingDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
