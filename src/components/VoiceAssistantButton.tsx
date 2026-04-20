import { Volume2, VolumeX, Gauge } from "lucide-react";
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
  const { speaking, toggle, supported, rate, setRate } = useSpeech();

  if (!supported) return null;

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
    </div>
  );
};
