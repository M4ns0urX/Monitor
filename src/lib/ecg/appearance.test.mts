import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceBpm,
  colorToHex,
  createDefaultMonitorAppearance,
  effectiveBpm,
  hexToColor,
  normalizeHexColor,
  validateHexColor,
} from "./appearance.ts";

test("converte cores entre RGB e hexadecimal", () => {
  assert.equal(colorToHex({ red: 52, green: 211, blue: 153 }), "#34D399");
  assert.deepEqual(hexToColor("#F87171"), { red: 248, green: 113, blue: 113 });
});

test("valida apenas cores hexadecimais completas", () => {
  assert.equal(validateHexColor("#01040D"), true);
  assert.equal(validateHexColor("01040D"), false);
  assert.equal(validateHexColor("#GGGGGG"), false);
});

test("normaliza cores hexadecimais válidas para maiúsculas", () => {
  assert.equal(normalizeHexColor("#f87171"), "#F87171");
  assert.equal(normalizeHexColor("  #01040d  "), "#01040D");
});

test("não normaliza valores hexadecimais inválidos", () => {
  assert.equal(normalizeHexColor("34D399"), null);
  assert.equal(normalizeHexColor("#FFF"), null);
  assert.equal(normalizeHexColor("#GGGGGG"), null);
});

test("cria aparência com as cores padrão dos cinco estados", () => {
  const appearance = createDefaultMonitorAppearance();

  assert.equal(appearance.statusColors.normal, "#34D399");
  assert.equal(appearance.statusColors.high, "#F87171");
  assert.equal(appearance.backgroundColor, "#01040D");
  assert.equal(appearance.pulseSpacing, 1);
  assert.equal(appearance.bpmStepPerSecond, 5);
});

test("avança o BPM em direção ao alvo sem ultrapassar", () => {
  assert.equal(advanceBpm(70, 83, 5), 75);
  assert.equal(advanceBpm(80, 83, 5), 83);
  assert.equal(advanceBpm(90, 72, 5), 85);
  assert.equal(advanceBpm(74, 72, 5), 72);
});

test("calcula o BPM visual efetivo a partir do espaçamento", () => {
  assert.equal(effectiveBpm(72, 1), 72);
  assert.equal(effectiveBpm(72, 1.5), 48);
  assert.equal(effectiveBpm(0, 2), 0);
});
