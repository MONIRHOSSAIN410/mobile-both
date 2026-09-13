"use client";

import * as React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { accents, type AccentKey } from "@/lib/site";

export const ACCENT_STORAGE_KEY = "mb-accent";

interface AccentState {
  accent: AccentKey;
  setAccent: (key: AccentKey) => void;
}

/** zustand persists to localStorage and reads through useSyncExternalStore. */
const useAccentStore = create<AccentState>()(
  persist(
    (set) => ({
      accent: "gold",
      setAccent: (accent) => set({ accent }),
    }),
    {
      name: ACCENT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Writes the four brand tokens onto <html>. Because every component reads
 * `--brand` (never a hard-coded hex), the whole site re-colours in one paint.
 */
export function applyAccent(key: AccentKey) {
  const preset = accents.find((a) => a.key === key) ?? accents[0];
  const chroma = Number(preset.chroma);
  const root = document.documentElement;

  root.style.setProperty("--brand", `oklch(0.728 ${chroma} ${preset.value})`);
  root.style.setProperty("--brand-strong", `oklch(0.64 ${chroma} ${preset.value})`);
  root.style.setProperty(
    "--brand-soft",
    `oklch(0.84 ${(chroma * 0.85).toFixed(3)} ${preset.value})`
  );
  root.style.setProperty(
    "--brand-foreground",
    key === "gold" ? "oklch(0.1591 0 0)" : "oklch(0.99 0 0)"
  );
  root.dataset.accent = key;
}

export function useAccent() {
  const accent = useAccentStore((s) => s.accent);
  const setAccent = useAccentStore((s) => s.setAccent);
  return { accent, setAccent };
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // paint the current value, then follow every later change
    applyAccent(useAccentStore.getState().accent);
    return useAccentStore.subscribe((state) => applyAccent(state.accent));
  }, []);

  return <>{children}</>;
}

/**
 * Runs before first paint so a saved accent never flashes gold first.
 * Mirrors what next-themes does for the dark class.
 */
export const accentBootstrapScript = `
(function(){try{
  var raw = localStorage.getItem(${JSON.stringify(ACCENT_STORAGE_KEY)});
  if(!raw) return;
  var key = JSON.parse(raw).state.accent;
  var presets = ${JSON.stringify(
    Object.fromEntries(accents.map((a) => [a.key, [a.chroma, a.value]]))
  )};
  var p = presets[key];
  if(!p) return;
  var c = parseFloat(p[0]), h = p[1], s = document.documentElement.style;
  s.setProperty('--brand','oklch(0.728 '+c+' '+h+')');
  s.setProperty('--brand-strong','oklch(0.64 '+c+' '+h+')');
  s.setProperty('--brand-soft','oklch(0.84 '+(c*0.85).toFixed(3)+' '+h+')');
  s.setProperty('--brand-foreground', key==='gold' ? 'oklch(0.1591 0 0)' : 'oklch(0.99 0 0)');
  document.documentElement.dataset.accent = key;
}catch(e){}})();
`;
