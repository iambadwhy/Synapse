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

## Process write-up

Short answers — edit for voice.

### Three most important trade-offs

1. **Real LLM routing → regex + template reasons.** Every capture calls `inferCluster()` (pattern matching) and `getInferenceReason()` (templated strings) instead of a live model. The design question is *how does it feel when the system decides for you and explains itself* — that reads identically whether the decider is GPT-4 or a regex. Swapping in an LLM is a day's work behind the same interface. Burning 10 of 48 hours on prompt engineering would have starved the interaction.
2. **Cross-capture edges in the Map → strictly capture→cluster edges.** The wedge is "clusters are the organizing unit, and every cluster rolls up into one next action." Adding satellite-to-satellite links would have turned the Map into a generic knowledge graph (Obsidian, Roam) and blurred that thesis. Related-thoughts surfaces can live inside the inspector; they don't belong on the canvas.
3. **Cross-device sync / auth / persistence → single-session state with localStorage for UI widths only.** A design prototype is not a sync engine. The brief asks about the *design problem between capture and action*, not the *infra problem of a distributed second brain*. I kept state in `page.tsx` so the full data model is legible in one file.

### Sprint sequence + validation checkpoints

- **Sprint 1 (0–8h) — Thesis, IA, seed data.** Cluster taxonomy, regex router, 30 hand-written seed captures with inference reasons. *Checkpoint:* paste any realistic fragment and the resulting routing + reason reads plausibly on first glance.
- **Sprint 2 (8–20h) — Capture pipeline.** All four modes (text / link / image / voice) on the bar, processing→clustered state transition, Why-popover, sidebar pulse on arrival. *Checkpoint:* a cold user hits ⌘K, types a thought, and can verbalize what happened in one sentence.
- **Sprint 3 (20–32h) — Map view.** d3-force + HTML canvas, pan/zoom/drag, hover cards, cluster-size-by-connection-count, rasterized icons. *Checkpoint:* 30 captures across 8 clusters is legible without labels, and the canvas holds 60fps while dragging.
- **Sprint 4 (32–42h) — Mutations + Action Panel.** ActionPanel as a third column (not an overlay), capture edit / move / delete / complete, ClusterCreator modal, completion flow wired through both views. *Checkpoint:* a reviewer can move a capture, complete it, add a custom topic, and see the Map react live.
- **Sprint 5 (42–48h) — Brand, polish, ship.** Logo, top-nav search, capture-bar focus glow, README, Vercel deploy. *Checkpoint:* cold-open the deploy URL, hit Demo, record everything unbroken.

### How I leveraged AI

- **Code.** Paired with Claude Code end-to-end — scaffolding components, iterating on the d3-force + canvas hit-testing math, debugging React effect hazards (stale-state-in-effect, ref-in-effect), and refactoring the completion flow across six files in one pass. Every commit co-authors Claude where it contributed substantively.
- **Copy.** Cluster synthesis strings, next-step prompts, inference reasons, Why-popover microcopy, README prose — drafted with Claude, then edited for voice. The rule: Claude drafts to length, I strip anything that sounds like a chatbot.
- **Visual.** Design tokens, spacing, and information hierarchy are mine. Icon selection for the cluster registry and small layout compositions (e.g., the hover cards in Map view) were Claude-assisted. The logo itself was designed externally in Figma; Claude wrote the `SynapseLogo.tsx` inline-SVG component and the brand-story paragraph.
- **QA.** Used Claude as a cold-read critic — "audit this build against the brief, tell me what's missing" — which surfaced real gaps I'd have shipped past (e.g., inference reasons leaking raw cluster ids, missing completion flow, no search). Build + lint gates run every sprint boundary.
- **Retrospective.** Mid-build "what am I missing" audits from Claude acted as a lightweight red-team; they don't replace user testing, but at 48 hours with no users in the loop, an adversarial second-opinion is the cheapest insurance against self-deception.

### One more week — product + GTM

**Product**
- Swap the regex router for a real LLM call per capture, with per-cluster debounced synthesis + next-step regeneration so the map feels alive.
- Ingestion from where thoughts actually live: a browser extension (right-click → capture), an Apple Notes watcher, a Slack `/remember` bot.
- A calibration loop — Accept/Tweak/Dismiss telemetry feeds a per-user routing correction layer, so the system learns your taxonomy instead of imposing one.
- Mobile quick-capture via iOS Share Sheet + Siri intent. The 80% use case is mid-walk, mid-commute, mid-meeting.
- Shareable cluster exports ("here's what my brain did this week") — half artifact, half growth loop.

**GTM**
- Ship the 15-second map-clustering-in-real-time hero reel on TikTok/Reels — this product is inherently screen-recordable.
- Pin a Substack essay on *"Why every note-taking app has the same flaw"* to HN and design-adjacent subreddits; embed the live demo.
- Referral waitlist with position-jumping (Superhuman/Arc playbook) — gates access to users who evangelize, which is also the wedge persona.
- Five-creator case-study program: embed with high-output solo operators, document their weekly review ritual, ship as short films.
- Pricing probe: free up to N captures/day, $9/mo unlimited. Waitlist cohort is the validation sample.

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
