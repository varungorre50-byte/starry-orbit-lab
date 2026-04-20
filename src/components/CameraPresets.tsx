import { Camera, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { CameraPreset } from "./CameraRig";

const PRESETS: { id: CameraPreset; label: string; icon: string }[] = [
  { id: "default", label: "Default View", icon: "🎬" },
  { id: "top",     label: "Top Down",   icon: "⬇️" },
  { id: "side",    label: "Side View",  icon: "➡️" },
  { id: "close",   label: "Close Up",   icon: "🔍" },
  { id: "far",     label: "Far Away",   icon: "🌌" },
  { id: "tilted",  label: "Tilted",     icon: "📐" },
];

interface Props {
  active: CameraPreset;
  onChange: (preset: CameraPreset) => void;
}

export const CameraPresets = ({ active, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePreset = PRESETS.find((p) => p.id === active) ?? PRESETS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="absolute right-4 bottom-4 z-10">
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          aria-label="Open camera angle options"
          aria-expanded={open}
        >
          <Camera size={16} className="text-primary" />
          <span className="mr-1">{activePreset.icon}</span>
          <span>{activePreset.label}</span>
          <ChevronDown size={14} className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-border">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  active === p.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="w-5">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
