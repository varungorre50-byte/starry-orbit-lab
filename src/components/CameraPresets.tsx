import { Camera, ChevronDown, Globe, Orbit, Telescope } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PLANETS } from "@/data/planetData";
import type { CameraMode } from "./CameraRig";

interface Props {
  mode: CameraMode;
  onChange: (mode: CameraMode) => void;
}

const modeLabel = (m: CameraMode) => {
  if (m.type === "overview") return "Overview";
  if (m.type === "closeup") return `Close-up: ${m.planet}`;
  return `Follow: ${m.planet}`;
};

const modeIcon = (m: CameraMode) => {
  if (m.type === "overview") return <Telescope size={14} className="text-primary" />;
  if (m.type === "closeup") return <Globe size={14} className="text-primary" />;
  return <Orbit size={14} className="text-primary" />;
};

export const CameraPresets = ({ mode, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "closeup" | "follow">(mode.type);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTab(mode.type), [mode.type]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (m: CameraMode) =>
    m.type === mode.type &&
    (m.type === "overview" ||
      (mode.type !== "overview" && (m as any).planet === (mode as any).planet));

  return (
    <div ref={containerRef} className="absolute right-4 bottom-4 z-10">
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden w-64">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          aria-expanded={open}
        >
          <Camera size={16} className="text-primary" />
          {modeIcon(mode)}
          <span className="flex-1 text-left truncate">{modeLabel(mode)}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-border animate-fade-in">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {([
                { id: "overview", label: "Overview", Icon: Telescope },
                { id: "closeup", label: "Close-up", Icon: Globe },
                { id: "follow", label: "Follow", Icon: Orbit },
              ] as const).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id);
                    if (id === "overview") onChange({ type: "overview" });
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs transition-colors ${
                    tab === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {/* Body */}
            {tab === "overview" ? (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                Wide view of the entire solar system.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {PLANETS.map((p) => {
                  const target: CameraMode =
                    tab === "closeup"
                      ? { type: "closeup", planet: p.name }
                      : { type: "follow", planet: p.name };
                  const active = isActive(target);
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        onChange(target);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-border"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="flex-1 text-left">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.info.type.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
