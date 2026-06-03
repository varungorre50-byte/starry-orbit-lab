import { useEffect, useState } from "react";
import { useLanguage } from "./useLanguage";
import { translateText } from "@/lib/translate";

/** Translate an English string into the current app language. Returns original while loading. */
export const useTranslated = (text: string): { text: string; loading: boolean } => {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lang === "en") {
      setTranslated(text);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    translateText(text, lang).then((r) => {
      if (!cancelled) {
        setTranslated(r);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [text, lang]);

  return { text: translated, loading };
};
