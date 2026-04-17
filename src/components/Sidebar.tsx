"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cluster, Capture } from "@/lib/types";
import {
  Folder,
  Tag,
  Users,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Inbox,
  Sparkle,
} from "lucide-react";

interface SidebarProps {
  clusters: Cluster[];
  captures: Capture[];
  selectedClusterId: string | null;
  recentlyRoutedClusterId: string | null;
  onClusterSelect: (id: string | null) => void;
  onClusterAction: (cluster: Cluster) => void;
}

function clusterIcon(id: string) {
  const map: Record<string, React.ReactNode> = {
    "proj-a": <Folder className="w-3.5 h-3.5" />,
    "proj-b": <Folder className="w-3.5 h-3.5" />,
    "proj-c": <Folder className="w-3.5 h-3.5" />,
    accessibility: <ShieldCheck className="w-3.5 h-3.5" />,
    tasks: <CheckSquare className="w-3.5 h-3.5" />,
    people: <Users className="w-3.5 h-3.5" />,
    meetings: <Calendar className="w-3.5 h-3.5" />,
    inspiration: <Sparkle className="w-3.5 h-3.5" />,
  };
  return map[id] ?? <Tag className="w-3.5 h-3.5" />;
}

function ClusterRow({
  cluster,
  count,
  selected,
  recentlyRouted,
  onOpen,
}: {
  cluster: Cluster;
  count: number;
  selected: boolean;
  recentlyRouted: boolean;
  onOpen: () => void;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (recentlyRouted && rowRef.current) {
      rowRef.current.classList.add("cluster-pulse");
      const t = setTimeout(
        () => rowRef.current?.classList.remove("cluster-pulse"),
        1400
      );
      return () => clearTimeout(t);
    }
  }, [recentlyRouted]);

  return (
    <div className="relative flex items-center px-2 mb-0.5">
      <button
        ref={rowRef}
        onClick={onOpen}
        aria-label={`Open ${cluster.name}`}
        className="flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer"
        style={
          selected
            ? {
                background: `${cluster.color}18`,
                border: `1px solid ${cluster.color}35`,
              }
            : {
                background: "transparent",
                border: "1px solid transparent",
              }
        }
      >
        {/* Color dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: cluster.color }}
        />
        {/* Icon */}
        <span style={{ color: selected ? cluster.color : "var(--syn-slate)" }}>
          {clusterIcon(cluster.id)}
        </span>
        {/* Name */}
        <span
          className="text-xs font-medium flex-1 truncate"
          style={{ color: selected ? "#fff" : "var(--syn-ash)" }}
        >
          {cluster.name}
        </span>
        {/* Count */}
        <span
          className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full shrink-0"
          style={{
            background: selected ? `${cluster.color}25` : "rgba(255,255,255,0.05)",
            color: selected ? cluster.color : "var(--syn-slate)",
          }}
        >
          {count}
        </span>
      </button>
    </div>
  );
}

const SIDEBAR_WIDTH_KEY = "syn.sidebar.width";
const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 240;

export function Sidebar({
  clusters,
  captures,
  selectedClusterId,
  recentlyRoutedClusterId,
  onClusterSelect,
  onClusterAction,
}: SidebarProps) {
  const countFor = (id: string) =>
    captures.filter((c) => c.clusterId === id && c.status === "clustered").length;

  const projects = clusters.filter((c) => c.category === "project");
  const topics = clusters.filter((c) => c.category === "topic");

  // ── Resizable width (persisted) ────────────────────────────────
  const [width, setWidth] = useState<number>(SIDEBAR_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const dragStateRef = useRef<{ startX: number; startW: number }>({
    startX: 0,
    startW: SIDEBAR_DEFAULT,
  });

  // Hydrate from localStorage on mount. SSR must render with the default
  // width, so the post-hydration setState is deliberate — this is the
  // documented pattern for reading client-only storage without a hydration
  // mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (raw) {
        const parsed = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, Number(raw)));
        if (!Number.isNaN(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setWidth(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistWidth = useCallback((w: number) => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(w)));
    } catch {
      /* ignore */
    }
  }, []);

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragStateRef.current = { startX: e.clientX, startW: width };
    setDragging(true);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const next = Math.max(
      SIDEBAR_MIN,
      Math.min(SIDEBAR_MAX, dragStateRef.current.startW + dx)
    );
    setWidth(next);
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(false);
    persistWidth(width);
  };

  // Clicking a cluster tile now opens the action panel directly — and also
  // marks it selected so the feed filters when the user switches to Stream.
  const handleClusterClick = (c: Cluster) => {
    onClusterSelect(c.id);
    onClusterAction(c);
  };

  return (
    <aside
      className="relative shrink-0 flex flex-col overflow-y-auto py-4"
      style={{
        width: `${width}px`,
        borderRight: "1px solid var(--syn-border)",
        background: "var(--syn-bg)",
      }}
    >
      {/* All captures */}
      <div className="px-4 mb-3">
        <button
          onClick={() => onClusterSelect(null)}
          aria-label="Show all captures"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer"
          style={
            selectedClusterId === null
              ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
              : { background: "transparent", border: "1px solid transparent" }
          }
        >
          <Inbox className="w-3.5 h-3.5" style={{ color: selectedClusterId === null ? "#fff" : "var(--syn-slate)" }} />
          <span
            className="text-xs font-medium flex-1 truncate"
            style={{ color: selectedClusterId === null ? "#fff" : "var(--syn-ash)" }}
          >
            All Captures
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: selectedClusterId === null ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
              color: selectedClusterId === null ? "#fff" : "var(--syn-slate)",
            }}
          >
            {captures.filter((c) => c.status === "clustered").length}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ height: "1px", background: "var(--syn-border)" }} />

      {/* Projects */}
      <div className="px-2 mb-1">
        <p
          className="px-2 text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--syn-slate)", fontFamily: "var(--font-geist-mono)" }}
        >
          Projects
        </p>
        {projects.map((c) => (
          <ClusterRow
            key={c.id}
            cluster={c}
            count={countFor(c.id)}
            selected={selectedClusterId === c.id}
            recentlyRouted={recentlyRoutedClusterId === c.id}
            onOpen={() => handleClusterClick(c)}
          />
        ))}
      </div>

      {/* Topics */}
      <div className="px-2 mt-3">
        <p
          className="px-2 text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--syn-slate)", fontFamily: "var(--font-geist-mono)" }}
        >
          Topics
        </p>
        {topics.map((c) => (
          <ClusterRow
            key={c.id}
            cluster={c}
            count={countFor(c.id)}
            selected={selectedClusterId === c.id}
            recentlyRouted={recentlyRoutedClusterId === c.id}
            onOpen={() => handleClusterClick(c)}
          />
        ))}
      </div>

      {/* Resize handle — right edge. 5px hit area, 1px visual on hover/drag. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        className="absolute top-0 right-0 h-full"
        style={{
          width: "5px",
          marginRight: "-2px",
          cursor: "ew-resize",
          touchAction: "none",
          zIndex: 20,
          background: dragging ? "var(--syn-indigo)" : "transparent",
          transition: dragging ? "none" : "background 120ms ease",
        }}
        onMouseEnter={(e) => {
          if (!dragging)
            (e.currentTarget as HTMLDivElement).style.background =
              "rgba(99,102,241,0.35)";
        }}
        onMouseLeave={(e) => {
          if (!dragging)
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      />
    </aside>
  );
}
