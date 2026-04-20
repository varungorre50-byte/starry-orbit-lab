import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeech — wrapper around the browser's Web Speech API (speechSynthesis).
 *
 * - `volume` and `rate` are stored in state so the UI reflects them.
 * - Changes during playback are NOT auto-applied (Web Speech API can't change
 *   rate/volume mid-utterance — restarting would jump back to the beginning).
 * - Call `applyLiveSettings()` (e.g. on slider release) to restart from the
 *   current position with the new settings.
 */
export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  const lastTextRef = useRef<string>("");
  const charIndexRef = useRef<number>(0);
  const rateRef = useRef(rate);
  const volumeRef = useRef(volume);
  const manualStopRef = useRef(false);

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
    manualStopRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    charIndexRef.current = 0;
  }, [supported]);

  const speakFrom = useCallback(
    (text: string, fromChar = 0) => {
      if (!supported || !text) return;
      manualStopRef.current = true;
      window.speechSynthesis.cancel();
      // Allow the cancel to flush before starting the new utterance.
      setTimeout(() => {
        manualStopRef.current = false;
        const slice = text.slice(fromChar);
        const utter = new SpeechSynthesisUtterance(slice);
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
        utter.onboundary = (e) => {
          // Track absolute char index in the full text so we can resume.
          charIndexRef.current = fromChar + e.charIndex;
        };
        utter.onend = () => {
          if (!manualStopRef.current) {
            setSpeaking(false);
            charIndexRef.current = 0;
          }
        };
        utter.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utter);
      }, 60);
    },
    [supported]
  );

  const speak = useCallback(
    (text: string) => {
      lastTextRef.current = text;
      charIndexRef.current = 0;
      speakFrom(text, 0);
    },
    [speakFrom]
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speaking, speak, stop]
  );

  /** Restart speech from current position with the latest rate/volume. */
  const applyLiveSettings = useCallback(() => {
    if (!speaking || !lastTextRef.current) return;
    speakFrom(lastTextRef.current, charIndexRef.current);
  }, [speaking, speakFrom]);

  return {
    speak,
    stop,
    toggle,
    speaking,
    supported,
    rate,
    setRate,
    volume,
    setVolume,
    applyLiveSettings,
  };
};
