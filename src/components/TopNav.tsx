"use client";

import { LayoutGrid, Globe, Settings, Zap, Play, Loader2 } from "lucide-react";

interface TopNavProps {
  view: "feed" | "map";
  onViewChange: (v: "feed" | "map") => void;
  onRunDemo?: () => void;
  demoRunning?: boolean;
}

export function TopNav({ view, onViewChange, onRunDemo, demoRunning }: TopNavProps) {
  return (
    <header
      className="h-14 flex items-center px-5 gap-4 z-30 shrink-0"
      style={{
        background: "rgba(10,10,10,0.95)",
        borderBottom: "1px solid var(--syn-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 select-none">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--syn-indigo)" }}
        >
          <Zap className="w-3.5 h-3.5 text-white" fill="white" strokeWidth={0} />
        </div>
        <span
          className="font-semibold text-white tracking-tight text-[15px]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Synapse
        </span>
      </div>

      {/* Centre: view toggle */}
      <div className="flex-1 flex justify-center">
        <div
          className="flex gap-0.5 rounded-lg p-1"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => onViewChange("feed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
            style={
              view === "feed"
                ? { background: "rgba(255,255,255,0.09)", color: "#fff" }
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
                ? { background: "rgba(255,255,255,0.09)", color: "#fff" }
                : { color: "var(--syn-slate)" }
            }
          >
            <Globe className="w-3.5 h-3.5" />
            Map
          </button>
        </div>
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
        <button
          aria-label="Settings"
          className="transition-colors p-1.5 rounded-md cursor-pointer"
          style={{ color: "var(--syn-slate)" }}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
