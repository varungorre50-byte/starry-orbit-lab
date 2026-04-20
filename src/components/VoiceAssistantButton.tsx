import { Volume2, VolumeX, Gauge, Volume1 } from "lucide-react";
import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface VoiceAssistantButtonProps {
  /** Function that returns the text to be spoken. Called lazily on click. */
  getText: () => string;
  label?: string;
}

const RATE_OPTIONS = [
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
];

export const VoiceAssistantButton = ({ getText, label = "Listen" }: VoiceAssistantButtonProps) => {
  const { speaking, toggle, supported, rate, setRate, volume, setVolume } = useSpeech();
  const [showVolume, setShowVolume] = useState(false);

  if (!supported) return null;

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => toggle(getText())}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
          speaking
            ? "bg-primary text-primary-foreground border-primary animate-pulse"
            : "bg-muted text-foreground border-border hover:bg-muted/70"
        }`}
        aria-label={speaking ? "Mute voice assistant" : "Play voice assistant"}
      >
        {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
        {speaking ? "Mute" : label}
      </button>

      <div className="relative group">
        <button
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors"
          aria-label="Speech speed"
        >
          <Gauge size={14} />
          <span>{RATE_OPTIONS.find((o) => o.value === rate)?.label || "1x"}</span>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[60px]">
          {RATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRate(opt.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                rate === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowVolume((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors"
          aria-label="Volume control"
        >
          <VolumeIcon size={14} />
          <span>{Math.round(volume * 100)}%</span>
        </button>
        {showVolume && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
            <div className="flex items-center gap-2 mb-2">
              <VolumeIcon size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};
