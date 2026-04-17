"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Capture, Cluster, CaptureType } from "@/lib/types";
import {
  CLUSTERS,
  INITIAL_CAPTURES,
  CLUSTER_ORDER,
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
import { MapView } from "@/components/MapView";
import { Sparkles } from "lucide-react";

let idCounter = 100;
function nextId() {
  return `c${++idCounter}`;
}

export default function Home() {
  const [view, setView] = useState<"feed" | "map">("feed");
  const [captures, setCaptures] = useState<Capture[]>(INITIAL_CAPTURES);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [recentlyRoutedClusterId, setRecentlyRoutedClusterId] = useState<string | null>(null);

  // Action panel
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [actionPanelCluster, setActionPanelCluster] = useState<Cluster | null>(null);

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
        // Highlight the cluster in sidebar
        setRecentlyRoutedClusterId(clusterId);
        setTimeout(() => setRecentlyRoutedClusterId(null), 2000);
      }, 1800);
    },
    []
  );

  // ── Cluster interactions ───────────────────────────
  const handleClusterAction = useCallback((cluster: Cluster) => {
    setActionPanelCluster(cluster);
    setActionPanelOpen(true);
    setTweakMode(false);
  }, []);

  const handleCaptureClick = useCallback((capture: Capture) => {
    setInspectedCapture(capture);
  }, []);

  const handleOpenClusterFromInspector = useCallback((cluster: Cluster) => {
    setInspectedCapture(null);
    setActionPanelCluster(cluster);
    setActionPanelOpen(true);
    setTweakMode(false);
  }, []);

  const handleAccept = useCallback(() => {
    if (!actionPanelCluster) return;
    setActionPanelOpen(false);

    const msg = `Task added: ${actionPanelCluster.nextStep.slice(0, 60)}…`;
    setAcceptedToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setAcceptedToast(null), 3500);
  }, [actionPanelCluster]);

  const handleTweak = useCallback(() => {
    setTweakMode((v) => !v);
  }, []);

  // ── Demo mode: fire 3 staggered captures through the real pipeline ──
  const handleRunDemo = useCallback(() => {
    if (demoRunning) return;
    setDemoRunning(true);
    // Clear any stale timers from a previous run.
    demoTimersRef.current.forEach((t) => clearTimeout(t));
    demoTimersRef.current = [];

    // Three captures that route to three distinct clusters (accessibility,
    // Thesis, Channel) so the auto-routing animation is legible end-to-end.
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

    // Unlock the button once the last capture has finished animating in
    // (delay + the 1.8s processing-to-clustered transition in handleCapture).
    const unlock = setTimeout(() => {
      setDemoRunning(false);
      demoTimersRef.current = [];
    }, 4400 + 2000);
    demoTimersRef.current.push(unlock);
  }, [demoRunning, handleCapture]);

  // ── Filtered captures for the feed ────────────────
  const visibleCaptures = selectedClusterId
    ? captures.filter((c) => c.clusterId === selectedClusterId)
    : captures;

  const clusterMap = Object.fromEntries(CLUSTERS.map((c) => [c.id, c]));

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--syn-bg)" }}>
      <TopNav
        view={view}
        onViewChange={setView}
        onRunDemo={handleRunDemo}
        demoRunning={demoRunning}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          clusters={CLUSTERS}
          captures={captures}
          selectedClusterId={selectedClusterId}
          recentlyRoutedClusterId={recentlyRoutedClusterId}
          onClusterSelect={setSelectedClusterId}
          onClusterAction={handleClusterAction}
        />

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {view === "feed" ? (
            <>
              {/* Capture bar — sticky */}
              <div className="shrink-0">
                <CaptureBar onCapture={handleCapture} />
              </div>

              {/* Feed */}
              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {/* Filter banner */}
                {selectedClusterId && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                    style={{
                      background: `${clusterMap[selectedClusterId]?.color}10`,
                      border: `1px solid ${clusterMap[selectedClusterId]?.color}25`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: clusterMap[selectedClusterId]?.color }}
                    />
                    <span className="text-xs font-medium text-white flex-1">
                      {clusterMap[selectedClusterId]?.name}
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

                {/* Empty state */}
                {visibleCaptures.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: "var(--syn-indigo)" }} />
                    </div>
                    <p className="text-sm" style={{ color: "var(--syn-slate)" }}>
                      No captures yet — start typing above
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
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Map view */
            <div className="flex-1 overflow-hidden">
              <MapView
                clusters={CLUSTERS}
                captures={captures}
                onClusterClick={handleClusterAction}
                onCaptureClick={handleCaptureClick}
              />
            </div>
          )}
        </main>
      </div>

      {/* Action Panel */}
      <ActionPanel
        open={actionPanelOpen}
        cluster={actionPanelCluster}
        captures={captures}
        onClose={() => setActionPanelOpen(false)}
        onAccept={handleAccept}
        onTweak={handleTweak}
      />

      {/* ⌘K Command launcher */}
      <CommandLauncher
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onCapture={handleCapture}
        clusterNameFor={(id) => clusterMap[id]?.name}
        clusterColorFor={(id) => clusterMap[id]?.color}
      />

      {/* Capture Inspector (satellite node click in Map view) */}
      <CaptureInspector
        capture={inspectedCapture}
        cluster={
          inspectedCapture ? clusterMap[inspectedCapture.clusterId] : undefined
        }
        onClose={() => setInspectedCapture(null)}
        onOpenCluster={handleOpenClusterFromInspector}
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
            <p className="text-[10px] font-mono mb-2" style={{ color: "var(--syn-indigo)" }}>
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
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--syn-slate)" }}
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
                <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="text-xs max-w-xs" style={{ color: "var(--syn-mint)" }}>
              {acceptedToast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
