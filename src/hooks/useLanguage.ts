import { useSyncExternalStore } from "react";

export type LangCode = "en" | "hi" | "te";

export const LANGUAGES: { code: LangCode; label: string; bcp47: string }[] = [
  { code: "en", label: "English", bcp47: "en-US" },
  { code: "hi", label: "हिंदी", bcp47: "hi-IN" },
  { code: "te", label: "తెలుగు", bcp47: "te-IN" },
];

let current: LangCode = (typeof localStorage !== "undefined" && (localStorage.getItem("app_lang") as LangCode)) || "en";
const listeners = new Set<() => void>();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => current;

export const setLanguage = (code: LangCode) => {
  if (code === current) return;
  current = code;
  try { localStorage.setItem("app_lang", code); } catch {}
  listeners.forEach((l) => l());
};

export const useLanguage = () => {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { lang, setLanguage };
};

export const getCurrentLanguage = () => current;
export const getBcp47 = (code: LangCode) => LANGUAGES.find((l) => l.code === code)?.bcp47 || "en-US";
