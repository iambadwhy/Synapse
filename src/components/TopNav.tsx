"use client";

import { LayoutGrid, Globe, Settings, Zap } from "lucide-react";

interface TopNavProps {
  view: "feed" | "map";
  onViewChange: (v: "feed" | "map") => void;
}

export function TopNav({ view, onViewChange }: TopNavProps) {
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

      {/* Right: settings */}
      <button
        className="transition-colors p-1.5 rounded-md cursor-pointer"
        style={{ color: "var(--syn-slate)" }}
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </header>
  );
}
