"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "synapse-theme";
const EVENT_NAME = "syn:themechange";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const fromAttr = document.documentElement.dataset.theme;
  if (fromAttr === "light" || fromAttr === "dark") return fromAttr;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: theme }));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT_NAME, cb);
  return () => window.removeEventListener(EVENT_NAME, cb);
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    readTheme,
    () => "dark", // server snapshot
  );

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
  }, []);

  return [theme, setTheme];
}

/* Inline blocking script. Embedded in <head> via dangerouslySetInnerHTML so
 * the theme is applied before first paint, avoiding a flash. */
export const NO_FLASH_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`.trim();
