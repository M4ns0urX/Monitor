"use client";

import { ECG_PROFILES, HEART_STATUSES } from "@/lib/ecg/profiles";
import { hexToColor } from "@/lib/ecg/appearance";
import type { HeartStatus } from "@/lib/ecg/types";

type StatusSelectorProps = {
  value: HeartStatus;
  onChange: (status: HeartStatus) => void;
  disabled?: boolean;
  colors?: Record<HeartStatus, string>;
};

export default function StatusSelector({
  value,
  onChange,
  disabled = false,
  colors,
}: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3" aria-label="Estado do monitor">
      {HEART_STATUSES.map((status) => {
        const active = status === value;
        const profile = ECG_PROFILES[status];
        const { red, green, blue } = colors
          ? hexToColor(colors[status])
          : profile.traceColor;

        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(status)}
            style={
              active
                ? {
                    borderColor: `rgba(${red}, ${green}, ${blue}, 0.9)`,
                    backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.14)`,
                    color: `rgb(${red} ${green} ${blue})`,
                    boxShadow: `0 0 22px rgba(${red}, ${green}, ${blue}, 0.12)`,
                  }
                : undefined
            }
            className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-45 ${
              active
                ? ""
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/35 hover:text-white"
            }`}
          >
            {profile.label}
          </button>
        );
      })}
    </div>
  );
}
