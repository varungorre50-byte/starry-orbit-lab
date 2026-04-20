import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeech — wrapper around the browser's Web Speech API (speechSynthesis).
 * Live-updates rate and volume by restarting speech when they change while speaking.
 */
export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastTextRef = useRef<string>("");
  const rateRef = useRef(rate);
  const volumeRef = useRef(volume);

  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

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

  const speakInternal = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rateRef.current;
      utter.pitch = 1;
      utter.volume = volumeRef.current;
      utter.lang = "en-US";

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
    [supported]
  );

  const speak = useCallback(
    (text: string) => {
      lastTextRef.current = text;
      speakInternal(text);
    },
    [speakInternal]
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speaking, speak, stop]
  );

  // When rate or volume changes mid-speech, restart with the new settings
  // so the user immediately hears the difference.
  useEffect(() => {
    if (speaking && lastTextRef.current) {
      speakInternal(lastTextRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, volume]);

  return { speak, stop, toggle, speaking, supported, rate, setRate, volume, setVolume };
};
