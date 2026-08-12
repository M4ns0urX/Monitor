import assert from "node:assert/strict";
import test from "node:test";

import { shouldStartSequenceWithSpace } from "./keyboard.ts";

const keyboardEvent = (
  change: Partial<Parameters<typeof shouldStartSequenceWithSpace>[0]> = {},
): Parameters<typeof shouldStartSequenceWithSpace>[0] => ({
  code: "Space",
  key: " ",
  repeat: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  targetTagName: "SECTION",
  targetEditable: false,
  ...change,
});

test("permite Space quando a sequência está parada", () => {
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent(), "idle"), true);
});

test("permite Space após a sequência ser concluída", () => {
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent(), "completed"), true);
});

test("ignora Space durante reprodução ou pausa", () => {
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent(), "playing"), false);
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent(), "paused"), false);
});

test("aceita identificação por code ou key", () => {
  assert.equal(
    shouldStartSequenceWithSpace(keyboardEvent({ code: "", key: "Spacebar" }), "idle"),
    true,
  );
  assert.equal(
    shouldStartSequenceWithSpace(keyboardEvent({ code: "Enter", key: "Enter" }), "idle"),
    false,
  );
});

test("ignora repetição e combinações com modificadores", () => {
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent({ repeat: true }), "idle"), false);
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent({ ctrlKey: true }), "idle"), false);
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent({ altKey: true }), "idle"), false);
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent({ metaKey: true }), "idle"), false);
  assert.equal(shouldStartSequenceWithSpace(keyboardEvent({ shiftKey: true }), "idle"), false);
});

test("ignora alvos interativos ou editáveis", () => {
  for (const targetTagName of ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]) {
    assert.equal(
      shouldStartSequenceWithSpace(keyboardEvent({ targetTagName }), "idle"),
      false,
    );
  }

  assert.equal(
    shouldStartSequenceWithSpace(keyboardEvent({ targetEditable: true }), "idle"),
    false,
  );
});
