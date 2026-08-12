import assert from "node:assert/strict";
import test from "node:test";

import {
  chooseRecordingMimeType,
  createRecordingFilename,
  formatRecordingDuration,
} from "./recording.ts";

test("seleciona o primeiro MIME WebM suportado", () => {
  const supported = new Set(["video/webm;codecs=vp8,opus", "video/webm"]);

  assert.equal(
    chooseRecordingMimeType((mimeType) => supported.has(mimeType)),
    "video/webm;codecs=vp8,opus",
  );
});

test("retorna string vazia quando nenhum MIME explícito é suportado", () => {
  assert.equal(chooseRecordingMimeType(() => false), "");
});

test("gera nome WebM seguro e estável", () => {
  const date = new Date("2026-08-12T12:34:56.000Z");

  assert.equal(
    createRecordingFilename(date),
    "cardio-monitor-2026-08-12T12-34-56.webm",
  );
});

test("formata a duração da gravação em minutos e segundos", () => {
  assert.equal(formatRecordingDuration(0), "00:00");
  assert.equal(formatRecordingDuration(65_400), "01:05");
});
