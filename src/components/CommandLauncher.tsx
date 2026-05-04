"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, CornerDownLeft } from "lucide-react";
import { CaptureType } from "@/lib/types";
import { inferCluster } from "@/lib/data";

interface CommandLauncherProps {
  open: boolean;
  onClose: () => void;
  onCapture: (
    content: string,
    type: CaptureType,
    extra?: { linkUrl?: string; linkDomain?: string; imagePreview?: string }
  ) => void;
  clusterNameFor: (clusterId: string) => string | undefined;
  clusterColorFor: (clusterId: string) => string | undefined;
}

const URL_RE = /^(https?:\/\/|www\.)\S+/i;

function getDomain(url: string) {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function CommandLauncher({
  open,
  onClose,
  onCapture,
  clusterNameFor,
  clusterColorFor,
}: CommandLauncherProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const close = () => {
    setValue("");
    onClose();
  };

  // Focus input when opened.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // close is stable enough — only re-bind when open flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const trimmed = value.trim();
  const isLink = URL_RE.test(trimmed);
  const predictedClusterId = trimmed ? inferCluster(trimmed) : null;
  const predictedName = predictedClusterId ? clusterNameFor(predictedClusterId) : null;
  const predictedColor = predictedClusterId ? clusterColorFor(predictedClusterId) : null;

  const submit = () => {
    if (!trimmed) return;
    if (isLink) {
      onCapture(trimmed, "link", {
        linkUrl: trimmed,
        linkDomain: getDomain(trimmed),
      });
    } else {
      onCapture(trimmed, "text");
    }
    setValue("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cmd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="fixed inset-0 z-[60]"
            style={{
              background: "var(--syn-shadow-2)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* Modal */}
          <motion.div
            key="cmd-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Quick capture"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed left-1/2 top-[18vh] -translate-x-1/2 z-[61] w-[min(640px,92vw)] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "var(--syn-surface-2)",
              border: "1px solid rgba(99,102,241,0.28)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-4 py-3"
              style={{ borderBottom: "1px solid var(--syn-border-subtle)" }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "var(--syn-indigo)" }}
              >
                <Zap
                  className="w-3 h-3 text-white"
                  fill="white"
                  strokeWidth={0}
                />
              </div>
              <span
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: "var(--syn-slate)" }}
              >
                Quick capture
              </span>
              <span className="flex-1" />
              <kbd
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--syn-overlay-2)",
                  color: "var(--syn-slate)",
                  border: "1px solid var(--syn-border-subtle)",
                }}
              >
                Esc
              </kbd>
            </div>

            {/* Input */}
            <div className="px-4 py-3">
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={3}
                placeholder="What's in your head? Paste a link, drop a thought…"
                className="w-full bg-transparent text-[15px] outline-none resize-none leading-relaxed placeholder:text-[var(--syn-slate)]"
                style={{ color: "var(--syn-dim)" }}
              />
            </div>

            {/* Footer: live routing preview + submit */}
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                borderTop: "1px solid var(--syn-border-subtle)",
                background: "var(--syn-overlay-1)",
              }}
            >
              {/* Routing preview */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {trimmed && predictedName ? (
                  <>
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "var(--syn-slate)" }}
                    >
                      Routes to
                    </span>
                    <span
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{
                        background: `${predictedColor}15`,
                        border: `1px solid ${predictedColor}30`,
                        color: "#fff",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: predictedColor || "#888" }}
                      />
                      {predictedName}
                    </span>
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "var(--syn-slate)" }}
                    >
                      · {isLink ? "link" : "text"}
                    </span>
                  </>
                ) : (
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "var(--syn-slate)" }}
                  >
                    Type to preview cluster routing
                  </span>
                )}
              </div>

              <button
                onClick={submit}
                disabled={!trimmed}
                aria-label="Capture thought"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                style={{ background: "var(--syn-indigo)", color: "#fff" }}
              >
                Capture
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
