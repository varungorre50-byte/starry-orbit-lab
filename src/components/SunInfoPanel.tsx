import { useEffect, useRef } from "react";
import { SUN_DATA, PLANETS } from "@/data/planetData";
import { X } from "lucide-react";
import { VoiceAssistantButton } from "./VoiceAssistantButton";

const buildSunSpeech = (): string => {
  const i = SUN_DATA.info;
  return (
    `The Sun. ${i.type}. Diameter ${i.diameter}. ` +
    `Temperature ${i.temperature}. Gravity ${i.gravity}. ` +
    `Age ${i.age}. Mass ${i.mass}. Luminosity ${i.luminosity}. ` +
    `Composition: ${i.composition.join(", ")}. ` +
    `The Sun has no moons. Instead, ${PLANETS.length} planets orbit around it: ${PLANETS.map((p) => p.name).join(", ")}. ` +
    `It contains 99.86 percent of all mass in the solar system and produces energy through nuclear fusion.`
  );
};

const SpinningSun = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 130;
    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      ctx.clearRect(0, 0, size * 2, size * 2);
      const cx = size;
      const cy = size;
      const r = size * 0.62;

      angleRef.current += 0.015;
      const a = angleRef.current;

      // Outer corona glow (multi-layer)
      for (let i = 4; i >= 1; i--) {
        const glowR = r * (1 + i * 0.18);
        const grad = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, glowR);
        grad.addColorStop(0, `rgba(253, 184, 19, ${0.25 / i})`);
        grad.addColorStop(0.5, `rgba(255, 140, 0, ${0.15 / i})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Solar flares / rays
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 12; i++) {
        const rayAngle = (i / 12) * Math.PI * 2 + a * 0.3;
        const rayLen = r * (1.15 + Math.sin(a * 2 + i) * 0.12);
        ctx.strokeStyle = `rgba(255, 200, 50, ${0.25 + Math.sin(a + i) * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rayAngle) * r, Math.sin(rayAngle) * r);
        ctx.lineTo(Math.cos(rayAngle) * rayLen, Math.sin(rayAngle) * rayLen);
        ctx.stroke();
      }
      ctx.restore();

      // Sun body — radial gradient (bright core → orange edge)
      const body = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
      body.addColorStop(0, "#FFF4B8");
      body.addColorStop(0.4, "#FDB813");
      body.addColorStop(0.85, "#FF8C00");
      body.addColorStop(1, "#C84500");

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      // Sunspots / surface turbulence
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 8; i++) {
        const sa = a + i * 0.8;
        const sx = cx + Math.cos(sa) * r * 0.5;
        const sy = cy + Math.sin(sa * 1.3) * r * 0.4;
        const sr = r * (0.08 + Math.abs(Math.sin(sa * 2)) * 0.06);
        const spot = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        spot.addColorStop(0, "rgba(180, 60, 0, 0.6)");
        spot.addColorStop(1, "transparent");
        ctx.fillStyle = spot;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Bright highlight
      const spec = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.5);
      spec.addColorStop(0, "rgba(255, 255, 220, 0.45)");
      spec.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return <canvas ref={canvasRef} className="w-[130px] h-[130px]" />;
};

export const SunInfoPanel = ({ onClose }: { onClose: () => void }) => {
  const { info } = SUN_DATA;
  return (
    <div className="absolute right-4 top-20 bottom-4 w-[360px] max-w-[90vw] bg-card/90 backdrop-blur-md border border-border rounded-xl p-5 overflow-y-auto z-20 animate-in slide-in-from-right-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-primary">The Sun</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
          <X size={20} />
        </button>
      </div>

      {/* Animated Sun preview */}
      <div className="flex justify-center mb-3">
        <SpinningSun />
      </div>

      {/* Voice assistant */}
      <div className="flex justify-center mb-4">
        <VoiceAssistantButton getText={buildSunSpeech} label="Hear about the Sun" />
      </div>

      <div className="space-y-3">
        <InfoRow label="Type" value={info.type} />
        <InfoRow label="Diameter" value={info.diameter} />
        <InfoRow label="Temperature" value={info.temperature} />
        <InfoRow label="Gravity" value={info.gravity} />
        <InfoRow label="Age" value={info.age} />
        <InfoRow label="Mass" value={info.mass} />
        <InfoRow label="Luminosity" value={info.luminosity} />

        <div className="pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-primary mb-1.5">Composition</h3>
          <div className="flex flex-wrap gap-1.5">
            {info.composition.map((c) => (
              <span key={c} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-primary mb-2">🌙 Moons</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Sun has no moons. As the central star, it doesn't orbit anything — instead, all 8 planets, dwarf planets, asteroids, and comets orbit around it, held by its immense gravity.
          </p>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-primary mb-2">🪐 Orbiting Planets ({PLANETS.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {PLANETS.map((p) => (
              <span key={p.name} className="text-xs px-2 py-1 bg-muted rounded-md text-foreground">
                {p.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            The Sun contains 99.86% of all mass in the solar system and produces energy through nuclear fusion, converting 4 million tons of matter into energy every second.
          </p>
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
