import type { EcgProfile } from "@/lib/ecg/types";

import styles from "./MonitorDisplay.module.css";

type VitalReadoutProps = {
  profile: EcgProfile;
};

export default function VitalReadout({ profile }: VitalReadoutProps) {
  const { red, green, blue } = profile.traceColor;
  const color = `rgb(${red} ${green} ${blue})`;

  return (
    <div
      className={styles.readout}
      role="status"
      aria-live="polite"
      aria-label={`Estado ${profile.label}, ${profile.bpm} BPM. Simulação visual sem finalidade médica.`}
      style={{ borderColor: `rgba(${red}, ${green}, ${blue}, 0.28)` }}
    >
      <span className={styles.bpmLabel}>BPM</span>
      <span key={`${profile.id}-${profile.bpm}`} className={styles.bpmValue} style={{ color }}>
        {profile.bpm}
      </span>
    </div>
  );
}
