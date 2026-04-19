import { Volume2, VolumeX } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

interface VoiceAssistantButtonProps {
  /** Function that returns the text to be spoken. Called lazily on click. */
  getText: () => string;
  label?: string;
}

export const VoiceAssistantButton = ({ getText, label = "Listen" }: VoiceAssistantButtonProps) => {
  const { speaking, toggle, supported } = useSpeech();

  if (!supported) return null;

  return (
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
  );
};
