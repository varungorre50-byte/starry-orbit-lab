import { Languages } from "lucide-react";
import { useState } from "react";
import { LANGUAGES, useLanguage } from "@/hooks/useLanguage";

export const LanguageSelector = () => {
  const { lang, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors"
        aria-label="Select language"
      >
        <Languages size={14} />
        <span>{current.label}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[140px] z-30">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                lang === l.code
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
