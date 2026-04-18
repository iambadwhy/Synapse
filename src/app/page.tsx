"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Capture, Cluster, CaptureType, ClusterCategory } from "@/lib/types";
import {
  CLUSTERS,
  INITIAL_CAPTURES,
  inferCluster,
  getInferenceReason,
} from "@/lib/data";

import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";
import { CaptureBar } from "@/components/CaptureBar";
import { CaptureCard } from "@/components/CaptureCard";
import { ActionPanel } from "@/components/ActionPanel";
import { CaptureInspector } from "@/components/CaptureInspector";
import { CommandLauncher } from "@/components/CommandLauncher";
import { ClusterCreator } from "@/components/ClusterCreator";
import { MapView } from "@/components/MapView";
import { Sparkles, ArrowUpDown, Check } from "lucide-react";

let idCounter = 100;
function nextId() {
  return `c${++idCounter}`;
}

type SortMode = "newest" | "oldest" | "cluster";

export default function Home() {
  const [view, setView] = useState<"feed" | "map">("feed");
  const [clusters, setClusters] = useState<Cluster[]>(CLUSTERS);
  const [captures, setCaptures] = useState<Capture[]>(INITIAL_CAPTURES);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null
  );
  const [recentlyRoutedClusterId, setRecentlyRoutedClusterId] = useState<
    string | null
  >(null);

  // Feed sort + completed filter + search
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Action panel — store by id so the rendered cluster stays in sync
  // automatically when `clusters` mutates (rename, etc.).
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [actionPanelClusterId, setActionPanelClusterId] = useState<
    string | null
  >(null);

  // Capture inspector (from Map view satellite clicks)
  const [inspectedCapture, setInspectedCapture] = useState<Capture | null>(null);

  // Accepted next steps (shown as toast)
  const [acceptedToast, setAcceptedToast] = useState<string | null>(null);
  const [tweakMode, setTweakMode] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Demo mode
  const [demoRunning, setDemoRunning] = useState(false);
  const demoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ⌘K command launcher
  const [commandOpen, setCommandOpen] = useState(false);

  // Cluster creator modal
  const [clusterCreatorOpen, setClusterCreatorOpen] = useState(false);
  const [clusterCreatorCategory, setClusterCreatorCategory] =
    useState<ClusterCategory>("project");

  // Global ⌘K / Ctrl+K to toggle quick-capture.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Add a new capture ──────────────────────────────
  const handleCapture = useCallback(
    (
      content: string,
      type: CaptureType,
      extra?: { linkUrl?: string; linkDomain?: string; imagePreview?: string }
    ) => {
      const clusterId = inferCluster(content);
      const inferenceReason = getInferenceReason(content, clusterId);

      const newCapture: Capture = {
        id: nextId(),
        content,
        type,
        clusterId,
        inferenceReason,
        timestamp: new Date(),
        tags: [],
        status: "processing",
        ...(extra?.linkUrl && {
          linkUrl: extra.linkUrl,
          linkTitle: content,
          linkDomain: extra.linkDomain,
        }),
        ...(extra?.imagePreview && { imagePreview: extra.imagePreview }),
      };

      setCaptures((prev) => [newCapture, ...prev]);

      // Route to cluster after delay (simulated AI processing)
      setTimeout(() => {
        setCaptures((prev) =>
          prev.map((c) =>
            c.id === newCapture.id ? { ...c, status: "clustered" } : c
          )
        );
        setRecentlyRoutedClusterId(clusterId);
        setTimeout(() => setRecentlyRoutedClusterId(null), 2000);
      }, 1800);
    },
    []
  );

  // ── Capture mutations ──────────────────────────────
  const handleEditCapture = useCallback(
    (id: string, content: string, tags?: string[]) => {
      setCaptures((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, content, tags: tags ?? c.tags } : c
        )
      );
    },
    []
  );

  const handleDeleteCapture = useCallback((id: string) => {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleMoveCapture = useCallback(
    (id: string, targetClusterId: string) => {
      setCaptures((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          // Compose an honest reason using the target cluster's *name*
          // (not its id) so the Why popover reads naturally.
          const target = clusters.find((cl) => cl.id === targetClusterId);
          const targetName = target?.name ?? targetClusterId;
          return {
            ...c,
            clusterId: targetClusterId,
            inferenceReason: `You moved this here — original routing to ${c.clusterId} was overridden. Now filed under ${targetName}.`,
          };
        })
      );
      setRecentlyRoutedClusterId(targetClusterId);
      setTimeout(() => setRecentlyRoutedClusterId(null), 1400);
    },
    [clusters]
  );

  /**
   * Toggle capture completion in place. We keep completed items in the
   * store rather than hard-deleting so the Map still shows them (as hollow
   * rings) and the user can retrieve them later.
   */
  const handleToggleComplete = useCallback((id: string) => {
    setCaptures((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, completedAt: c.completedAt ? undefined : new Date() }
          : c
      )
    );
  }, []);

  // ── Cluster interactions ───────────────────────────
  const handleClusterAction = useCallback((cluster: Cluster) => {
    setActionPanelClusterId(cluster.id);
    setActionPanelOpen(true);
    setTweakMode(false);
  }, []);

  const handleCaptureClick = useCallback((capture: Capture) => {
    setInspectedCapture(capture);
  }, []);

  const handleOpenClusterFromInspector = useCallback((cluster: Cluster) => {
    setInspectedCapture(null);
    setActionPanelClusterId(cluster.id);
    setActionPanelOpen(true);
    setTweakMode(false);
  }, []);

  const handleCreateCluster = useCallback((newCluster: Cluster) => {
    setClusters((prev) => [...prev, newCluster]);
  }, []);

  const handleOpenClusterCreator = useCallback((cat: ClusterCategory) => {
    setClusterCreatorCategory(cat);
    setClusterCreatorOpen(true);
  }, []);

  const handleAccept = useCallback(() => {
    const current =
      actionPanelClusterId !== null
        ? clusters.find((c) => c.id === actionPanelClusterId)
        : null;
    if (!current) return;
    setActionPanelOpen(false);

    const msg = `Task added: ${current.nextStep.slice(0, 60)}…`;
    setAcceptedToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setAcceptedToast(null), 3500);
  }, [actionPanelClusterId, clusters]);

  const handleTweak = useCallback(() => {
    setTweakMode((v) => !v);
  }, []);

  // ── Demo mode: fire 3 staggered captures through the real pipeline ──
  const handleRunDemo = useCallback(() => {
    if (demoRunning) return;
    setDemoRunning(true);
    demoTimersRef.current.forEach((t) => clearTimeout(t));
    demoTimersRef.current = [];

    const demoCaptures: Array<{
      delay: number;
      content: string;
      type: CaptureType;
      extra?: { linkUrl?: string; linkDomain?: string; imagePreview?: string };
    }> = [
      {
        delay: 0,
        content:
          "APCA spec just updated — the Lumen button token fails by 0.4. Flag it before Friday's review.",
        type: "voice",
      },
      {
        delay: 2200,
        content:
          "Saul Bass, Vertigo opening — the counter-rotating spirals are a pacing trick, not an aesthetic one.",
        type: "link",
        extra: {
          linkUrl: "https://artofthetitle.com/title/vertigo",
          linkDomain: "artofthetitle.com",
        },
      },
      {
        delay: 4400,
        content:
          "Draft TikTok hook: \"My studio has three chairs and one of them is only for thinking.\" 12s. One pan.",
        type: "text",
      },
    ];

    demoCaptures.forEach(({ delay, content, type, extra }) => {
      const t = setTimeout(() => {
        handleCapture(content, type, extra);
      }, delay);
      demoTimersRef.current.push(t);
    });

    const unlock = setTimeout(() => {
      setDemoRunning(false);
      demoTimersRef.current = [];
    }, 4400 + 2000);
    demoTimersRef.current.push(unlock);
  }, [demoRunning, handleCapture]);

  // ── Filtered + sorted captures for the feed ────────
  const clusterMap = useMemo(
    () => Object.fromEntries(clusters.map((c) => [c.id, c])) as Record<
      string,
      Cluster
    >,
    [clusters]
  );

  // Derive the currently-displayed action-panel cluster from its id — keeps
  // the panel in sync automatically when `clusters` mutates (e.g. a rename
  // via the creator), no sync effect needed.
  const actionPanelCluster: Cluster | null = actionPanelClusterId
    ? clusterMap[actionPanelClusterId] ?? null
    : null;

  const clusterRank = useMemo(() => {
    const rank = new Map<string, number>();
    clusters.forEach((c, i) => rank.set(c.id, i));
    return rank;
  }, [clusters]);

  const visibleCaptures = useMemo(() => {
    let filtered = selectedClusterId
      ? captures.filter((c) => c.clusterId === selectedClusterId)
      : captures;
    if (hideCompleted) {
      filtered = filtered.filter((c) => !c.completedAt);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((c) => {
        const hay = [
          c.content,
          c.inferenceReason,
          c.linkTitle ?? "",
          c.linkDomain ?? "",
          clusterMap[c.clusterId]?.name ?? "",
          ...c.tags,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    const sorted = [...filtered];
    if (sortMode === "newest") {
      sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (sortMode === "oldest") {
      sorted.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } else if (sortMode === "cluster") {
      sorted.sort((a, b) => {
        const ra = clusterRank.get(a.clusterId) ?? 99;
        const rb = clusterRank.get(b.clusterId) ?? 99;
        if (ra !== rb) return ra - rb;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    }
    return sorted;
  }, [captures, selectedClusterId, sortMode, hideCompleted, searchQuery, clusterMap, clusterRank]);

  const completedCount = useMemo(
    () => captures.filter((c) => !!c.completedAt).length,
    [captures]
  );

  const sortLabels: Record<SortMode, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    cluster: "By cluster",
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--syn-bg)" }}
    >
      <TopNav
        view={view}
        onViewChange={setView}
        onRunDemo={handleRunDemo}
        demoRunning={demoRunning}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          clusters={clusters}
          captures={captures}
          selectedClusterId={selectedClusterId}
          recentlyRoutedClusterId={recentlyRoutedClusterId}
          onClusterSelect={setSelectedClusterId}
          onClusterAction={handleClusterAction}
          onRequestCreateCluster={handleOpenClusterCreator}
        />

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {view === "feed" ? (
            <>
              {/* Capture bar — sticky */}
              <div className="shrink-0">
                <CaptureBar onCapture={handleCapture} />
              </div>

              {/* Feed */}
              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {/* Filter + sort row */}
                <div className="flex items-center gap-2 mb-3">
                  {selectedClusterId && clusterMap[selectedClusterId] && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-0"
                      style={{
                        background: `${clusterMap[selectedClusterId].color}10`,
                        border: `1px solid ${clusterMap[selectedClusterId].color}25`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: clusterMap[selectedClusterId].color,
                        }}
                      />
                      <span className="text-xs font-medium text-white flex-1 truncate">
                        {clusterMap[selectedClusterId].name}
                      </span>
                      <button
                        onClick={() => setSelectedClusterId(null)}
                        className="text-[10px] cursor-pointer"
                        style={{ color: "var(--syn-slate)" }}
                      >
                        Clear filter ×
                      </button>
                    </motion.div>
                  )}

                  {/* Hide-completed toggle (only shown when there are any) */}
                  {completedCount > 0 && (
                    <button
                      onClick={() => setHideCompleted((v) => !v)}
                      aria-pressed={hideCompleted}
                      aria-label={
                        hideCompleted
                          ? `Show ${completedCount} completed`
                          : `Hide ${completedCount} completed`
                      }
                      className={`${
                        selectedClusterId ? "" : "ml-auto"
                      } flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors`}
                      style={{
                        background: hideCompleted
                          ? "rgba(16,185,129,0.12)"
                          : "rgba(255,255,255,0.03)",
                        border: hideCompleted
                          ? "1px solid rgba(16,185,129,0.35)"
                          : "1px solid var(--syn-border)",
                        color: hideCompleted
                          ? "var(--syn-mint)"
                          : "var(--syn-slate)",
                      }}
                    >
                      {hideCompleted ? "Live only" : "Hide completed"}
                      <span className="opacity-60">· {completedCount}</span>
                    </button>
                  )}

                  {/* Sort dropdown (always visible) */}
                  <div
                    className={`relative ${
                      selectedClusterId || completedCount > 0 ? "" : "ml-auto"
                    }`}
                  >
                    <button
                      onClick={() => setSortOpen((v) => !v)}
                      aria-label="Sort captures"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--syn-border)",
                        color: "var(--syn-slate)",
                      }}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      {sortLabels[sortMode]}
                    </button>
                    <AnimatePresence>
                      {sortOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setSortOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1.5 z-40 rounded-lg overflow-hidden shadow-xl"
                            style={{
                              background: "var(--syn-surface-2)",
                              border: "1px solid var(--syn-border)",
                              minWidth: "160px",
                            }}
                          >
                            {(
                              ["newest", "oldest", "cluster"] as SortMode[]
                            ).map((mode) => (
                              <button
                                key={mode}
                                onClick={() => {
                                  setSortMode(mode);
                                  setSortOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs cursor-pointer hover:bg-[rgba(255,255,255,0.04)]"
                                style={{ color: "var(--syn-ash)" }}
                              >
                                <Check
                                  className="w-3 h-3 shrink-0"
                                  style={{
                                    color:
                                      sortMode === mode
                                        ? "var(--syn-indigo)"
                                        : "transparent",
                                  }}
                                />
                                {sortLabels[mode]}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Empty state */}
                {visibleCaptures.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }}
                    >
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: "var(--syn-indigo)" }}
                      />
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--syn-slate)" }}
                    >
                      {searchQuery.trim()
                        ? `No captures match "${searchQuery.trim()}"`
                        : "No captures yet — start typing above"}
                    </p>
                  </div>
                )}

                {/* Capture cards */}
                <AnimatePresence initial={false}>
                  {visibleCaptures.map((capture) => (
                    <CaptureCard
                      key={capture.id}
                      capture={capture}
                      cluster={clusterMap[capture.clusterId]}
                      clusters={clusters}
                      onEdit={handleEditCapture}
                      onDelete={handleDeleteCapture}
                      onMove={handleMoveCapture}
                      onToggleComplete={handleToggleComplete}
                      onRequestNewCluster={() =>
                        handleOpenClusterCreator("topic")
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Map view */
            <div className="flex-1 overflow-hidden">
              <MapView
                clusters={clusters}
                captures={captures}
                onClusterClick={handleClusterAction}
                onCaptureClick={handleCaptureClick}
              />
            </div>
          )}
        </main>

        {/* Action Panel — now an in-flow third column, not an overlay */}
        <ActionPanel
          open={actionPanelOpen}
          cluster={actionPanelCluster}
          captures={captures}
          onClose={() => setActionPanelOpen(false)}
          onAccept={handleAccept}
          onTweak={handleTweak}
        />
      </div>

      {/* ⌘K Command launcher */}
      <CommandLauncher
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onCapture={handleCapture}
        clusterNameFor={(id) => clusterMap[id]?.name}
        clusterColorFor={(id) => clusterMap[id]?.color}
      />

      {/* Cluster creator modal */}
      <ClusterCreator
        open={clusterCreatorOpen}
        defaultCategory={clusterCreatorCategory}
        onClose={() => setClusterCreatorOpen(false)}
        onCreate={handleCreateCluster}
      />

      {/* Capture Inspector (satellite node click in Map view) */}
      <CaptureInspector
        capture={
          inspectedCapture
            ? captures.find((c) => c.id === inspectedCapture.id) ??
              inspectedCapture
            : null
        }
        cluster={
          inspectedCapture ? clusterMap[inspectedCapture.clusterId] : undefined
        }
        onClose={() => setInspectedCapture(null)}
        onOpenCluster={handleOpenClusterFromInspector}
        onToggleComplete={handleToggleComplete}
        onDelete={(id) => {
          handleDeleteCapture(id);
          setInspectedCapture(null);
        }}
      />

      {/* Tweak overlay — editable prompt */}
      <AnimatePresence>
        {actionPanelOpen && tweakMode && actionPanelCluster && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 right-[380px] z-50 rounded-2xl p-4 shadow-2xl"
            style={{
              background: "var(--syn-surface-2)",
              border: "1px solid rgba(99,102,241,0.3)",
              width: "320px",
            }}
          >
            <p
              className="text-[10px] font-mono mb-2"
              style={{ color: "var(--syn-indigo)" }}
            >
              Edit the suggested prompt
            </p>
            <textarea
              defaultValue={actionPanelCluster.nextStep}
              rows={4}
              className="w-full bg-transparent text-sm outline-none resize-none leading-relaxed"
              style={{ color: "var(--syn-dim)" }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setTweakMode(false)}
                className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--syn-slate)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                style={{ background: "var(--syn-indigo)", color: "#fff" }}
              >
                Save & Add Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {acceptedToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.35)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--syn-mint)" }}
            >
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p
              className="text-xs max-w-xs"
              style={{ color: "var(--syn-mint)" }}
            >
              {acceptedToast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
