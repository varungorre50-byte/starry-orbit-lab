import { SUN_DATA } from "@/data/planetData";
import { X } from "lucide-react";

export const SunInfoPanel = ({ onClose }: { onClose: () => void }) => {
  const { info } = SUN_DATA;
  return (
    <div className="absolute right-4 top-20 bottom-4 w-[360px] max-w-[90vw] bg-card/90 backdrop-blur-md border border-border rounded-xl p-5 overflow-y-auto z-20 animate-in slide-in-from-right-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-primary">☀️ The Sun</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        <InfoRow label="Type" value={info.type} />
        <InfoRow label="Diameter" value={info.diameter} />
        <InfoRow label="Temperature" value={info.temperature} />
        <InfoRow label="Gravity" value={info.gravity} />
        <InfoRow label="Age" value={info.age} />
        <InfoRow label="Mass" value={info.mass} />
        <InfoRow label="Luminosity" value={info.luminosity} />

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-primary mb-1.5">Composition</h3>
          <div className="flex flex-wrap gap-1.5">
            {info.composition.map((c) => (
              <span key={c} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-3">
    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm text-foreground text-right">{value}</span>
  </div>
);
