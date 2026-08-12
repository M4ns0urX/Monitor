"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { useMonitorRecorder } from "@/hooks/useMonitorRecorder";
import {
  shouldOpenSettingsWithOne,
  shouldStartSequenceWithSpace,
} from "@/lib/ecg/keyboard";
import type {
  AppearanceController,
  BackgroundTextSettings,
  EcgProfile,
  HeartStatus,
  SequenceController,
} from "@/lib/ecg/types";

import BackgroundText from "./BackgroundText";
import EcgCanvas from "./EcgCanvas";
import MonitorContextPanel from "./MonitorContextPanel";
import styles from "./MonitorDisplay.module.css";
import VitalReadout from "./VitalReadout";

type MonitorDisplayProps = {
  profile: EcgProfile;
  status: HeartStatus;
  onStatusChange: (status: HeartStatus) => void;
  backgroundText: BackgroundTextSettings;
  onBackgroundTextChange: (settings: BackgroundTextSettings) => void;
  sequence: SequenceController;
  appearance: AppearanceController;
};

export default function MonitorDisplay({
  profile,
  status,
  onStatusChange,
  backgroundText,
  onBackgroundTextChange,
  sequence,
  appearance,
}: MonitorDisplayProps) {
  const monitorRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const recorder = useMonitorRecorder();
  const playbackState = sequence.progress.state;
  const sequenceCanStart = sequence.validation.valid;
  const startSequence = sequence.start;

  useEffect(() => {
    const handleSpaceShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactiveTarget = target?.closest(
        "a, button, input, select, textarea",
      );

      if (
        !sequenceCanStart ||
        !shouldStartSequenceWithSpace(
          {
            code: event.code,
            key: event.key,
            repeat: event.repeat,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            targetTagName: interactiveTarget?.tagName ?? target?.tagName ?? "",
            targetEditable: target instanceof HTMLElement && target.isContentEditable,
          },
          playbackState,
        )
      ) {
        return;
      }

      event.preventDefault();
      startSequence();
    };

    document.addEventListener("keydown", handleSpaceShortcut);
    return () => document.removeEventListener("keydown", handleSpaceShortcut);
  }, [playbackState, sequenceCanStart, startSequence]);

  useEffect(() => {
    const handleSettingsShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactiveTarget = target?.closest(
        "a, button, input, select, textarea",
      );

      if (!shouldOpenSettingsWithOne({
        code: event.code,
        key: event.key,
        repeat: event.repeat,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        targetTagName: interactiveTarget?.tagName ?? target?.tagName ?? "",
        targetEditable: target instanceof HTMLElement && target.isContentEditable,
      })) {
        return;
      }

      event.preventDefault();
      setPanelOpen(true);
    };

    document.addEventListener("keydown", handleSettingsShortcut);
    return () => document.removeEventListener("keydown", handleSettingsShortcut);
  }, []);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target)) {
        setPanelOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
        monitorRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [panelOpen]);

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setPanelOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const opensContextPanel =
      event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");

    if (!opensContextPanel) {
      return;
    }

    event.preventDefault();
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    monitorRef.current?.focus();
  };

  return (
    <section
      ref={monitorRef}
      className={styles.monitor}
      style={{ backgroundColor: appearance.settings.backgroundColor }}
      aria-label="Simulação visual de ECG"
      tabIndex={0}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <BackgroundText
        settings={backgroundText}
        profile={profile}
        phase={sequence.progress.state === "idle" ? "visible" : sequence.progress.textPhase}
        enterAnimation={sequence.steps[sequence.progress.stepIndex]?.textTiming.enterAnimation}
        exitAnimation={sequence.steps[sequence.progress.stepIndex]?.textTiming.exitAnimation}
        enterDurationMs={sequence.steps[sequence.progress.stepIndex]?.textTiming.enterDurationMs}
        exitDurationMs={sequence.steps[sequence.progress.stepIndex]?.textTiming.exitDurationMs}
        paused={sequence.progress.state === "paused"}
      />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.trace}>
        <EcgCanvas profile={profile} />
      </div>
      <div className={styles.sheen} aria-hidden="true" />

      <div className={styles.readoutPosition}>
        <VitalReadout profile={profile} />
      </div>

      {panelOpen ? (
        <MonitorContextPanel
          panelRef={panelRef}
          settings={backgroundText}
          status={status}
          onSettingsChange={onBackgroundTextChange}
          onStatusChange={onStatusChange}
          sequence={sequence}
          appearance={appearance}
          recorder={recorder}
          onClose={closePanel}
        />
      ) : null}
    </section>
  );
}
