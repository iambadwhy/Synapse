"use client";

import { Capture, Cluster } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Brain,
  Mic,
  Link2,
  ImageIcon,
  Type,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface CaptureInspectorProps {
  capture: Capture | null;
  cluster: Cluster | undefined;
  onClose: () => void;
  onOpenCluster: (cluster: Cluster) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICONS = {
  text: Type,
  link: Link2,
  image: ImageIcon,
  voice: Mic,
};

const TYPE_LABELS: Record<string, string> = {
  text: "Text",
  link: "Link",
  image: "Image",
  voice: "Voice",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CaptureInspector({
  capture,
  cluster,
  onClose,
  onOpenCluster,
  onToggleComplete,
  onDelete,
}: CaptureInspectorProps) {
  const open = Boolean(capture);
  const TypeIcon = capture ? TYPE_ICONS[capture.type] ?? Type : Type;
  const completed = !!capture?.completedAt;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <AnimatePresence>
      {open && capture && (
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--syn-border)",
                  }}
                >
                  <TypeIcon className="w-3.5 h-3.5" style={{ color: "var(--syn-ash)" }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white leading-tight">
                      {TYPE_LABELS[capture.type] ?? "Capture"}
                    </p>
                    {completed && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(16,185,129,0.12)",
                          color: "var(--syn-mint)",
                          border: "1px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Done
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[10px] font-mono mt-0.5"
                    style={{ color: "var(--syn-slate)" }}
                  >
                    {timeAgo(capture.timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close capture inspector"
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--syn-slate)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
              {/* Cluster chip (clickable to open cluster action) */}
              {cluster && (
                <button
                  onClick={() => onOpenCluster(cluster)}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group text-left"
                  style={{
                    background: `${cluster.color}12`,
                    border: `1px solid ${cluster.color}30`,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: cluster.color }}
                    />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-mono uppercase tracking-wider"
                        style={{ color: cluster.color }}
                      >
                        Routed to
                      </p>
                      <p className="text-xs font-medium text-white truncate">
                        {cluster.name}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ color: cluster.color }}
                  />
                </button>
              )}

              {/* Content */}
              <div>
                <p
                  className="text-[10px] font-mono uppercase tracking-wider mb-2"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Content
                </p>

                {capture.type === "link" && capture.linkTitle ? (
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--syn-border-subtle)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                      style={{ background: cluster?.color ?? "var(--syn-slate)" }}
                    >
                      {(capture.linkDomain ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white truncate leading-snug">
                        {capture.linkTitle}
                      </p>
                      <p
                        className="text-[10px] font-mono mt-0.5"
                        style={{ color: "var(--syn-slate)" }}
                      >
                        {capture.linkDomain}
                      </p>
                    </div>
                    <ExternalLink
                      className="w-3 h-3 shrink-0"
                      style={{ color: "var(--syn-slate)" }}
                    />
                  </div>
                ) : capture.type === "image" && capture.imagePreview ? (
                  <div>
                    <img
                      src={capture.imagePreview}
                      alt="capture"
                      className="w-full max-h-56 object-cover rounded-lg"
                      style={{ border: "1px solid var(--syn-border)" }}
                    />
                    <p
                      className="text-xs mt-2 leading-relaxed"
                      style={{ color: "var(--syn-dim)" }}
                    >
                      {capture.content}
                    </p>
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--syn-dim)" }}
                  >
                    {capture.content}
                  </p>
                )}
              </div>

              {/* Inference reason */}
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
                    Why it was routed here
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--syn-ash)" }}>
                  {capture.inferenceReason}
                </p>
              </div>

              {/* Tags */}
              {capture.tags.length > 0 && (
                <div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-wider mb-2"
                    style={{ color: "var(--syn-slate)" }}
                  >
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {capture.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--syn-border)",
                          color: "var(--syn-slate)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div
              className="px-5 py-4 shrink-0 flex flex-col gap-2"
              style={{ borderTop: "1px solid var(--syn-border)" }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleComplete(capture.id)}
                  aria-pressed={completed}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
                  style={{
                    background: completed
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(16,185,129,0.12)",
                    color: completed ? "var(--syn-ash)" : "var(--syn-mint)",
                    border: completed
                      ? "1px solid var(--syn-border)"
                      : "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  {completed ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark complete
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirmDelete) {
                      onDelete(capture.id);
                      setConfirmDelete(false);
                    } else {
                      setConfirmDelete(true);
                    }
                  }}
                  aria-label={confirmDelete ? "Confirm delete" : "Delete capture"}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
                  style={{
                    background: confirmDelete
                      ? "rgba(239,68,68,0.16)"
                      : "rgba(255,255,255,0.04)",
                    color: confirmDelete ? "#f87171" : "var(--syn-slate)",
                    border: confirmDelete
                      ? "1px solid rgba(239,68,68,0.4)"
                      : "1px solid var(--syn-border)",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {confirmDelete ? "Confirm" : "Delete"}
                </button>
              </div>
              {cluster && (
                <button
                  onClick={() => onOpenCluster(cluster)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "var(--syn-indigo)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <Brain className="w-4 h-4" />
                  Open {cluster.name}
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
