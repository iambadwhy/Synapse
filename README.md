# Synapse

**Your scattered thoughts, automatically mapped.**

A working prototype for a multimodal thought-capture system that auto-clusters fragments into projects and topics, explains *why* each fragment landed where it did, and turns the cluster into a single next action.


---

## Live demo

- **Deployed:** [synapse-ecru-tau.vercel.app](https://synapse-ecru-tau.vercel.app)
- **Source:** [github.com/iambadwhy/Synapse](https://github.com/iambadwhy/Synapse)
- **Local:** `npm install && npm run dev` → http://localhost:3000

> Hit the **▶ Demo** button in the top bar to watch three captures auto-route
> end-to-end, or press **⌘K / Ctrl+K** anywhere for the quick-capture launcher.

---

## The problem

Knowledge workers collect thoughts across five tools a day — Apple Notes, Slack DMs to self, screenshots, voice memos on a run, browser tabs left open for three weeks. The ideas are there. The *connections* are not. By the time you revisit, the context has evaporated, and nothing has moved from "captured" to "done."

Existing solutions pick one of two bad defaults:
- **Manual systems** (Notion, Obsidian) demand you file everything perfectly at capture time. Nobody does.
- **Raw chronological streams** (Apple Notes, chat-to-self) capture everything and organize nothing. Search is a shrug.

Both fail at the moment that matters most: the moment between "I had an idea" and "I did something with it."

## The product thesis

> Capture should be free. Organization should be automatic. The transition from insight to action should be one click — and legible.

Three non-negotiables follow from that:

1. **Friction-free capture.** Any modality — text, link, image, voice — on the same bar. No picking folders. No tagging.
2. **Automatic, explainable routing.** Every fragment is clustered the moment it lands, and the reason is inspectable. No black box.
3. **Cluster → commitment.** Each cluster rolls up into a synthesis and one suggested next step the user can Accept, Tweak, or ignore.

## What's in the prototype

Two linked views over the same underlying data.

### Stream view
- **Capture bar** with four modes: text, link (with favicon + domain preview), image (drag-drop or picker), voice (record → transcribe → edit flow).
- **Inline routing animation.** Captures enter with a shimmer + "Clustering…" state, then settle into their cluster with a colored badge and a soft pulse on the sidebar destination.
- **Per-capture "Why?" tooltip** exposing the inference reason — e.g., "People entity (@mayakmakes) + collaboration intent → People."
- **Filterable sidebar** split between Projects (auto-detected) and Topics (system-defined).

### Map view
- **Force-directed canvas** (d3-force + HTML canvas, not SVG) rendering clusters as large glowing nodes and captures as orbiting satellites connected by colored edges.
- **Hover affordances**: each hovered node gets a floating label; a detailed right-side panel shows cluster synthesis + inside-thoughts list + suggested next step, or for a captured thought, the type, content, cluster chip, and "why here" reasoning.
- **Direct manipulation**: drag nodes to reposition, scroll to zoom (cursor-anchored), drag empty space to pan, plus stacked zoom controls with a reset.
- **Organic motion**: the simulation stays gently alive — the map feels like something you're *watching think*, not a static diagram.

### Action panel (shared across views)
Click any cluster to open a slide-in with:
- Cluster synthesis (AI-style summary of what the fragments are saying together)
- Recent captures preview
- A **Suggested Next Step** — not a summary, an instruction. "Finalize the moodboard by EOD Friday. Block 2h now."
- **Accept** (ships to Tasks with a confirmation toast) or **Tweak** (edit the prompt inline).

### Capture inspector
Click any satellite on the Map (or a capture in the stream) to expand its full context in the same right-side pattern: content, routing chip, why-here reasoning, tags, and a one-click jump to the parent cluster.

## Design decisions worth calling out

- **Force-graph as a *second* view, not the first.** The force graph is the hero shot — but it's also unusable as a daily capture surface. The Stream view is the primary workhorse; the Map view is the once-a-day "what's my brain doing" glance. This is the opposite of what most graph-native tools get wrong.
- **Canvas, not DOM, for the map.** Renders 40+ animated nodes at 60fps with zero React reconciliation cost per frame. All interaction (hit testing, hover, drag) is implemented in world coordinates against the transformed canvas.
- **Transparency over trust-me.** Every auto-decision is paired with an affordance to inspect the reasoning. The "Why?" tooltip is small, optional, and always there.
- **Action, not archive.** A cluster without a next step is a pile. The "Suggested Next Step" is what separates Synapse from a second-brain.
- **Constrained, not exhaustive.** Seven seeded clusters. No tag picker. No folders. The point is to make the user *trust the system to decide* — adding knobs undermines that.

## Brand system

- **Name:** Synapse. The instant a thought connects to something.
- **Logo mark:** An **"S" curling around a sheet of paper**, with the letter form drawn entirely in *negative space* — the paper and the S are the same gesture, just foreground and ground swapped. A small four-pointed spark sits above the fold, marking the moment the thought connects. Blue-to-indigo gradient (`#0055FF → #4581F8`) on black, to read as *signal*, not decoration. The negative-space construction is the whole idea: capture (the page) and connection (the S) aren't two things — they're the same thing seen from different sides.
- **Palette** (CSS custom properties in `src/app/globals.css`):
  - `--syn-bg`: `#0A0A0A` — near-black, reduces eye strain for long capture sessions.
  - `--syn-indigo`: `#6366F1` — system / AI / inference color.
  - `--syn-mint`: `#10B981` — actions / confirmations / "ship it."
  - `--syn-slate`, `--syn-ash`, `--syn-dim` — the three-tier text hierarchy.
- **Type:** Geist Sans for UI, Geist Mono for timestamps / taxonomy labels (reinforces the "system is reasoning" feel).
- **Motion:** framer-motion throughout, with spring physics on the right-side panels and layout-animations on the feed. d3-force for the Map. Nothing is fully still — the product should feel like it's thinking.
- **Voice:** terse, second-person, verb-led. "Open People." "Finalize the moodboard." Never "Would you like to…"

## GTM sketch

**Positioning:** *Apple Notes for people who actually do something with their notes.*

**Target user (initial wedge):** solo creators and researchers who live across 3+ tools — the "I have 40 tabs open and 12 unread Slacks to myself" profile. Not teams. Not enterprises. Individuals whose capture-to-action ratio is currently broken.

**Launch channels:**
1. **TikTok / Reels.** Screen-capture of the Map view clustering a week's thoughts in real time, over voiceover: "I didn't organize any of this. It just knew." 15s, one take, no captions, loud.
2. **Substack / essay launch.** Long-form on *"Why every note-taking app has the same flaw"* with the prototype embedded. Distribute to /r/productivity, HN, design Discord servers.
3. **Referral waitlist** with position-jumping for shares — the classic Superhuman/Arc move. Only opens to users whose referral count clears a threshold, which also signals the product thesis (people who evangelize tools *are* the wedge).

**Metrics that matter:**
- **Capture latency**: time from hotkey to text submitted. Target < 2s.
- **Why-open rate**: fraction of captures whose "Why?" tooltip gets opened. High = system is earning trust. Low over time = trust is established or routing is bad.
- **Accept rate on Suggested Next Steps**: the one north-star. If this isn't > 25%, the product has no wedge.
- **Weekly active Map views per user**: proxy for the "weekly review" ritual the product is trying to create.

## Tech notes

- **Framework:** Next.js 16 (App Router, Turbopack dev), React 19.
- **Styling:** Tailwind CSS v4 with custom design tokens, shadcn/ui for tooltip primitives (base-ui under the hood).
- **Graph:** d3-force driving an HTML canvas render loop at native DPR with custom pan/zoom transforms and world-space hit testing.
- **Animation:** framer-motion 12 for panel and layout animations.
- **State:** plain React hooks in `src/app/page.tsx`. No store library — the state surface is small enough that colocating it in one file is the cheapest option. In production this would move behind a single `useSyncExternalStore` or Zustand slice.
- **What's mocked:** the clustering itself. `src/lib/data.ts` contains a regex router (`inferCluster`) and a template reason generator (`getInferenceReason`). In production this is an LLM call per capture; the cost model is trivial (~100 tokens in, ~50 tokens out per capture). Seeded clusters, synthesis strings, and next-step prompts are hand-written — in production they are LLM-generated per cluster state on a debounce.

## Scope discipline — what I explicitly cut

- **Cross-device sync.** A design prototype is not a sync engine.
- **Real STT / image OCR.** The voice and image flows have full UI but mock the model output — the design question is the interaction, not the model.
- **Auth, settings, multi-user.** Not what the brief is asking.
- **An onboarding flow.** The prototype presents a mid-state workspace on purpose; empty-state onboarding is a different design problem.

## Running locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Structure

```
src/
├── app/
│   ├── page.tsx             # State hub (captures, view toggle, inspector, action panel)
│   ├── layout.tsx           # Tooltip provider, fonts
│   └── globals.css          # Design tokens, shimmer / pulse / wave animations
├── components/
│   ├── SynapseLogo.tsx      # Brand mark — S-around-a-page in negative space
│   ├── TopNav.tsx           # Logo + search + Stream/Map toggle
│   ├── Sidebar.tsx          # Filterable Projects + Topics, user-creatable
│   ├── CaptureBar.tsx       # Text / Link / Image / Voice inputs with focus glow
│   ├── CaptureCard.tsx      # Feed card — routing, Why popover, complete/edit/move menu
│   ├── MapView.tsx          # d3-force canvas with pan/zoom, rasterized cluster icons, hollow-ring completed captures
│   ├── ActionPanel.tsx      # Right slide-in: synthesis + next step + Accept/Tweak
│   ├── CaptureInspector.tsx # Right slide-in: single-thought detail + complete/delete
│   ├── ClusterCreator.tsx   # Modal for user-created topics / projects
│   └── CommandLauncher.tsx  # ⌘K quick-capture overlay
└── lib/
    ├── types.ts
    └── data.ts              # Seeded clusters, captures, inferCluster(), getInferenceReason()
```

---

Built by Ambady Ravi.
