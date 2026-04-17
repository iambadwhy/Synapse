"use client";

import { useEffect, useRef } from "react";
import { Cluster, Capture } from "@/lib/types";
import {
  Folder,
  Tag,
  Users,
  Calendar,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  Inbox,
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
  };
  return map[id] ?? <Tag className="w-3.5 h-3.5" />;
}

function ClusterRow({
  cluster,
  count,
  selected,
  recentlyRouted,
  onSelect,
  onAction,
}: {
  cluster: Cluster;
  count: number;
  selected: boolean;
  recentlyRouted: boolean;
  onSelect: () => void;
  onAction: () => void;
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
    <div className="group relative flex items-center gap-1 px-2 mb-0.5">
      <button
        ref={rowRef}
        onClick={onSelect}
        className="flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer"
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
          className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full"
          style={{
            background: selected ? `${cluster.color}25` : "rgba(255,255,255,0.05)",
            color: selected ? cluster.color : "var(--syn-slate)",
          }}
        >
          {count}
        </span>
      </button>

      {/* Action chevron — visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md cursor-pointer"
        style={{ color: "var(--syn-slate)" }}
        title="Open next steps"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

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

  return (
    <aside
      className="w-60 shrink-0 flex flex-col overflow-y-auto py-4"
      style={{
        borderRight: "1px solid var(--syn-border)",
        background: "var(--syn-bg)",
      }}
    >
      {/* All captures */}
      <div className="px-4 mb-3">
        <button
          onClick={() => onClusterSelect(null)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer"
          style={
            selectedClusterId === null
              ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
              : { background: "transparent", border: "1px solid transparent" }
          }
        >
          <Inbox className="w-3.5 h-3.5" style={{ color: selectedClusterId === null ? "#fff" : "var(--syn-slate)" }} />
          <span
            className="text-xs font-medium flex-1"
            style={{ color: selectedClusterId === null ? "#fff" : "var(--syn-ash)" }}
          >
            All Captures
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
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
            onSelect={() =>
              onClusterSelect(selectedClusterId === c.id ? null : c.id)
            }
            onAction={() => onClusterAction(c)}
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
            onSelect={() =>
              onClusterSelect(selectedClusterId === c.id ? null : c.id)
            }
            onAction={() => onClusterAction(c)}
          />
        ))}
      </div>
    </aside>
  );
}
