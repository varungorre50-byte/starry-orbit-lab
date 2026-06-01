import { Camera, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type ViewAngle = "default" | "topDown" | "side" | "closeUp" | "farAway" | "tilted";

export const VIEW_ANGLES: { id: ViewAngle; label: string; position: [number, number, number] }[] = [
  { id: "default", label: "Default View", position: [0, 30, 50] },
  { id: "topDown", label: "Top Down", position: [0, 90, 0.001] },
  { id: "side", label: "Side View", position: [90, 0, 0] },
  { id: "closeUp", label: "Close Up", position: [0, 15, 25] },
  { id: "farAway", label: "Far Away", position: [0, 70, 140] },
  { id: "tilted", label: "Tilted", position: [40, 50, 60] },
];

interface Props {
  value: ViewAngle;
  onChange: (v: ViewAngle) => void;
}

export const ViewAngleSelector = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = VIEW_ANGLES.find((v) => v.id === value) ?? VIEW_ANGLES[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="absolute left-4 bottom-4 z-10">
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden w-44">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Camera size={16} className="text-primary" />
          <span className="flex-1 text-left truncate">{current.label}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-border animate-fade-in max-h-72 overflow-y-auto">
            {VIEW_ANGLES.map((v) => {
              const active = v.id === value;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    onChange(v.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Camera size={12} className={active ? "text-primary" : "text-muted-foreground"} />
                  <span className="flex-1 text-left">{v.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
