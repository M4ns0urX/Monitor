import type { CSSProperties } from "react";

import type {
  BackgroundFont,
  BackgroundTextSettings,
  EcgProfile,
  TextAnimationPhase,
  TextEntranceAnimation,
  TextExitAnimation,
} from "@/lib/ecg/types";

import styles from "./MonitorDisplay.module.css";

type BackgroundTextProps = {
  settings: BackgroundTextSettings;
  profile: EcgProfile;
  phase?: TextAnimationPhase;
  enterAnimation?: TextEntranceAnimation;
  exitAnimation?: TextExitAnimation;
  enterDurationMs?: number;
  exitDurationMs?: number;
  paused?: boolean;
};

const FONT_FAMILIES: Record<BackgroundFont, string> = {
  "geist-sans": "var(--font-geist-sans), sans-serif",
  "geist-mono": "var(--font-geist-mono), monospace",
  "system-sans": "ui-sans-serif, system-ui, sans-serif",
  "system-serif": "ui-serif, Georgia, serif",
};

export default function BackgroundText({
  settings,
  profile,
  phase = "visible",
  enterAnimation = "fade",
  exitAnimation = "fade",
  enterDurationMs = 600,
  exitDurationMs = 500,
  paused = false,
}: BackgroundTextProps) {
  if (!settings.text) {
    return null;
  }

  const { red, green, blue } = profile.traceColor;
  const style: CSSProperties & Record<`--${string}`, string> = {
    color: `rgb(${red} ${green} ${blue})`,
    fontFamily: FONT_FAMILIES[settings.font],
    fontSize: `clamp(3rem, ${settings.size}vw, 24rem)`,
    opacity: settings.opacity / 100,
    "--text-enter-duration": `${enterDurationMs}ms`,
    "--text-exit-duration": `${exitDurationMs}ms`,
    animationPlayState: paused ? "paused" : "running",
  };

  const animation = phase === "entering" ? enterAnimation : exitAnimation;

  return (
    <div
      className={`${styles.backgroundText} ${styles[`text-${phase}`]} ${styles[`text-${animation}`]}`}
      style={style}
      aria-hidden="true"
    >
      {settings.text}
    </div>
  );
}
