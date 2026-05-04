"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  Globe,
  Settings,
  Play,
  Loader2,
  Search,
  X,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { SynapseLogo } from "./SynapseLogo";
import { useTheme } from "@/lib/theme";

interface TopNavProps {
  view: "feed" | "map";
  onViewChange: (v: "feed" | "map") => void;
  onRunDemo?: () => void;
  demoRunning?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function TopNav({
  view,
  onViewChange,
  onRunDemo,
  demoRunning,
  searchQuery,
  onSearchChange,
}: TopNavProps) {
  const [theme, setTheme] = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement>(null);

  /* Click-outside to dismiss the popover */
  useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!settingsWrapRef.current?.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [settingsOpen]);

  return (
    <header
      className="h-14 flex items-center px-5 gap-4 z-30 shrink-0"
      style={{
        background: "var(--syn-popover-bg)",
        borderBottom: "1px solid var(--syn-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        <SynapseLogo className="w-8 h-8 shrink-0" />
        <span
          className="font-semibold tracking-tight text-[15px]"
          style={{
            fontFamily: "var(--font-geist-sans)",
            color: "var(--syn-white)",
          }}
        >
          Synapse
        </span>
      </div>

      {/* Search */}
      <div
        className="relative flex-1 max-w-md flex items-center rounded-lg focus-within:ring-1 focus-within:ring-[rgba(99,102,241,0.35)] transition-all"
        style={{
          background: "var(--syn-overlay-1)",
          border: "1px solid var(--syn-border)",
        }}
      >
        <Search
          className="w-3.5 h-3.5 ml-2.5 shrink-0"
          style={{ color: "var(--syn-slate)" }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search captures, tags, reasons…"
          className="flex-1 bg-transparent text-xs outline-none px-2 py-1.5 text-[var(--syn-dim)] placeholder:text-[var(--syn-slate)]"
          aria-label="Search captures"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="mr-1.5 p-0.5 rounded cursor-pointer hover:bg-[var(--syn-overlay-2)]"
            style={{ color: "var(--syn-slate)" }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* View toggle */}
      <div
        className="flex gap-0.5 rounded-lg p-1"
        style={{ background: "var(--syn-overlay-2)" }}
      >
        <button
          onClick={() => onViewChange("feed")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
          style={
            view === "feed"
              ? { background: "var(--syn-overlay-3)", color: "var(--syn-white)" }
              : { color: "var(--syn-slate)" }
          }
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Stream
        </button>
        <button
          onClick={() => onViewChange("map")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
          style={
            view === "map"
              ? { background: "var(--syn-overlay-3)", color: "var(--syn-white)" }
              : { color: "var(--syn-slate)" }
          }
        >
          <Globe className="w-3.5 h-3.5" />
          Map
        </button>
      </div>

      {/* Right: demo + settings */}
      <div className="flex items-center gap-1">
        {onRunDemo && (
          <button
            onClick={onRunDemo}
            disabled={demoRunning}
            aria-label={demoRunning ? "Demo running" : "Run demo capture sequence"}
            title={demoRunning ? "Demo running…" : "Run a 3-capture demo"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: demoRunning
                ? "rgba(99,102,241,0.18)"
                : "rgba(99,102,241,0.10)",
              color: demoRunning ? "#A5B4FC" : "var(--syn-indigo)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            {demoRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" fill="currentColor" strokeWidth={0} />
            )}
            {demoRunning ? "Running…" : "Demo"}
          </button>
        )}

        {/* Settings button + popover */}
        <div className="relative" ref={settingsWrapRef}>
          <button
            onClick={() => setSettingsOpen((s) => !s)}
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
            className="transition-colors p-1.5 rounded-md cursor-pointer hover:bg-[var(--syn-overlay-2)]"
            style={{
              color: settingsOpen ? "var(--syn-white)" : "var(--syn-slate)",
              background: settingsOpen ? "var(--syn-overlay-2)" : "transparent",
            }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {settingsOpen && (
            <div
              role="menu"
              aria-label="Settings menu"
              className="absolute right-0 top-full mt-2 w-64 rounded-xl p-2 z-40"
              style={{
                background: "var(--syn-popover-bg)",
                border: "1px solid var(--syn-border)",
                backdropFilter: "blur(12px)",
                boxShadow:
                  "0 10px 32px -8px var(--syn-shadow-2), 0 0 0 1px var(--syn-border-subtle)",
              }}
            >
              <div
                className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wider"
                style={{ color: "var(--syn-slate)" }}
              >
                Appearance
              </div>
              <ThemeOption
                icon={<Sun className="w-3.5 h-3.5" />}
                label="Light"
                active={theme === "light"}
                onClick={() => setTheme("light")}
              />
              <ThemeOption
                icon={<Moon className="w-3.5 h-3.5" />}
                label="Dark"
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface ThemeOptionProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ThemeOption({ icon, label, active, onClick }: ThemeOptionProps) {
  return (
    <button
      role="menuitemradio"
      aria-checked={active}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors hover:bg-[var(--syn-overlay-2)]"
      style={{ color: active ? "var(--syn-white)" : "var(--syn-dim)" }}
    >
      <span style={{ color: active ? "var(--syn-indigo)" : "var(--syn-slate)" }}>
        {icon}
      </span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {active && (
        <Check
          className="w-3.5 h-3.5"
          style={{ color: "var(--syn-indigo)" }}
        />
      )}
    </button>
  );
}
