import type { LangCode } from "@/hooks/useLanguage";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

/**
 * Translate text from English to target language using the free MyMemory API.
 * Splits long texts into ~450-char chunks (API limit ~500).
 */
export const translateText = async (text: string, target: LangCode): Promise<string> => {
  if (!text || target === "en") return text;
  const key = `${target}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;

  const promise = (async () => {
    try {
      const chunks = splitForApi(text, 450);
      const out: string[] = [];
      for (const chunk of chunks) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${target}`;
        const res = await fetch(url);
        const data = await res.json();
        const translated = data?.responseData?.translatedText || chunk;
        out.push(translated);
      }
      const result = out.join(" ");
      cache.set(key, result);
      return result;
    } catch {
      return text;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
};

const splitForApi = (text: string, max: number): string[] => {
  if (text.length <= max) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+|\S+$/g) || [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > max) {
      if (cur) chunks.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
};
