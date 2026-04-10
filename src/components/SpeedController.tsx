import { Play, Pause, FastForward, Rewind } from "lucide-react";

const SPEED_PRESETS = [0, 0.25, 0.5, 1, 2, 5, 10];

export const SpeedController = ({
  speed,
  onSpeedChange,
}: {
  speed: number;
  onSpeedChange: (val: number) => void;
}) => {
  const isPaused = speed === 0;

  const stepSpeed = (dir: 1 | -1) => {
    const idx = SPEED_PRESETS.indexOf(speed);
    const next = idx === -1
      ? (dir === 1 ? 2 : 1)
      : Math.max(0, Math.min(SPEED_PRESETS.length - 1, idx + dir));
    onSpeedChange(SPEED_PRESETS[next]);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-5 py-3 bg-card/85 backdrop-blur-md border border-border rounded-full">
      {/* Slow down */}
      <button
        onClick={() => stepSpeed(-1)}
        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Slow down"
      >
        <Rewind size={16} />
      </button>

      {/* Play / Pause */}
      <button
        onClick={() => onSpeedChange(isPaused ? 1 : 0)}
        className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
        title={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? <Play size={18} /> : <Pause size={18} />}
      </button>

      {/* Speed up */}
      <button
        onClick={() => stepSpeed(1)}
        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Speed up"
      >
        <FastForward size={16} />
      </button>

      {/* Speed label */}
      <div className="text-sm font-mono text-foreground min-w-[48px] text-center">
        {isPaused ? "⏸" : `${speed}×`}
      </div>

      {/* Speed slider */}
      <input
        type="range"
        min={0}
        max={10}
        step={0.25}
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="w-24 h-1 accent-primary cursor-pointer"
        title={`Speed: ${speed}×`}
      />
    </div>
  );
};
