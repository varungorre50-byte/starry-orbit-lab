import type { PlanetData } from "@/data/planetData";
import { X } from "lucide-react";

export const PlanetInfoPanel = ({ planet, onClose }: { planet: PlanetData; onClose: () => void }) => {
  return (
    <div className="absolute right-4 top-20 bottom-4 w-[360px] max-w-[90vw] bg-card/90 backdrop-blur-md border border-border rounded-xl p-5 overflow-y-auto z-20 animate-in slide-in-from-right-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">{planet.name}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        <InfoRow label="Type" value={planet.info.type} />
        <InfoRow label="Diameter" value={planet.info.diameter} />
        <InfoRow label="Distance from Sun" value={planet.info.distanceFromSun} />
        <InfoRow label="Day Length" value={planet.info.dayLength} />
        <InfoRow label="Year Length" value={planet.info.yearLength} />
        <InfoRow label="Temperature" value={planet.info.temperature} />
        <InfoRow label="Moons" value={String(planet.info.moons)} />

        {/* Gravity Section */}
        <div className="pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-primary mb-2">⚖ Gravity</h3>
          <InfoRow label="Surface Gravity" value={planet.info.gravity} />
          <InfoRow
            label="Your weight (if 70 kg on Earth)"
            value={`${(70 * parseFloat(planet.info.gravity) / 9.81).toFixed(1)} kg`}
          />
          <InfoRow
            label="Gravity vs Earth"
            value={`${(parseFloat(planet.info.gravity) / 9.81 * 100).toFixed(0)}%`}
          />
          <div className="mt-2">
            <div className="text-[10px] text-muted-foreground mb-1">Gravity strength vs Earth</div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(parseFloat(planet.info.gravity) / 9.81 * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {parseFloat(planet.info.gravity) < 5
              ? "🪶 Very weak gravity — you could jump extremely high!"
              : parseFloat(planet.info.gravity) < 9
              ? "🏃 Lower than Earth — you'd feel lighter and bounce higher."
              : parseFloat(planet.info.gravity) < 12
              ? "🌍 Similar to Earth — feels familiar."
              : "🏋️ Very strong gravity — you'd feel much heavier and struggle to move."}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-primary mb-1.5">Atmosphere</h3>
          <div className="flex flex-wrap gap-1.5">
            {planet.info.atmosphere.map((gas) => (
              <span key={gas} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                {gas}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-accent mb-1.5">Distance to Neighbors</h3>
          <InfoRow label="Previous" value={planet.info.distanceFromPrevious} />
          <InfoRow label="Next" value={planet.info.distanceFromNext} />
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
