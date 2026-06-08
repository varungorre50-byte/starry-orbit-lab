import { Volume2, VolumeX, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlanetSound } from "@/hooks/usePlanetSound";
import { useEffect } from "react";

interface Props {
  planetName: string | null;
  triggerRef?: React.MutableRefObject<((name: string) => void) | undefined>;
}

export const PlanetSoundButton = ({ planetName, triggerRef }: Props) => {
  const { playing, toggle, start, volume, setVolume } = usePlanetSound(planetName);

  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = start;
    }
  }, [triggerRef, start]);

  if (!planetName) return null;

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 bg-card/85 backdrop-blur-md border border-border rounded-full p-2 animate-in slide-in-from-right-4 duration-300">
      <button
        onClick={toggle}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          playing
            ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
            : "bg-muted text-foreground hover:bg-muted/80"
        }`}
        title={playing ? `Stop ${planetName} sound` : `Play ${planetName} sound`}
      >
        {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
        {playing && (
          <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
        )}
      </button>
      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider rotate-180" style={{ writingMode: "vertical-rl" }}>
        {planetName} Sound
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-2 h-20 accent-primary"
        style={{ writingMode: "vertical-rl" as any, direction: "rtl" }}
        title="Volume"
      />
    </div>
  );
};
