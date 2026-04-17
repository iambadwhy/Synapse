"use client";

import { useEffect, useRef, useState } from "react";
import { Cluster, Capture } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Check,
  Edit2,
  ChevronRight,
  Mic,
  Link2,
  ImageIcon,
  Type,
  Brain,
} from "lucide-react";

interface ActionPanelProps {
  open: boolean;
  cluster: Cluster | null;
  captures: Capture[];
  onClose: () => void;
  onAccept: () => void;
  onTweak: () => void;
}

const TYPE_ICONS = {
  text: Type,
  link: Link2,
  image: ImageIcon,
  voice: Mic,
};

/**
 * useTypewriter — streams a target string char-by-char over `durationMs`.
 * Resets whenever `text` changes, so re-opening the panel against a different
 * cluster replays the effect. Respects prefers-reduced-motion (renders full
 * text instantly if the user has it enabled).
 */
function useTypewriter(text: string, durationMs = 900) {
  // Reset revealed count when the target text changes, using the
  // "derive-state-from-props" pattern so we never call setState inside
  // an effect body.
  const [chars, setChars] = useState(0);
  const prevTextRef = useRef(text);
  if (prevTextRef.current !== text) {
    prevTextRef.current = text;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setChars(reduce || !text ? text.length : 0);
  }

  useEffect(() => {
    if (!text) return;
    if (chars >= text.length) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const tickMs = 16;
    const perTick = Math.max(1, Math.ceil(text.length / (durationMs / tickMs)));
    const id = setInterval(() => {
      setChars((c) => {
        const next = Math.min(text.length, c + perTick);
        if (next >= text.length) clearInterval(id);
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
    // chars intentionally omitted — interval drives it forward via updater.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, durationMs]);

  return {
    out: text.slice(0, chars),
    done: chars >= text.length,
  };
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActionPanel({
  open,
  cluster,
  captures,
  onClose,
  onAccept,
  onTweak,
}: ActionPanelProps) {
  const clusterCaptures = captures
    .filter((c) => c.clusterId === cluster?.id && c.status === "clustered")
    .slice(0, 4);

  // Type the synthesis out on open (and re-type when the cluster changes).
  const { out: synthText, done: synthDone } = useTypewriter(
    open && cluster ? cluster.synthesis : ""
  );

  return (
    <AnimatePresence>
      {open && cluster && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
            style={{
              width: "360px",
              background: "var(--syn-surface)",
              borderLeft: "1px solid var(--syn-border)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--syn-border)" }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: cluster.color }}
                />
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">
                    {cluster.name}
                  </p>
                  <p
                    className="text-[10px] font-mono mt-0.5"
                    style={{ color: "var(--syn-slate)" }}
                  >
                    {clusterCaptures.length} recent captures
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close action panel"
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--syn-slate)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
              {/* Synthesis block */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Brain className="w-3.5 h-3.5" style={{ color: "var(--syn-indigo)" }} />
                  <span
                    className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                    style={{ color: "var(--syn-indigo)" }}
                  >
                    Synthesis
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--syn-ash)" }}
                  aria-live="polite"
                >
                  {synthText}
                  {!synthDone && (
                    <span
                      aria-hidden="true"
                      className="inline-block w-[6px] h-3 align-[-1px] ml-0.5 animate-pulse"
                      style={{ background: "var(--syn-indigo)" }}
                    />
                  )}
                </p>
              </div>

              {/* Recent captures */}
              {clusterCaptures.length > 0 && (
                <div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-wider mb-2.5"
                    style={{ color: "var(--syn-slate)" }}
                  >
                    Recent captures
                  </p>
                  <div className="flex flex-col gap-2">
                    {clusterCaptures.map((c) => {
                      const Icon = TYPE_ICONS[c.type] ?? Type;
                      return (
                        <div
                          key={c.id}
                          className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--syn-border-subtle)",
                          }}
                        >
                          <Icon
                            className="w-3.5 h-3.5 mt-0.5 shrink-0"
                            style={{ color: "var(--syn-slate)" }}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs leading-snug line-clamp-2"
                              style={{ color: "var(--syn-dim)" }}
                            >
                              {c.linkTitle ?? c.content}
                            </p>
                            <p
                              className="text-[10px] font-mono mt-1"
                              style={{ color: "var(--syn-slate)" }}
                            >
                              {timeAgo(c.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next step card */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--syn-mint)" }} />
                  <span
                    className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                    style={{ color: "var(--syn-mint)" }}
                  >
                    Suggested Next Step
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white">
                  {cluster.nextStep}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="px-5 py-4 flex gap-2.5 shrink-0"
              style={{ borderTop: "1px solid var(--syn-border)" }}
            >
              <button
                onClick={onAccept}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                style={{ background: "var(--syn-mint)", color: "#0A0A0A" }}
              >
                <Check className="w-4 h-4" />
                Add to Tasks
              </button>
              <button
                onClick={onTweak}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--syn-ash)",
                  border: "1px solid var(--syn-border)",
                }}
              >
                <Edit2 className="w-4 h-4" />
                Tweak
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
