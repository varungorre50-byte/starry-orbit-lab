import { Camera } from "lucide-react";
import type { CameraPreset } from "./CameraRig";

const PRESETS: { id: CameraPreset; label: string; icon: string }[] = [
  { id: "default", label: "Default", icon: "🎬" },
  { id: "top",     label: "Top",     icon: "⬇️" },
  { id: "side",    label: "Side",    icon: "➡️" },
  { id: "close",   label: "Close",   icon: "🔍" },
  { id: "far",     label: "Far",     icon: "🌌" },
  { id: "tilted",  label: "Tilted",  icon: "📐" },
];

interface Props {
  active: CameraPreset;
  onChange: (preset: CameraPreset) => void;
}

export const CameraPresets = ({ active, onChange }: Props) => {
  return (
    <div className="absolute left-4 bottom-4 z-10 bg-card/85 backdrop-blur-md border border-border rounded-xl p-3 shadow-lg max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground">
        <Camera size={14} className="text-primary" />
        <span>Camera Angles</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              active === p.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-foreground border-border hover:bg-muted/70"
            }`}
            aria-label={`Switch to ${p.label} camera angle`}
          >
            <span className="mr-1">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
