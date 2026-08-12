import type { SequencePlaybackState } from "./types.ts";

export type KeyboardShortcutEvent = {
  code: string;
  key: string;
  repeat: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTagName: string;
  targetEditable: boolean;
};

const INTERACTIVE_TAGS = new Set([
  "A",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
]);

export function shouldStartSequenceWithSpace(
  event: KeyboardShortcutEvent,
  playbackState: SequencePlaybackState,
): boolean {
  const isSpace =
    event.code === "Space" || event.key === " " || event.key === "Spacebar";
  const canStart = playbackState === "idle" || playbackState === "completed";

  return (
    isSpace &&
    canStart &&
    !event.repeat &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.targetEditable &&
    !INTERACTIVE_TAGS.has(event.targetTagName.toUpperCase())
  );
}

export function shouldOpenSettingsWithOne(
  event: KeyboardShortcutEvent,
): boolean {
  const isOne =
    event.key === "1" || event.code === "Digit1" || event.code === "Numpad1";

  return (
    isOne &&
    !event.repeat &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.targetEditable &&
    !INTERACTIVE_TAGS.has(event.targetTagName.toUpperCase())
  );
}
