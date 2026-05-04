"use client";

import { useEffect, useRef, useState } from "react";
import { Capture, Cluster } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Type,
  Link2,
  ImageIcon,
  Mic,
  Brain,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderInput,
  Plus,
  Check,
  X,
  Circle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

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

/**
 * useOutsideClick — fire `onOutside` when a pointerdown lands outside the
 * referenced element. Bound while `enabled` is true. Used for the menu and
 * Why? popovers below to avoid shadcn Tooltip's hover-delay.
 */
function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        onOutside();
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [ref, onOutside, enabled]);
}

interface CaptureCardProps {
  capture: Capture;
  cluster: Cluster | undefined;
  clusters: Cluster[];
  onEdit: (id: string, content: string, tags?: string[]) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, targetClusterId: string) => void;
  onToggleComplete: (id: string) => void;
  onRequestNewCluster: () => void;
}

export function CaptureCard({
  capture,
  cluster,
  clusters,
  onEdit,
  onDelete,
  onMove,
  onToggleComplete,
  onRequestNewCluster,
}: CaptureCardProps) {
  const completed = !!capture.completedAt;
  const TypeIcon = TYPE_ICONS[capture.type] ?? Type;

  // ── Local UI state ───────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(capture.content);
  const [tagDraft, setTagDraft] = useState(capture.tags.join(" "));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => {
    setMenuOpen(false);
    setMoveMenuOpen(false);
    setConfirmDelete(false);
  }, menuOpen);
  useOutsideClick(whyRef, () => setWhyOpen(false), whyOpen);

  const beginEdit = () => {
    setDraft(capture.content);
    setTagDraft(capture.tags.join(" "));
    setEditing(true);
    setMenuOpen(false);
  };

  const commitEdit = () => {
    const nextTags = tagDraft
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);
    onEdit(capture.id, draft.trim() || capture.content, nextTags);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(capture.content);
    setTagDraft(capture.tags.join(" "));
    setEditing(false);
  };

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
        <div className="flex items-center gap-2 mb-2.5">
          <TypeIcon
            className="w-3.5 h-3.5"
            style={{ color: "var(--syn-slate)" }}
          />
          <div className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-3.5 border-[1.5px] rounded-full animate-spin"
              style={{
                borderColor: "var(--syn-indigo)",
                borderTopColor: "transparent",
              }}
            />
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--syn-indigo)" }}
            >
              Clustering…
            </span>
          </div>
        </div>
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
      exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
      layout
      transition={{ duration: 0.3 }}
      className="rounded-xl p-4 mb-2.5 group relative"
      style={{
        background: completed
          ? "rgba(16,185,129,0.04)"
          : "var(--syn-surface)",
        border: completed
          ? "1px solid rgba(16,185,129,0.2)"
          : "1px solid var(--syn-border)",
        opacity: completed ? 0.78 : 1,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Completion checkbox — always visible for task-shaped clusters,
              hover-only otherwise. Kept interactive even when completed so
              the user can undo. */}
          <button
            onClick={() => onToggleComplete(capture.id)}
            aria-label={
              completed ? "Mark as not complete" : "Mark as complete"
            }
            aria-pressed={completed}
            className={`w-4 h-4 flex items-center justify-center rounded-full cursor-pointer transition-all shrink-0 ${
              completed ? "" : "opacity-50 group-hover:opacity-100"
            }`}
            style={{ color: completed ? "var(--syn-mint)" : "var(--syn-slate)" }}
          >
            {completed ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
          </button>

          <TypeIcon
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "var(--syn-slate)" }}
          />
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--syn-slate)" }}
          >
            {timeAgo(capture.timestamp)}
          </span>
          {completed && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: "rgba(16,185,129,0.12)",
                color: "var(--syn-mint)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              Completed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
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

          {/* Menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setMenuOpen((v) => !v);
                setMoveMenuOpen(false);
                setConfirmDelete(false);
              }}
              aria-label="Capture options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 data-[open=true]:opacity-100 transition-opacity"
              data-open={menuOpen}
              style={{
                background: menuOpen
                  ? "var(--syn-overlay-3)"
                  : "var(--syn-overlay-1)",
                color: "var(--syn-slate)",
                border: "1px solid var(--syn-border-subtle)",
              }}
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 z-40 rounded-lg overflow-hidden shadow-xl"
                  style={{
                    background: "var(--syn-surface-2)",
                    border: "1px solid var(--syn-border)",
                    minWidth: "180px",
                  }}
                >
                  {!moveMenuOpen && !confirmDelete && (
                    <>
                      <MenuItem
                        icon={
                          completed ? (
                            <RotateCcw className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )
                        }
                        label={completed ? "Reopen" : "Mark complete"}
                        onClick={() => {
                          onToggleComplete(capture.id);
                          setMenuOpen(false);
                        }}
                      />
                      <MenuItem
                        icon={<Edit2 className="w-3 h-3" />}
                        label="Edit"
                        onClick={beginEdit}
                      />
                      <MenuItem
                        icon={<FolderInput className="w-3 h-3" />}
                        label="Move to…"
                        onClick={() => setMoveMenuOpen(true)}
                        chevron
                      />
                      <MenuItem
                        icon={<Trash2 className="w-3 h-3" />}
                        label="Delete"
                        danger
                        onClick={() => setConfirmDelete(true)}
                      />
                    </>
                  )}

                  {moveMenuOpen && (
                    <div className="max-h-[260px] overflow-y-auto">
                      <div
                        className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider"
                        style={{
                          color: "var(--syn-slate)",
                          borderBottom: "1px solid var(--syn-border-subtle)",
                        }}
                      >
                        Move to cluster
                      </div>
                      {clusters.map((c) => (
                        <button
                          key={c.id}
                          role="menuitem"
                          onClick={() => {
                            onMove(capture.id, c.id);
                            setMenuOpen(false);
                            setMoveMenuOpen(false);
                          }}
                          disabled={c.id === capture.clusterId}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--syn-overlay-1)]"
                          style={{ color: "var(--syn-ash)" }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: c.color }}
                          />
                          <span className="flex-1 truncate">{c.name}</span>
                          {c.id === capture.clusterId && (
                            <Check
                              className="w-3 h-3 shrink-0"
                              style={{ color: c.color }}
                            />
                          )}
                        </button>
                      ))}
                      <button
                        role="menuitem"
                        onClick={() => {
                          onRequestNewCluster();
                          setMenuOpen(false);
                          setMoveMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs cursor-pointer hover:bg-[var(--syn-overlay-1)]"
                        style={{
                          color: "var(--syn-indigo)",
                          borderTop: "1px solid var(--syn-border-subtle)",
                        }}
                      >
                        <Plus className="w-3 h-3 shrink-0" />
                        New cluster…
                      </button>
                    </div>
                  )}

                  {confirmDelete && (
                    <div className="p-2.5">
                      <p
                        className="text-xs leading-snug mb-2"
                        style={{ color: "var(--syn-ash)" }}
                      >
                        Delete this capture? This can&apos;t be undone.
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 px-2 py-1 rounded-md text-[11px] cursor-pointer"
                          style={{
                            background: "var(--syn-overlay-2)",
                            color: "var(--syn-slate)",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDelete(capture.id);
                            setMenuOpen(false);
                            setConfirmDelete(false);
                          }}
                          className="flex-1 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer"
                          style={{
                            background: "rgba(239,68,68,0.9)",
                            color: "#fff",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="mb-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full px-3 py-2 text-sm outline-none resize-none rounded-lg leading-relaxed"
            style={{
              background: "var(--syn-overlay-1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--syn-dim)",
            }}
          />
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            placeholder="#tags space separated"
            className="mt-1.5 w-full px-3 py-1.5 text-[11px] font-mono outline-none rounded-lg"
            style={{
              background: "var(--syn-overlay-1)",
              border: "1px solid var(--syn-border-subtle)",
              color: "var(--syn-slate)",
            }}
          />
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
              style={{
                background: "var(--syn-overlay-2)",
                color: "var(--syn-slate)",
              }}
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
            <button
              onClick={commitEdit}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer"
              style={{ background: "var(--syn-indigo)", color: "#fff" }}
            >
              <Check className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>
      ) : capture.type === "link" && capture.linkTitle ? (
        <div className="mb-2.5">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
            style={{
              background: "var(--syn-overlay-1)",
              border: "1px solid var(--syn-border-subtle)",
            }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
              style={{ background: cluster?.color ?? "var(--syn-slate)" }}
            >
              {(capture.linkDomain ?? "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs text-[var(--syn-dim)] truncate leading-snug"
                style={{
                  textDecoration: completed ? "line-through" : "none",
                }}
              >
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
        </div>
      ) : capture.type === "image" && capture.imagePreview ? (
        <div className="mb-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.imagePreview}
            alt="capture"
            className="w-full max-h-40 object-cover rounded-lg"
            style={{ border: "1px solid var(--syn-border)" }}
          />
          <p
            className="text-xs mt-1.5 text-[var(--syn-dim)] leading-relaxed"
            style={{
              textDecoration: completed ? "line-through" : "none",
            }}
          >
            {capture.content}
          </p>
        </div>
      ) : (
        <p
          className="text-sm leading-relaxed mb-2.5"
          style={{
            color: "var(--syn-dim)",
            textDecoration: completed ? "line-through" : "none",
          }}
        >
          {capture.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap min-w-0">
          {capture.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono truncate"
              style={{ color: "var(--syn-slate)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Why? — click-controlled popover (no hover delay) */}
        <div className="relative" ref={whyRef}>
          <button
            onClick={() => setWhyOpen((v) => !v)}
            aria-label="Why this cluster?"
            aria-expanded={whyOpen}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-opacity cursor-pointer opacity-0 group-hover:opacity-100 data-[open=true]:opacity-100"
            data-open={whyOpen}
            style={{
              background: whyOpen
                ? "rgba(99,102,241,0.12)"
                : "var(--syn-overlay-1)",
              color: whyOpen ? "var(--syn-indigo)" : "var(--syn-slate)",
              border: whyOpen
                ? "1px solid rgba(99,102,241,0.4)"
                : "1px solid var(--syn-border)",
            }}
          >
            <Brain className="w-3 h-3" />
            Why?
          </button>

          <AnimatePresence>
            {whyOpen && (
              <motion.div
                role="dialog"
                aria-label="Inference reason"
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 bottom-full mb-2 z-40 rounded-lg shadow-xl p-3"
                style={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(99,102,241,0.3)",
                  width: "240px",
                }}
              >
                <p
                  className="text-[10px] font-mono mb-1 font-semibold"
                  style={{ color: "var(--syn-indigo)" }}
                >
                  System Inference
                </p>
                <p
                  className="text-xs leading-snug"
                  style={{ color: "var(--syn-dim)" }}
                >
                  {capture.inferenceReason}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Menu primitives ────────────────────────────────── */

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  chevron,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  chevron?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs cursor-pointer hover:bg-[var(--syn-overlay-1)]"
      style={{
        color: danger ? "rgba(239,68,68,0.9)" : "var(--syn-ash)",
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {chevron && <span className="text-[10px] opacity-50">›</span>}
    </button>
  );
}
