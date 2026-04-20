import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeech — wrapper around the browser's Web Speech API (speechSynthesis).
 * Provides play / stop / toggle controls plus a `speaking` state flag.
 * Supports adjustable speech rate (speed).
 */
export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = 1;
      utter.volume = 1;
      utter.lang = "en-US";

      // Prefer a higher-quality English voice if available.
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /en[-_]US/i.test(v.lang) && /Google|Samantha|Microsoft/i.test(v.name)) ||
        voices.find((v) => /en[-_]US/i.test(v.lang)) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utter.voice = preferred;

      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);

      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    [supported, rate]
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speaking, speak, stop]
  );

  return { speak, stop, toggle, speaking, supported, rate, setRate };
};
