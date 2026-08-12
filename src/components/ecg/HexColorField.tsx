"use client";

import { useState } from "react";

import { normalizeHexColor } from "@/lib/ecg/appearance";

import styles from "./MonitorDisplay.module.css";

type HexColorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
};

export default function HexColorField({
  id,
  label,
  value,
  onChange,
  onReset,
}: HexColorFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const displayedValue = draft ?? value;
  const validDraft = normalizeHexColor(displayedValue);
  const errorId = `${id}-error`;

  const updateDraft = (nextValue: string) => {
    setDraft(nextValue);
    const normalized = normalizeHexColor(nextValue);
    if (normalized) {
      onChange(normalized);
      setDraft(null);
    }
  };

  const reset = () => {
    setDraft(null);
    onReset();
  };

  return (
    <div className={styles.hexColorField}>
      <label htmlFor={`${id}-hex`}>{label}</label>
      <div className={styles.hexColorControls}>
        <input
          id={`${id}-picker`}
          type="color"
          value={value}
          aria-label={`Selecionar ${label.toLowerCase()}`}
          onChange={(event) => updateDraft(event.target.value.toUpperCase())}
        />
        <input
          id={`${id}-hex`}
          type="text"
          className={styles.hexColorInput}
          value={displayedValue}
          maxLength={9}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!validDraft}
          aria-describedby={!validDraft ? errorId : undefined}
          onChange={(event) => updateDraft(event.target.value)}
          onBlur={() => {
            if (validDraft) setDraft(null);
          }}
        />
        <button type="button" onClick={reset}>Restaurar</button>
      </div>
      {!validDraft ? (
        <p id={errorId} className={styles.hexColorError} role="alert">
          Use o formato #RRGGBB.
        </p>
      ) : null}
    </div>
  );
}
