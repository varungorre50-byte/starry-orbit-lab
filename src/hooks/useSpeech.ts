import { useCallback, useEffect, useRef, useState } from "react";
import { getBcp47, useLanguage, type LangCode } from "./useLanguage";

export type VoiceGender = "female" | "male";

const FEMALE_NAME_HINTS = /female|woman|samantha|victoria|karen|moira|tessa|fiona|allison|ava|susan|zira|hazel|catherine|serena|veena|google us english$|google uk english female/i;
const MALE_NAME_HINTS = /\bmale\b|man|daniel|alex|fred|tom|oliver|rishi|david|mark|george|james|google uk english male/i;

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [gender, setGender] = useState<VoiceGender>("female");
  const [currentText, setCurrentText] = useState("");
  const [spokenIndex, setSpokenIndex] = useState(0);
  const { lang } = useLanguage();

  const lastTextRef = useRef<string>("");
  const charIndexRef = useRef<number>(0);
  const rateRef = useRef(rate);
  const volumeRef = useRef(volume);
  const genderRef = useRef(gender);
  const langRef = useRef<LangCode>(lang);
  const manualStopRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeFromCharRef = useRef(0);
  const utteranceStartedAtRef = useRef(0);

  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { genderRef.current = gender; }, [gender]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    manualStopRef.current = true;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
    charIndexRef.current = 0;
    setCurrentText("");
    setSpokenIndex(0);
  }, [supported]);

  const speakFrom = useCallback(
    (text: string, fromChar = 0) => {
      if (!supported || !text) return;
      manualStopRef.current = true;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      window.speechSynthesis.cancel();
      // Allow the cancel to flush before starting the new utterance.
      restartTimeoutRef.current = setTimeout(() => {
        restartTimeoutRef.current = null;
        manualStopRef.current = false;
        const slice = text.slice(fromChar);
        const utter = new SpeechSynthesisUtterance(slice);
        utter.rate = rateRef.current;
        utter.pitch = genderRef.current === "male" ? 0.85 : 1.15;
        utter.volume = volumeRef.current;
        const bcp47 = getBcp47(langRef.current);
        utter.lang = bcp47;
        activeFromCharRef.current = fromChar;
        utteranceStartedAtRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();

        const voices = window.speechSynthesis.getVoices();
        const langPrefix = bcp47.split("-")[0];
        const localeVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
        const hints = genderRef.current === "male" ? MALE_NAME_HINTS : FEMALE_NAME_HINTS;
        const antiHints = genderRef.current === "male" ? FEMALE_NAME_HINTS : MALE_NAME_HINTS;
        const preferred =
          localeVoices.find((v) => hints.test(v.name) && v.lang.replace("_", "-").toLowerCase() === bcp47.toLowerCase()) ||
          localeVoices.find((v) => hints.test(v.name)) ||
          localeVoices.find((v) => !antiHints.test(v.name)) ||
          localeVoices[0] ||
          voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        if (preferred) utter.voice = preferred;

        setCurrentText(text);
        setSpokenIndex(fromChar);

        utter.onstart = () => {
          setSpeaking(true);
          setSpokenIndex(fromChar);
        };
        utter.onboundary = (e) => {
          // Track absolute char index in the full text so we can resume.
          const abs = fromChar + e.charIndex;
          charIndexRef.current = Math.max(charIndexRef.current, abs);
          setSpokenIndex(abs);
        };
        utter.onend = () => {
          if (!manualStopRef.current) {
            setSpeaking(false);
            charIndexRef.current = 0;
            setSpokenIndex(text.length);
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
    const elapsedMs = Math.max(
      0,
      (typeof performance !== "undefined" ? performance.now() : Date.now()) - utteranceStartedAtRef.current
    );
    const activeSlice = lastTextRef.current.slice(activeFromCharRef.current);
    const words = activeSlice.trim().split(/\s+/).filter(Boolean).length || 1;
    const estimatedDurationMs = Math.max(350, (words / (170 * rateRef.current)) * 60_000);
    const estimatedCharIndex = activeFromCharRef.current + Math.floor(activeSlice.length * Math.min(0.98, elapsedMs / estimatedDurationMs));
    const resumeFrom = Math.min(
      Math.max(charIndexRef.current, estimatedCharIndex),
      Math.max(lastTextRef.current.length - 1, 0)
    );

    charIndexRef.current = resumeFrom;
    speakFrom(lastTextRef.current, resumeFrom);
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
    gender,
    setGender,
    applyLiveSettings,
  };
};
