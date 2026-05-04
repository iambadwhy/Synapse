"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Folder,
  Tag,
  Users,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Sparkle,
  Bookmark,
  Briefcase,
  Compass,
  Coffee,
  Rocket,
  Flame,
  Lightbulb,
  Music,
  Camera,
  Pencil,
  Target,
  Heart,
  Leaf,
  Star,
  X,
  Plus,
} from "lucide-react";
import { Cluster, ClusterCategory } from "@/lib/types";

/**
 * Icon registry — a curated set of Lucide glyphs the cluster creator exposes.
 * Keep in sync with `ICON_BY_NAME` in Sidebar.tsx so rendered icons resolve.
 */
export const CLUSTER_ICONS: Array<{ name: string; Icon: typeof Folder }> = [
  { name: "folder", Icon: Folder },
  { name: "tag", Icon: Tag },
  { name: "users", Icon: Users },
  { name: "calendar", Icon: Calendar },
  { name: "checksquare", Icon: CheckSquare },
  { name: "shield", Icon: ShieldCheck },
  { name: "sparkle", Icon: Sparkle },
  { name: "bookmark", Icon: Bookmark },
  { name: "briefcase", Icon: Briefcase },
  { name: "compass", Icon: Compass },
  { name: "coffee", Icon: Coffee },
  { name: "rocket", Icon: Rocket },
  { name: "flame", Icon: Flame },
  { name: "lightbulb", Icon: Lightbulb },
  { name: "music", Icon: Music },
  { name: "camera", Icon: Camera },
  { name: "pencil", Icon: Pencil },
  { name: "target", Icon: Target },
  { name: "heart", Icon: Heart },
  { name: "leaf", Icon: Leaf },
  { name: "star", Icon: Star },
];

const PALETTE = [
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#3B82F6", // blue
  "#10B981", // mint
  "#F59E0B", // amber
  "#F97316", // orange
  "#EF4444", // red
  "#14B8A6", // teal
  "#A855F7", // purple
  "#06B6D4", // cyan
  "#84CC16", // lime
];

interface ClusterCreatorProps {
  open: boolean;
  defaultCategory?: ClusterCategory;
  onClose: () => void;
  onCreate: (cluster: Cluster) => void;
}

let customIdCounter = 0;
function nextClusterId() {
  return `custom-${Date.now().toString(36)}-${++customIdCounter}`;
}

export function ClusterCreator({
  open,
  defaultCategory = "project",
  onClose,
  onCreate,
}: ClusterCreatorProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClusterCategory>(defaultCategory);
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [iconName, setIconName] = useState<string>("folder");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form + focus input whenever the modal is reopened. The setStates
  // below are intentional — the modal's internal form state is ephemeral and
  // should be wiped each time it's reopened from a new entry point.
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setName("");
      setCategory(defaultCategory);
      setColor(PALETTE[0]);
      setIconName("folder");
      /* eslint-enable react-hooks/set-state-in-effect */
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, defaultCategory]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const save = () => {
    if (!canSave) return;
    const cluster: Cluster = {
      id: nextClusterId(),
      name: trimmed,
      label: trimmed.length > 10 ? trimmed.slice(0, 10) : trimmed,
      category,
      color,
      description: `User-created ${category === "project" ? "project" : "topic"}.`,
      synthesis:
        "No captures here yet. Add thoughts to this cluster and Synapse will synthesize the through-line once there's enough to work with.",
      nextStep:
        "Capture 3 fragments that belong here, then revisit. A single next step will surface once the cluster has shape.",
      icon: iconName,
      custom: true,
    };
    onCreate(cluster);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cluster-creator-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[70]"
            style={{ background: "var(--syn-shadow-2)", backdropFilter: "blur(6px)" }}
          />

          <motion.div
            key="cluster-creator-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create new cluster"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed left-1/2 top-[12vh] -translate-x-1/2 z-[71] w-[min(520px,92vw)] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "var(--syn-surface-2)",
              border: "1px solid rgba(99,102,241,0.28)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--syn-border-subtle)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: color }}
              >
                <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--syn-white)] leading-tight">
                  New {category}
                </p>
                <p
                  className="text-[10px] font-mono mt-0.5"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Name it, pick an icon, pick a color
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cluster creator"
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                style={{
                  background: "var(--syn-overlay-2)",
                  color: "var(--syn-slate)",
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {/* Name */}
              <div>
                <label
                  className="block text-[10px] font-mono uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Name
                </label>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canSave) {
                      e.preventDefault();
                      save();
                    }
                  }}
                  placeholder="e.g. Side Quest — Rebrand"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "var(--syn-overlay-1)",
                    border: "1px solid var(--syn-border)",
                    color: "var(--syn-dim)",
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-[10px] font-mono uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Category
                </label>
                <div
                  className="inline-flex rounded-lg p-0.5"
                  style={{
                    background: "var(--syn-overlay-1)",
                    border: "1px solid var(--syn-border)",
                  }}
                >
                  {(["project", "topic"] as ClusterCategory[]).map((cat) => {
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium capitalize cursor-pointer transition-colors"
                        style={{
                          background: active
                            ? "rgba(99,102,241,0.16)"
                            : "transparent",
                          color: active ? "#fff" : "var(--syn-slate)",
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color */}
              <div>
                <label
                  className="block text-[10px] font-mono uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((c) => {
                    const active = c === color;
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={`Color ${c}`}
                        className="w-6 h-6 rounded-full cursor-pointer transition-transform"
                        style={{
                          background: c,
                          transform: active ? "scale(1.15)" : "scale(1)",
                          boxShadow: active ? `0 0 0 2px ${c}55` : "none",
                          border: active
                            ? "2px solid #fff"
                            : "2px solid transparent",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label
                  className="block text-[10px] font-mono uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CLUSTER_ICONS.map(({ name: n, Icon }) => {
                    const active = iconName === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setIconName(n)}
                        aria-label={`Icon ${n}`}
                        className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: active
                            ? `${color}22`
                            : "var(--syn-overlay-1)",
                          border: active
                            ? `1px solid ${color}66`
                            : "1px solid var(--syn-border-subtle)",
                          color: active ? color : "var(--syn-slate)",
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 px-5 py-3"
              style={{
                borderTop: "1px solid var(--syn-border-subtle)",
                background: "var(--syn-overlay-1)",
              }}
            >
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--syn-slate)" }}
              >
                {trimmed ? `Preview — ${trimmed}` : "Fill in a name to save"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  style={{
                    background: "var(--syn-overlay-2)",
                    color: "var(--syn-slate)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!canSave}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: color, color: "#fff" }}
                >
                  Create {category}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
