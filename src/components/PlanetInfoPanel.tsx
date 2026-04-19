import { useEffect, useRef } from "react";
import type { PlanetData } from "@/data/planetData";
import { X } from "lucide-react";
import { VoiceAssistantButton } from "./VoiceAssistantButton";

const buildPlanetSpeech = (planet: PlanetData): string => {
  const i = planet.info;
  const moonsLine = i.moonDetails
    ? ` ${planet.name} has ${i.moons} ${i.moons === 1 ? "moon" : "moons"}. ${i.moonDetails.description}`
    : ` It has ${i.moons} ${i.moons === 1 ? "moon" : "moons"}.`;
  return (
    `${planet.name}. ${i.type}. ` +
    `Diameter ${i.diameter}. Distance from the Sun ${i.distanceFromSun}. ` +
    `One day on ${planet.name} lasts ${i.dayLength}, and one year takes ${i.yearLength}. ` +
    `Surface gravity is ${i.gravity}. Temperature ranges ${i.temperature}. ` +
    `Atmosphere consists of ${i.atmosphere.join(", ")}.` +
    moonsLine
  );
};

const SpinningPlanet = ({ planet }: { planet: PlanetData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 120;
    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      ctx.clearRect(0, 0, size * 2, size * 2);
      const cx = size;
      const cy = size;
      const r = size * 0.7;

      // Glow effect
      const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.4);
      glow.addColorStop(0, planet.color + "40");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size * 2, size * 2);

      // Planet sphere with gradient
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      grad.addColorStop(0, lightenColor(planet.color, 40));
      grad.addColorStop(0.5, planet.color);
      grad.addColorStop(1, darkenColor(planet.color, 60));

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Rotating surface lines for animation effect
      angleRef.current += 0.02;
      const a = angleRef.current;
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.15;
      for (let i = -3; i <= 3; i++) {
        const offset = Math.sin(a + i * 0.5) * r * 0.3;
        ctx.beginPath();
        ctx.ellipse(cx + offset, cy, r * 0.95, r * (0.15 + Math.abs(i) * 0.08), 0, 0, Math.PI * 2);
        ctx.strokeStyle = lightenColor(planet.color, 30);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Specular highlight
      const spec = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.6);
      spec.addColorStop(0, "rgba(255,255,255,0.35)");
      spec.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      // Rings for Saturn/Uranus
      if (planet.hasRings) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.1, r * 1.6, r * 0.3, -0.2, 0, Math.PI * 2);
        ctx.strokeStyle = planet.ringColor || "#D4C494";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [planet]);

  return <canvas ref={canvasRef} className="w-[120px] h-[120px]" />;
};

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

export const PlanetInfoPanel = ({ planet, onClose }: { planet: PlanetData; onClose: () => void }) => {
  return (
    <div className="absolute right-4 top-20 bottom-4 w-[360px] max-w-[90vw] bg-card/90 backdrop-blur-md border border-border rounded-xl p-5 overflow-y-auto z-20 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-foreground">{planet.name}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
          <X size={20} />
        </button>
      </div>

      {/* Animated planet preview */}
      <div className="flex justify-center mb-3">
        <div className="animate-pulse-slow">
          <SpinningPlanet planet={planet} />
        </div>
      </div>

      {/* Voice assistant */}
      <div className="flex justify-center mb-4">
        <VoiceAssistantButton getText={() => buildPlanetSpeech(planet)} label={`Hear about ${planet.name}`} />
      </div>


      <div className="space-y-3">
        <InfoRow label="Type" value={planet.info.type} />
        <InfoRow label="Diameter" value={planet.info.diameter} />
        <InfoRow label="Distance from Sun" value={planet.info.distanceFromSun} />
        <InfoRow label="Day Length" value={planet.info.dayLength} />
        <InfoRow label="Year Length" value={planet.info.yearLength} />
        <InfoRow label="Temperature" value={planet.info.temperature} />
        <InfoRow label="Number of Moons" value={String(planet.info.moons)} />

        {planet.info.moonDetails && (
          <div className="pt-2 border-t border-border">
            <h3 className="text-sm font-semibold text-primary mb-2">🌙 Moons</h3>
            {planet.info.moonDetails.largest && (
              <div className="mb-2">
                <div className="text-[10px] text-muted-foreground mb-0.5">Largest moon</div>
                <div className="text-sm text-foreground">{planet.info.moonDetails.largest}</div>
              </div>
            )}
            {planet.info.moonDetails.notable.length > 0 && (
              <div className="mb-2">
                <div className="text-[10px] text-muted-foreground mb-1">Notable moons</div>
                <div className="flex flex-wrap gap-1.5">
                  {planet.info.moonDetails.notable.map((m) => (
                    <span key={m} className="text-xs px-2 py-1 bg-muted rounded-md text-foreground">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {planet.info.moonDetails.description}
            </p>
          </div>
        )}

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
                className="h-full rounded-full bg-primary transition-all duration-1000"
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
          <h3 className="text-sm font-semibold text-primary mb-2">🌀 Orbital Info</h3>
          <InfoRow label="Self Rotation (1 Day)" value={planet.info.dayLength} />
          <InfoRow label="Orbit Around Sun (1 Year)" value={planet.info.yearLength} />
          <InfoRow label="Orbital Distance" value={planet.info.distanceFromSun} />
          <div className="mt-2 text-xs text-muted-foreground">
            {parseFloat(planet.info.yearLength) > 50
              ? "🐢 Extremely slow orbit — takes decades to go around the Sun!"
              : parseFloat(planet.info.yearLength) > 10
              ? "🕰️ Very long orbit — years upon years to complete one trip."
              : parseFloat(planet.info.yearLength) > 1
              ? "📅 Takes more than an Earth year to orbit the Sun."
              : planet.info.dayLength.includes("hour")
              ? "⚡ Rapid rotation — days are much shorter than Earth's!"
              : "🔄 Slow rotation — one day lasts longer than you'd expect."}
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
