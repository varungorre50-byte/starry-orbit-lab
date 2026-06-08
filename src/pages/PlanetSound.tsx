import { useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Square, Play } from "lucide-react";
import { usePlanetSound } from "@/hooks/usePlanetSound";

const PLANET_COLORS: Record<string, string> = {
  Sun: "#FDB813",
  Mercury: "#A09080",
  Venus: "#F5C842",
  Earth: "#4A90D9",
  Mars: "#E05A3A",
  Jupiter: "#E8A060",
  Saturn: "#F0D890",
  Uranus: "#7EEAED",
  Neptune: "#5B6BFF",
};

const PlanetSound = () => {
  const { name = "Earth" } = useParams();
  const navigate = useNavigate();
  const planetName = decodeURIComponent(name);
  const color = PLANET_COLORS[planetName] ?? "#4A90D9";

  const { playing, start, stop, analyserRef } = usePlanetSound(planetName);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const barsCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  // Autostart on mount
  useEffect(() => {
    start(planetName);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planetName]);

  // Visualization loop
  useEffect(() => {
    const draw = () => {
      const analyser = analyserRef.current;
      const waveCanvas = waveCanvasRef.current;
      const barsCanvas = barsCanvasRef.current;
      if (analyser && waveCanvas && barsCanvas) {
        // Waveform
        const w = waveCanvas.width;
        const h = waveCanvas.height;
        const wctx = waveCanvas.getContext("2d")!;
        const buf = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buf);
        wctx.fillStyle = "rgba(3,3,8,0.35)";
        wctx.fillRect(0, 0, w, h);
        wctx.lineWidth = 2;
        wctx.strokeStyle = color;
        wctx.shadowColor = color;
        wctx.shadowBlur = 12;
        wctx.beginPath();
        const slice = w / buf.length;
        for (let i = 0; i < buf.length; i++) {
          const v = buf[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) wctx.moveTo(i * slice, y);
          else wctx.lineTo(i * slice, y);
        }
        wctx.stroke();

        // Frequency bars
        const bw = barsCanvas.width;
        const bh = barsCanvas.height;
        const bctx = barsCanvas.getContext("2d")!;
        const freq = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freq);
        bctx.fillStyle = "rgba(3,3,8,0.4)";
        bctx.fillRect(0, 0, bw, bh);
        const bars = 64;
        const step = Math.floor(freq.length / bars);
        const barW = bw / bars;
        for (let i = 0; i < bars; i++) {
          const v = freq[i * step] / 255;
          const barH = v * bh * 0.95;
          const grad = bctx.createLinearGradient(0, bh, 0, bh - barH);
          grad.addColorStop(0, color);
          grad.addColorStop(1, "#ffffff");
          bctx.fillStyle = grad;
          bctx.fillRect(i * barW + 1, bh - barH, barW - 2, barH);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [color, analyserRef]);

  const handleStop = () => {
    stop();
    setTimeout(() => navigate("/"), 200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${color}33, transparent 60%)` }}
      />

      <header className="relative z-10 flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={18} /> Back to Solar System
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {planetName} <span className="text-muted-foreground font-normal">sound analyzer</span>
        </h1>
        <div className="w-32" />
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-12 grid md:grid-cols-2 gap-8 items-center">
        {/* Animated planet */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ background: `radial-gradient(circle at 30% 30%, ${color}, #000 80%)`,
                boxShadow: `0 0 80px ${color}, inset -30px -30px 60px rgba(0,0,0,0.6)` }}
            />
            {playing && (
              <>
                <span className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: `${color}80` }} />
                <span className="absolute -inset-4 rounded-full border opacity-40 animate-ping" style={{ borderColor: color, animationDelay: "0.4s" }} />
              </>
            )}
            <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: "30s",
              background: `conic-gradient(from 0deg, transparent, ${color}33, transparent)` }} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition shadow-[0_0_20px_hsl(var(--destructive)/0.5)]"
            >
              <Square size={18} fill="currentColor" /> Stop sound
            </button>
            <button
              onClick={() => (playing ? stop() : start(planetName))}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
            >
              <Play size={18} fill="currentColor" /> {playing ? "Restart" : "Play"}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Status: <span style={{ color }}>{playing ? "Transmitting" : "Silent"}</span>
          </p>
        </div>

        {/* Graphs */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Waveform</div>
            <canvas ref={waveCanvasRef} width={520} height={160} className="w-full h-40 rounded-lg bg-background/70" />
          </div>
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Frequency spectrum</div>
            <canvas ref={barsCanvasRef} width={520} height={180} className="w-full h-44 rounded-lg bg-background/70" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanetSound;
