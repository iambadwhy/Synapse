"use client";

import { Capture, Cluster } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Type, Link2, ImageIcon, Mic, Brain, ExternalLink } from "lucide-react";

const TYPE_ICONS = {
  text: Type,
  link: Link2,
  image: ImageIcon,
  voice: Mic,
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

interface CaptureCardProps {
  capture: Capture;
  cluster: Cluster | undefined;
}

export function CaptureCard({ capture, cluster }: CaptureCardProps) {
  const TypeIcon = TYPE_ICONS[capture.type] ?? Type;

  /* ── Processing state ─────────────────────────────── */
  if (capture.status === "processing") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-xl p-4 mb-2.5 shimmer"
        style={{
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          <TypeIcon className="w-3.5 h-3.5" style={{ color: "var(--syn-slate)" }} />
          <div className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-3.5 border-[1.5px] rounded-full animate-spin"
              style={{ borderColor: "var(--syn-indigo)", borderTopColor: "transparent" }}
            />
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--syn-indigo)" }}
            >
              Clustering…
            </span>
          </div>
        </div>
        {/* Content (dimmed) */}
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{ color: "rgba(226,232,240,0.45)" }}
        >
          {capture.content}
        </p>
      </motion.div>
    );
  }

  /* ── Clustered state ──────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      transition={{ duration: 0.3 }}
      className="rounded-xl p-4 mb-2.5 group"
      style={{
        background: "var(--syn-surface)",
        border: "1px solid var(--syn-border)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--syn-slate)" }} />
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--syn-slate)" }}
          >
            {timeAgo(capture.timestamp)}
          </span>
        </div>
        {/* Cluster badge */}
        {cluster && (
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: `${cluster.color}18`,
              color: cluster.color,
              border: `1px solid ${cluster.color}30`,
            }}
          >
            {cluster.label}
          </motion.span>
        )}
      </div>

      {/* Content */}
      {capture.type === "link" && capture.linkTitle ? (
        <div className="mb-2.5">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--syn-border-subtle)" }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
              style={{ background: cluster?.color ?? "var(--syn-slate)" }}
            >
              {(capture.linkDomain ?? "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--syn-dim)] truncate leading-snug">
                {capture.linkTitle}
              </p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--syn-slate)" }}>
                {capture.linkDomain}
              </p>
            </div>
            <ExternalLink className="w-3 h-3 shrink-0" style={{ color: "var(--syn-slate)" }} />
          </div>
        </div>
      ) : capture.type === "image" && capture.imagePreview ? (
        <div className="mb-2.5">
          <img
            src={capture.imagePreview}
            alt="capture"
            className="w-full max-h-40 object-cover rounded-lg"
            style={{ border: "1px solid var(--syn-border)" }}
          />
          <p className="text-xs mt-1.5 text-[var(--syn-dim)] leading-relaxed">
            {capture.content}
          </p>
        </div>
      ) : (
        <p
          className="text-sm leading-relaxed mb-2.5"
          style={{ color: "var(--syn-dim)" }}
        >
          {capture.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {capture.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono"
              style={{ color: "var(--syn-slate)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Why? inference tooltip */}
        <Tooltip>
          <TooltipTrigger
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--syn-slate)",
              border: "1px solid var(--syn-border)",
            }}
          >
            <Brain className="w-3 h-3" />
            Why?
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[220px]"
            style={{
              background: "#1a1a2e",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--syn-dim)",
              padding: "10px 12px",
            }}
          >
            <p
              className="text-[10px] font-mono mb-1 font-semibold"
              style={{ color: "var(--syn-indigo)" }}
            >
              System Inference
            </p>
            <p className="text-xs leading-snug">{capture.inferenceReason}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}
