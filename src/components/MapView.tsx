"use client";

import { useEffect, useRef, useState, useCallback, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  Simulation,
} from "d3-force";
import { Cluster, Capture } from "@/lib/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Type,
  Link2,
  ImageIcon,
  Mic,
  Brain,
  Sparkles,
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
  CheckCircle2,
} from "lucide-react";

/* Icon registry mirrors Sidebar's resolution so canvas-rendered cluster
 * icons match what users see in the sidebar. */
const ICON_BY_NAME: Record<string, typeof Folder> = {
  folder: Folder,
  tag: Tag,
  users: Users,
  calendar: Calendar,
  checksquare: CheckSquare,
  shield: ShieldCheck,
  sparkle: Sparkle,
  bookmark: Bookmark,
  briefcase: Briefcase,
  compass: Compass,
  coffee: Coffee,
  rocket: Rocket,
  flame: Flame,
  lightbulb: Lightbulb,
  music: Music,
  camera: Camera,
  pencil: Pencil,
  target: Target,
  heart: Heart,
  leaf: Leaf,
  star: Star,
};

const BUILTIN_CLUSTER_ICON: Record<string, typeof Folder> = {
  "proj-a": Folder,
  "proj-b": Folder,
  "proj-c": Folder,
  accessibility: ShieldCheck,
  tasks: CheckSquare,
  people: Users,
  meetings: Calendar,
  inspiration: Sparkle,
};

function resolveClusterIcon(cluster: Cluster): typeof Folder {
  if (cluster.icon && ICON_BY_NAME[cluster.icon]) return ICON_BY_NAME[cluster.icon];
  return BUILTIN_CLUSTER_ICON[cluster.id] ?? Tag;
}

const TYPE_ICONS = {
  text: Type,
  link: Link2,
  image: ImageIcon,
  voice: Mic,
};

function captureTitle(c: Capture): string {
  if (c.type === "link" && c.linkTitle) return c.linkTitle;
  return c.content;
}

/* ────────────────────────────────────────────────────── *
 * Types                                                  *
 * ────────────────────────────────────────────────────── */

interface MapViewProps {
  clusters: Cluster[];
  captures: Capture[];
  onClusterClick: (cluster: Cluster) => void;
  onCaptureClick: (capture: Capture) => void;
}

interface SimNode {
  id: string;
  kind: "cluster" | "capture";
  label?: string;
  color: string;
  radius: number;
  clusterId: string;
  /** For capture nodes: whether this capture has been marked complete.
   *  Drawn as a hollow ring instead of a filled dot so the user can still
   *  see it in context but it visually recedes. */
  completed?: boolean;
  /* d3-force will populate these */
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  color: string;
}

/* ────────────────────────────────────────────────────── *
 * Component                                              *
 * ────────────────────────────────────────────────────── */

export function MapView({
  clusters,
  captures,
  onClusterClick,
  onCaptureClick,
}: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const captureByIdRef = useRef<Map<string, Capture>>(new Map());
  const dprRef = useRef(1);
  const sizeRef = useRef({ width: 800, height: 600 });

  /* View transform (pan + zoom) — world coords ↔ screen coords */
  const transformRef = useRef({ x: 0, y: 0, k: 1 });

  /* Interaction state (refs so the render loop sees latest without re-init) */
  const hoverNodeIdRef = useRef<string | null>(null);
  const draggedNodeRef = useRef<SimNode | null>(null);
  const nodeDragRef = useRef<{ startMx: number; startMy: number; moved: boolean }>({
    startMx: 0,
    startMy: 0,
    moved: false,
  });
  const panStateRef = useRef<{
    active: boolean;
    startMx: number;
    startMy: number;
    startTx: number;
    startTy: number;
    moved: boolean;
  }>({
    active: false,
    startMx: 0,
    startMy: 0,
    startTx: 0,
    startTy: 0,
    moved: false,
  });

  const [hoverCluster, setHoverCluster] = useState<Cluster | null>(null);
  const [hoverCapture, setHoverCapture] = useState<Capture | null>(null);
  const [, forceRerender] = useState(0);

  /* DOM ref for the floating node-label tooltip (updated imperatively each frame) */
  const labelRef = useRef<HTMLDivElement>(null);

  /* ── Build nodes & links from props ──────────────── */
  const buildGraph = useCallback(() => {
    const { width, height } = sizeRef.current;
    const cx = width / 2;
    const cy = height / 2;

    // Pre-count clustered captures per cluster so node radius scales with
    // the number of connected thoughts. Bigger cluster = busier cluster.
    const captureCountByCluster = new Map<string, number>();
    for (const cap of captures) {
      if (cap.status !== "clustered") continue;
      captureCountByCluster.set(
        cap.clusterId,
        (captureCountByCluster.get(cap.clusterId) ?? 0) + 1
      );
    }

    const nodes: SimNode[] = clusters.map((c, i) => {
      const angle = (i / clusters.length) * Math.PI * 2;
      const r = Math.min(width, height) * 0.22;
      const count = captureCountByCluster.get(c.id) ?? 0;
      // Base 14, +2.2 per captured thought, capped at 34.
      // count 0 → 14, count 3 → 20.6, count 6 → 27.2, count 9+ → 34.
      const radius = Math.min(34, 14 + count * 2.2);
      return {
        id: c.id,
        kind: "cluster" as const,
        label: c.label,
        color: c.color,
        radius,
        clusterId: c.id,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });

    const captureByIdMap = new Map<string, Capture>();
    const captureNodes: SimNode[] = captures
      .filter((c) => c.status === "clustered")
      .map((c) => {
        captureByIdMap.set(c.id, c);
        const cluster = clusters.find((cl) => cl.id === c.clusterId);
        return {
          id: c.id,
          kind: "capture" as const,
          color: cluster?.color ?? "#64748B",
          radius: 5,
          clusterId: c.clusterId,
          completed: !!c.completedAt,
          x: cx + (Math.random() - 0.5) * 160,
          y: cy + (Math.random() - 0.5) * 160,
        };
      });

    captureByIdRef.current = captureByIdMap;

    const allNodes = [...nodes, ...captureNodes];

    const links: SimLink[] = captureNodes.map((cap) => ({
      source: cap.id,
      target: cap.clusterId,
      color: cap.color,
    }));

    nodesRef.current = allNodes;
    linksRef.current = links;
    return { nodes: allNodes, links };
  }, [clusters, captures]);

  /* ── Initialize simulation ───────────────────────── */
  useEffect(() => {
    const { nodes, links } = buildGraph();
    const { width, height } = sizeRef.current;
    const cx = width / 2;
    const cy = height / 2;

    const sim = forceSimulation<SimNode, SimLink>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((n) => n.id)
          .distance(48)
          .strength(0.8)
      )
      .force("charge", forceManyBody<SimNode>().strength(-65).distanceMax(260))
      .force("center", forceCenter<SimNode>(cx, cy).strength(0.03))
      /* Per-node anchor forces keep the whole graph bounded around centre */
      .force("x", forceX<SimNode>(cx).strength(0.08))
      .force("y", forceY<SimNode>(cy).strength(0.08))
      .force(
        "collide",
        forceCollide<SimNode>().radius((n) => n.radius + 4).strength(0.9)
      )
      .alphaDecay(0.015)
      .velocityDecay(0.42)
      .alphaMin(0.001);

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusters.length, captures.length]);

  /* ── Resize handling (HiDPI) ─────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const sim = simulationRef.current;
      if (sim) {
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        sim.force("center", forceCenter<SimNode>(cx, cy).strength(0.03));
        sim.force("x", forceX<SimNode>(cx).strength(0.08));
        sim.force("y", forceY<SimNode>(cy).strength(0.08));
        sim.alpha(0.4).restart();
      }
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ── Live-sync mutable capture state onto existing SimNodes ──
   * The simulation is only rebuilt when counts change (see the init effect),
   * so in-place edits like toggling completion or moving a capture need to
   * be mirrored onto the nodes directly. */
  useEffect(() => {
    const byId = new Map(captures.map((c) => [c.id, c]));
    for (const n of nodesRef.current) {
      if (n.kind !== "capture") continue;
      const cap = byId.get(n.id);
      if (!cap) continue;
      n.completed = !!cap.completedAt;
      if (cap.clusterId !== n.clusterId) {
        const cluster = clusters.find((cl) => cl.id === cap.clusterId);
        n.clusterId = cap.clusterId;
        if (cluster) n.color = cluster.color;
      }
    }
    captureByIdRef.current = byId;
  }, [captures, clusters]);

  /* ── Rasterize cluster icons to bitmap images ────── *
   * Lucide components can't be drawn directly to canvas. Serialize each
   * cluster's icon to an SVG string once, turn it into an HTMLImageElement,
   * then drawImage at the node centre in the render loop. */
  const iconImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, forceIconRerender] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const cache = iconImagesRef.current;
    for (const cluster of clusters) {
      if (cache.has(cluster.id)) continue;
      const Icon = resolveClusterIcon(cluster);
      const svg = renderToStaticMarkup(
        createElement(Icon, {
          color: "#FFFFFF",
          size: 24,
          strokeWidth: 2.2,
        })
      );
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        cache.set(cluster.id, img);
        URL.revokeObjectURL(url);
        /* Nudge a re-render so the draw loop picks up the new image —
         * the RAF loop reads from the ref anyway, but this ensures the
         * effect runs at least once in case the loop is idle. */
        forceIconRerender((v) => v + 1);
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    }
    return () => {
      cancelled = true;
    };
  }, [clusters]);

  /* ── Wheel zoom (non-passive) ────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const t = transformRef.current;

      const scaleFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newK = Math.max(0.4, Math.min(3.5, t.k * scaleFactor));
      const ratio = newK / t.k;
      /* Keep the point under the cursor fixed while scaling */
      t.x = mx - (mx - t.x) * ratio;
      t.y = my - (my - t.y) * ratio;
      t.k = newK;
      forceRerender((v) => v + 1); /* so the zoom indicator updates */
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  /* ── Render loop ─────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const draw = () => {
      const { width, height } = sizeRef.current;
      const dpr = dprRef.current;
      const t = transformRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      /* Apply view transform (pan + zoom) */
      ctx.translate(t.x, t.y);
      ctx.scale(t.k, t.k);

      const hoverId = hoverNodeIdRef.current;
      const nodes = nodesRef.current;
      const links = linksRef.current;

      const connectedIds = new Set<string>();
      if (hoverId) {
        connectedIds.add(hoverId);
        for (const l of links) {
          const sId = typeof l.source === "string" ? l.source : l.source.id;
          const tId = typeof l.target === "string" ? l.target : l.target.id;
          if (sId === hoverId) connectedIds.add(tId);
          if (tId === hoverId) connectedIds.add(sId);
        }
      }

      /* ── Draw links ── */
      ctx.lineCap = "round";
      for (const l of links) {
        const s = typeof l.source === "string" ? null : l.source;
        const tg = typeof l.target === "string" ? null : l.target;
        if (!s || !tg || s.x == null || s.y == null || tg.x == null || tg.y == null) continue;

        const sId = s.id;
        const tId = tg.id;
        const isConnected = hoverId !== null && (sId === hoverId || tId === hoverId);

        if (hoverId && !isConnected) {
          ctx.strokeStyle = "rgba(255,255,255,0.04)";
          ctx.lineWidth = 0.5 / t.k;
        } else if (isConnected) {
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 1.5 / t.k;
        } else {
          ctx.strokeStyle = `${l.color}55`;
          ctx.lineWidth = 0.8 / t.k;
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tg.x, tg.y);
        ctx.stroke();
      }

      /* ── Draw nodes ── */
      const iconImages = iconImagesRef.current;
      for (const n of nodes) {
        if (n.x == null || n.y == null) continue;

        const isHover = n.id === hoverId;
        const isConnected = hoverId ? connectedIds.has(n.id) : true;
        const dimmed = hoverId !== null && !isConnected;
        const isCompletedCapture = n.kind === "capture" && n.completed;

        const baseRadius = n.radius;
        const radius = isHover ? baseRadius + 4 : baseRadius;

        /* Outer glow on cluster nodes */
        if (n.kind === "cluster" && !dimmed) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 14, 0, Math.PI * 2);
          ctx.fillStyle = isHover ? `${n.color}1F` : `${n.color}10`;
          ctx.fill();
        }

        /* Main circle — completed captures render as hollow rings */
        if (isCompletedCapture && !isHover) {
          /* Faint fill to keep it visible over dark canvas */
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = dimmed ? "rgba(100,100,100,0.08)" : `${n.color}18`;
          ctx.fill();
          ctx.lineWidth = 1.5 / t.k;
          ctx.strokeStyle = dimmed ? "rgba(100,100,100,0.4)" : `${n.color}99`;
          ctx.stroke();
          /* Tiny check mark inside */
          ctx.lineWidth = 1.1 / t.k;
          ctx.strokeStyle = dimmed ? "rgba(255,255,255,0.3)" : `${n.color}CC`;
          ctx.beginPath();
          const cr = radius * 0.45;
          ctx.moveTo(n.x - cr, n.y);
          ctx.lineTo(n.x - cr * 0.2, n.y + cr * 0.7);
          ctx.lineTo(n.x + cr, n.y - cr * 0.55);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
          if (isHover) {
            ctx.fillStyle = "#FFFFFF";
          } else if (dimmed) {
            ctx.fillStyle =
              n.kind === "cluster" ? "rgba(100,100,100,0.3)" : "rgba(100,100,100,0.2)";
          } else if (n.kind === "cluster") {
            ctx.fillStyle = `${n.color}D9`;
          } else {
            ctx.fillStyle = `${n.color}AA`;
          }
          ctx.fill();

          if (n.kind === "cluster") {
            ctx.lineWidth = (isHover ? 2 : 1.5) / t.k;
            ctx.strokeStyle = isHover ? "#FFFFFF" : `${n.color}AA`;
            ctx.stroke();
          } else if (isHover) {
            ctx.lineWidth = 1.2 / t.k;
            ctx.strokeStyle = "#FFFFFF";
            ctx.stroke();
          }
        }

        /* Rasterized icon on cluster nodes. The icon is pre-rendered white,
         * which reads well on the tinted cluster fill. On hover the fill
         * flips to white (white-on-white would vanish) so we skip the icon
         * there — the hover state is already distinct from the glow and
         * size bump. */
        if (n.kind === "cluster" && !isHover) {
          const img = iconImages.get(n.id);
          if (img && img.complete && img.naturalWidth > 0) {
            const iconSize = Math.max(12, radius * 0.9);
            const half = iconSize / 2;
            ctx.save();
            ctx.globalAlpha = dimmed ? 0.4 : 0.95;
            ctx.drawImage(img, n.x - half, n.y - half, iconSize, iconSize);
            ctx.restore();
          }
        }

        if (n.kind === "cluster" && n.label) {
          const fontSize = 11 / t.k;
          ctx.font = `500 ${fontSize}px var(--font-geist-sans), system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          if (dimmed) ctx.fillStyle = "rgba(255,255,255,0.18)";
          else if (isHover) ctx.fillStyle = "#FFFFFF";
          else ctx.fillStyle = "rgba(255,255,255,0.65)";
          ctx.fillText(n.label, n.x, n.y + radius + 8 / t.k);
        }
      }

      ctx.restore();

      /* Position the floating label over the hovered capture node */
      const label = labelRef.current;
      if (label) {
        const hoveredNode =
          hoverId != null ? nodes.find((n) => n.id === hoverId) : null;
        if (
          hoveredNode &&
          hoveredNode.kind === "capture" &&
          hoveredNode.x != null &&
          hoveredNode.y != null
        ) {
          const sx = hoveredNode.x * t.k + t.x;
          const sy = hoveredNode.y * t.k + t.y;
          const offset = hoveredNode.radius * t.k + 10;
          label.style.transform = `translate(${sx}px, ${sy - offset}px) translate(-50%, -100%)`;
          label.style.opacity = "1";
        } else {
          label.style.opacity = "0";
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Keep the sim gently alive so it drifts organically ── */
  useEffect(() => {
    const sim = simulationRef.current;
    if (!sim) return;
    const interval = setInterval(() => {
      if (sim.alpha() < 0.04) sim.alpha(0.06).restart();
    }, 2000);
    return () => clearInterval(interval);
  });

  /* ── Coordinate conversion ───────────────────────── */
  const screenToWorld = useCallback((mx: number, my: number) => {
    const t = transformRef.current;
    return { x: (mx - t.x) / t.k, y: (my - t.y) / t.k };
  }, []);

  /* ── Hit test (in world coords) ──────────────────── */
  const findNodeAt = useCallback(
    (mx: number, my: number, padding = 10) => {
      const t = transformRef.current;
      const world = screenToWorld(mx, my);
      const scaledPadding = padding / t.k;
      const nodes = nodesRef.current;
      /* Iterate reversed so cluster nodes (drawn later) win hit priority */
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n.x == null || n.y == null) continue;
        const dx = world.x - n.x;
        const dy = world.y - n.y;
        const r = n.radius + scaledPadding;
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    },
    [screenToWorld]
  );

  /* ── Pointer handlers ────────────────────────────── */
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    /* Dragging a node */
    if (draggedNodeRef.current) {
      const n = draggedNodeRef.current;
      const d = nodeDragRef.current;
      if (!d.moved && Math.abs(mx - d.startMx) + Math.abs(my - d.startMy) > 3) {
        d.moved = true;
      }
      const world = screenToWorld(mx, my);
      n.fx = world.x;
      n.fy = world.y;
      simulationRef.current?.alphaTarget(0.3).restart();
      canvas.style.cursor = "grabbing";
      return;
    }

    /* Panning canvas */
    if (panStateRef.current.active) {
      const p = panStateRef.current;
      const dx = mx - p.startMx;
      const dy = my - p.startMy;
      if (Math.abs(dx) + Math.abs(dy) > 3) p.moved = true;
      const t = transformRef.current;
      t.x = p.startTx + dx;
      t.y = p.startTy + dy;
      canvas.style.cursor = "grabbing";
      return;
    }

    /* Hover */
    const hit = findNodeAt(mx, my);
    const newId = hit?.id ?? null;
    if (newId !== hoverNodeIdRef.current) {
      hoverNodeIdRef.current = newId;
      if (hit && hit.kind === "cluster") {
        setHoverCluster(clusters.find((c) => c.id === hit.id) ?? null);
        setHoverCapture(null);
      } else if (hit && hit.kind === "capture") {
        setHoverCluster(null);
        setHoverCapture(captureByIdRef.current.get(hit.id) ?? null);
      } else {
        setHoverCluster(null);
        setHoverCapture(null);
      }
    }
    canvas.style.cursor = hit ? "pointer" : "grab";
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = findNodeAt(mx, my);

    if (hit) {
      /* Drag node */
      const world = screenToWorld(mx, my);
      hit.fx = world.x;
      hit.fy = world.y;
      draggedNodeRef.current = hit;
      nodeDragRef.current = { startMx: mx, startMy: my, moved: false };
      simulationRef.current?.alphaTarget(0.3).restart();
      canvas.style.cursor = "grabbing";
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    } else {
      /* Pan canvas */
      const t = transformRef.current;
      panStateRef.current = {
        active: true,
        startMx: mx,
        startMy: my,
        startTx: t.x,
        startTy: t.y,
        moved: false,
      };
      canvas.style.cursor = "grabbing";
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;

    if (draggedNodeRef.current) {
      const n = draggedNodeRef.current;
      n.fx = null;
      n.fy = null;
      simulationRef.current?.alphaTarget(0);
      draggedNodeRef.current = null;
    }

    panStateRef.current.active = false;

    if (canvas) {
      canvas.style.cursor = hoverNodeIdRef.current ? "pointer" : "grab";
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    /* Don't treat a pan-release as a click */
    if (panStateRef.current.moved) {
      panStateRef.current.moved = false;
      return;
    }
    /* Don't treat a node-drag release as a click either */
    if (nodeDragRef.current.moved) {
      nodeDragRef.current.moved = false;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = findNodeAt(mx, my);
    if (!hit) return;

    if (hit.kind === "cluster") {
      const cluster = clusters.find((c) => c.id === hit.id);
      if (cluster) onClusterClick(cluster);
    } else {
      const capture = captureByIdRef.current.get(hit.id);
      if (capture) onCaptureClick(capture);
    }
  };

  /* ── Zoom button helpers ─────────────────────────── */
  const zoomBy = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = rect.width / 2;
    const my = rect.height / 2;
    const t = transformRef.current;
    const newK = Math.max(0.4, Math.min(3.5, t.k * factor));
    const ratio = newK / t.k;
    t.x = mx - (mx - t.x) * ratio;
    t.y = my - (my - t.y) * ratio;
    t.k = newK;
    forceRerender((v) => v + 1);
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
    simulationRef.current?.alpha(0.5).restart();
    forceRerender((v) => v + 1);
  };

  const zoomPct = Math.round(transformRef.current.k * 100);

  /* ────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="w-full h-full map-bg overflow-hidden relative select-none"
    >
      {/* Legend */}
      <div
        className="absolute top-4 left-4 z-10 rounded-xl px-4 py-3 flex flex-col gap-2 pointer-events-none"
        style={{
          background: "rgba(10,10,10,0.85)",
          border: "1px solid var(--syn-border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p
          className="text-[10px] font-mono uppercase tracking-widest mb-1"
          style={{ color: "var(--syn-slate)" }}
        >
          Legend
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.15)", border: "1.5px solid #6366F1" }}
          />
          <span className="text-xs" style={{ color: "var(--syn-ash)" }}>
            Project / Topic cluster
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-0.5"
            style={{ background: "var(--syn-slate)" }}
          />
          <span className="text-xs" style={{ color: "var(--syn-ash)" }}>
            Captured thought
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" style={{ color: "var(--syn-mint)" }} />
          </span>
          <span className="text-xs" style={{ color: "var(--syn-ash)" }}>
            Completed (hollow)
          </span>
        </div>
        <p className="text-[10px] mt-1" style={{ color: "var(--syn-slate)" }}>
          Scroll to zoom · Drag empty space to pan · Click any node
        </p>
      </div>

      {/* Floating label near hovered capture node */}
      <div
        ref={labelRef}
        className="absolute top-0 left-0 z-20 pointer-events-none whitespace-nowrap max-w-[280px] overflow-hidden text-ellipsis rounded-md px-2 py-1 text-[11px] leading-tight transition-opacity duration-150"
        style={{
          opacity: 0,
          background: "rgba(10,10,10,0.95)",
          border: "1px solid var(--syn-border)",
          color: "var(--syn-dim)",
          backdropFilter: "blur(6px)",
          willChange: "transform",
        }}
      >
        {hoverCapture ? captureTitle(hoverCapture).slice(0, 80) : ""}
      </div>

      {/* Hover info card — cluster (detailed) */}
      {hoverCluster &&
        (() => {
          const clusterCaptures = captures.filter(
            (c) => c.clusterId === hoverCluster.id && c.status === "clustered"
          );
          const preview = clusterCaptures.slice(0, 4);
          return (
            <div
              className="absolute top-4 right-4 z-10 rounded-xl w-[300px] pointer-events-none overflow-hidden flex flex-col"
              style={{
                background: "rgba(10,10,10,0.94)",
                border: `1px solid ${hoverCluster.color}55`,
                backdropFilter: "blur(10px)",
                maxHeight: "calc(100% - 32px)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: `1px solid ${hoverCluster.color}22` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: hoverCluster.color }}
                  />
                  <p className="text-sm font-semibold text-white">
                    {hoverCluster.name}
                  </p>
                  <span
                    className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${hoverCluster.color}18`,
                      color: hoverCluster.color,
                      border: `1px solid ${hoverCluster.color}30`,
                    }}
                  >
                    {clusterCaptures.length} {clusterCaptures.length === 1 ? "thought" : "thoughts"}
                  </span>
                </div>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "var(--syn-ash)" }}
                >
                  {hoverCluster.description}
                </p>
              </div>

              <div className="overflow-y-auto flex flex-col gap-4 px-4 py-3">
                {/* Synthesis */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="w-3 h-3" style={{ color: "var(--syn-indigo)" }} />
                    <span
                      className="text-[9px] font-mono font-semibold uppercase tracking-wider"
                      style={{ color: "var(--syn-indigo)" }}
                    >
                      Synthesis
                    </span>
                  </div>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: "var(--syn-dim)" }}
                  >
                    {hoverCluster.synthesis}
                  </p>
                </div>

                {/* Included captures */}
                {preview.length > 0 && (
                  <div>
                    <p
                      className="text-[9px] font-mono uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--syn-slate)" }}
                    >
                      What&apos;s inside
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {preview.map((c) => {
                        const Icon = TYPE_ICONS[c.type] ?? Type;
                        return (
                          <div
                            key={c.id}
                            className="flex items-start gap-2 px-2 py-1.5 rounded-md"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--syn-border-subtle)",
                            }}
                          >
                            <Icon
                              className="w-3 h-3 mt-0.5 shrink-0"
                              style={{ color: "var(--syn-slate)" }}
                            />
                            <p
                              className="text-[11px] leading-snug line-clamp-2"
                              style={{ color: "var(--syn-dim)" }}
                            >
                              {captureTitle(c)}
                            </p>
                          </div>
                        );
                      })}
                      {clusterCaptures.length > preview.length && (
                        <p
                          className="text-[10px] font-mono mt-0.5"
                          style={{ color: "var(--syn-slate)" }}
                        >
                          +{clusterCaptures.length - preview.length} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Next step teaser */}
                <div
                  className="rounded-lg px-3 py-2.5"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.18)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles
                      className="w-3 h-3"
                      style={{ color: "var(--syn-mint)" }}
                    />
                    <span
                      className="text-[9px] font-mono font-semibold uppercase tracking-wider"
                      style={{ color: "var(--syn-mint)" }}
                    >
                      Next step
                    </span>
                  </div>
                  <p
                    className="text-[11px] leading-relaxed text-white"
                  >
                    {hoverCluster.nextStep}
                  </p>
                </div>

                <p
                  className="text-[9px] font-mono text-center mt-1"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Click to open cluster →
                </p>
              </div>
            </div>
          );
        })()}

      {/* Hover info card — capture */}
      {hoverCapture &&
        (() => {
          const cluster = clusters.find((c) => c.id === hoverCapture.clusterId);
          const Icon = TYPE_ICONS[hoverCapture.type] ?? Type;
          return (
            <div
              className="absolute top-4 right-4 z-10 rounded-xl w-[300px] pointer-events-none overflow-hidden flex flex-col"
              style={{
                background: "rgba(10,10,10,0.94)",
                border: `1px solid ${cluster?.color ?? "var(--syn-slate)"}55`,
                backdropFilter: "blur(10px)",
                maxHeight: "calc(100% - 32px)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--syn-border)" }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--syn-border)",
                  }}
                >
                  <Icon className="w-3 h-3" style={{ color: "var(--syn-ash)" }} />
                </div>
                <p className="text-xs font-semibold text-white">Captured thought</p>
                {cluster && (
                  <span
                    className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${cluster.color}18`,
                      color: cluster.color,
                      border: `1px solid ${cluster.color}30`,
                    }}
                  >
                    {cluster.label}
                  </span>
                )}
              </div>

              <div className="overflow-y-auto flex flex-col gap-3 px-4 py-3">
                {/* Content */}
                {hoverCapture.type === "image" && hoverCapture.imagePreview ? (
                  <div>
                    <img
                      src={hoverCapture.imagePreview}
                      alt="capture"
                      className="w-full max-h-32 object-cover rounded-md"
                      style={{ border: "1px solid var(--syn-border)" }}
                    />
                    <p
                      className="text-[11px] mt-1.5 leading-relaxed"
                      style={{ color: "var(--syn-dim)" }}
                    >
                      {hoverCapture.content}
                    </p>
                  </div>
                ) : hoverCapture.type === "link" && hoverCapture.linkTitle ? (
                  <div>
                    <p
                      className="text-xs font-medium leading-snug text-white"
                    >
                      {hoverCapture.linkTitle}
                    </p>
                    <p
                      className="text-[10px] font-mono mt-1"
                      style={{ color: "var(--syn-slate)" }}
                    >
                      {hoverCapture.linkDomain}
                    </p>
                  </div>
                ) : (
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--syn-dim)" }}
                  >
                    {hoverCapture.content}
                  </p>
                )}

                {/* Why */}
                <div
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.18)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Brain
                      className="w-3 h-3"
                      style={{ color: "var(--syn-indigo)" }}
                    />
                    <span
                      className="text-[9px] font-mono font-semibold uppercase tracking-wider"
                      style={{ color: "var(--syn-indigo)" }}
                    >
                      Why here
                    </span>
                  </div>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: "var(--syn-ash)" }}
                  >
                    {hoverCapture.inferenceReason}
                  </p>
                </div>

                <p
                  className="text-[9px] font-mono text-center mt-0.5"
                  style={{ color: "var(--syn-slate)" }}
                >
                  Click to expand →
                </p>
              </div>
            </div>
          );
        })()}

      {/* Zoom controls */}
      <div
        className="absolute bottom-4 right-4 z-10 flex flex-col rounded-xl overflow-hidden"
        style={{
          background: "rgba(10,10,10,0.9)",
          border: "1px solid var(--syn-border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          onClick={() => zoomBy(1.25)}
          aria-label="Zoom in"
          className="w-9 h-9 flex items-center justify-center transition-colors cursor-pointer hover:bg-white/5"
          style={{ color: "var(--syn-ash)" }}
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-px" style={{ background: "var(--syn-border)" }} />
        <div
          className="w-9 h-7 flex items-center justify-center text-[10px] font-mono"
          style={{ color: "var(--syn-slate)" }}
        >
          {zoomPct}%
        </div>
        <div className="h-px" style={{ background: "var(--syn-border)" }} />
        <button
          onClick={() => zoomBy(1 / 1.25)}
          aria-label="Zoom out"
          className="w-9 h-9 flex items-center justify-center transition-colors cursor-pointer hover:bg-white/5"
          style={{ color: "var(--syn-ash)" }}
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px" style={{ background: "var(--syn-border)" }} />
        <button
          onClick={resetView}
          aria-label="Reset map view"
          className="w-9 h-9 flex items-center justify-center transition-colors cursor-pointer hover:bg-white/5"
          style={{ color: "var(--syn-ash)" }}
          title="Reset view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        role="application"
        aria-label={`Interactive thought map with ${clusters.length} clusters and ${captures.length} captures. Click clusters to open the action panel, click captures to inspect. Scroll to zoom, drag empty space to pan.`}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        style={{ display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "grab" }}
      />
    </div>
  );
}
