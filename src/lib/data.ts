import { Cluster, Capture } from './types';

/*
 * Seed persona: Mira, 2nd-year MFA (Design & Motion).
 * She's finishing a thesis on kinetic typography while running a paid
 * launch-comms internship for an indie skincare brand's Q2 relaunch,
 * and posting on TikTok + Substack on the side.
 * Key relationships: Maya (@mayakmakes, collaborator), Prof. Heron (thesis
 * advisor), Devika (client creative director), Jordan (engineering lead).
 *
 * Every capture below is something Mira actually threw into Synapse at some
 * point this week — voice memos on the walk home, links from 1am tab diving,
 * a photo of a Bauhaus spread, a line she hit mid-shower. The synthesis and
 * next-step copy for each cluster is what Synapse surfaced back to her.
 */

export const CLUSTERS: Cluster[] = [
  {
    id: 'proj-a',
    name: 'Thesis — Type in Motion',
    label: 'Thesis',
    category: 'project',
    color: '#6366F1',
    description:
      'MFA thesis: kinetic typography as rhetorical compression. Saul Bass lineage, Bauhaus grid structure, motion as argument.',
    synthesis:
      '4 captures converge on the same thesis: kinetic type compresses narrative into rhythm. Saul Bass appears in 3 separate sessions — he is your anchor case. Prof. Heron told you to narrow to one medium; you have not resolved title sequences vs. motion graphics yet. Argument map is still in your head.',
    nextStep:
      'Draft a 3-slide argument map before Thursday\'s mentor sync: kinetic type → cognitive rhythm → viewer retention. Pick title sequences as the medium. Anchor with Saul Bass.',
  },
  {
    id: 'proj-b',
    name: 'Lumen — Q2 Launch Comms',
    label: 'Lumen',
    category: 'project',
    color: '#8B5CF6',
    description:
      'Freelance internship: own the Q2 relaunch comms for Lumen Skincare. Brand refresh + launch timeline + WCAG-clean system.',
    synthesis:
      '5 captures flag the same two risks: the pastel palette Devika scrapped has a WCAG 3.0 contrast gap Jordan still has to scope, and there is no launch-comms timeline yet. You have 6 weeks to ship. Two tasks on this project share a Friday deadline — potential conflict.',
    nextStep:
      'Draft a 6-week launch-comms timeline today. Put the WCAG 3.0 audit at week 2. Send Devika a calendar invite for a Friday review before EOD Wednesday.',
  },
  {
    id: 'proj-c',
    name: 'Channel — TikTok + Substack',
    label: 'Channel',
    category: 'project',
    color: '#EC4899',
    description:
      'Personal channel: one TikTok a week, one Substack every other week. Design-for-designers POV.',
    synthesis:
      'You have 2 unfilmed TikTok hooks and one Substack draft at 40%. Last publish was 9 days ago — your engagement historically drops past day 10. Thursday is your best publish window. The AI-vs-designers essay is the strongest draft but has no ending yet.',
    nextStep:
      'Finish the Substack ending tonight and queue for Thursday 9am. Batch-shoot both TikTok hooks Saturday morning while the studio light holds.',
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    label: 'A11y',
    category: 'topic',
    color: '#3B82F6',
    description:
      'WCAG 3.0 / APCA references and open contrast questions across active projects.',
    synthesis:
      'WCAG 3.0\'s APCA replaces the 4.5:1 ratio entirely — affects 3 Lumen components directly. Two separate captures this week noticed the same issue from different angles, which means it is real, not a vibe.',
    nextStep:
      'Audit the 3 affected Lumen components against APCA this week. Log findings in a shared doc with Jordan before the Friday client review.',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    label: 'Tasks',
    category: 'topic',
    color: '#10B981',
    description:
      'Action items with deadlines, pulled from across projects.',
    synthesis:
      '3 open tasks. Oldest is 5 days stale. Two share a Friday EOD deadline — the Lumen moodboard and the mentor-sync prep deck. Sequencing matters: the moodboard unblocks Jordan, the deck unblocks you.',
    nextStep:
      'Finalize the Lumen moodboard by Thursday EOD so Jordan can scope Friday. Block 2h Thursday morning now, before the week fills.',
  },
  {
    id: 'people',
    name: 'People',
    label: 'People',
    category: 'topic',
    color: '#F59E0B',
    description:
      'Collaborators and contacts with open threads — Maya, Devika, Prof. Heron, Jordan.',
    synthesis:
      'Maya (@mayakmakes) — you flagged a June collab 4 days ago and never sent the DM. Prof. Heron — mentor sync is 1 week overdue. Devika — no reply on the palette decision since Monday.',
    nextStep:
      'Send Maya a 2-line DM today with one concrete thing to collab on. Book the Heron sync for Thursday. Ping Devika to confirm the palette before the moodboard ships.',
  },
  {
    id: 'meetings',
    name: 'Meetings',
    label: 'Meetings',
    category: 'topic',
    color: '#64748B',
    description:
      'Syncs, calls, and scheduled reviews — notes in, actions out.',
    synthesis:
      'Last mentor sync flagged a pivotal thesis narrowing — "one medium, not both" — and you captured it but never wrote up next-step bullets. That decision is still drifting.',
    nextStep:
      'Write a 3-bullet summary of the "one medium" decision before the next Heron sync. Decide: title sequences or motion graphics. No more both.',
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    label: 'Refs',
    category: 'topic',
    color: '#F97316',
    description:
      'Visual references and finds that might land somewhere later — posters, frames, moodboard pulls, type specimens.',
    synthesis:
      '3 captures this week, all image-led — Polish poster school, Neue Grafik grid, and a subway-tile grid pull on a walk. Two map onto thesis arguments, one maps onto the next Substack post. None of them have been filed into a project yet.',
    nextStep:
      'Pull these three into a single reference board Sunday night and tag each for thesis vs. Substack. Anything unfiled by Monday gets archived.',
  },
];

/*
 * ts utility: make the feed feel "today"-fresh without drifting over time.
 * Everything below is relative to the current render timestamp.
 */
const minsAgo = (m: number) => new Date(Date.now() - 1000 * 60 * m);

export const INITIAL_CAPTURES: Capture[] = [
  {
    id: 'c1',
    content:
      'WCAG 3.0 draft dropped — APCA replaces the 4.5:1 ratio entirely. Need to audit the Lumen button, toast, and chip against the new algorithm before Friday.',
    type: 'text',
    clusterId: 'accessibility',
    inferenceReason:
      '"WCAG" + "APCA" + Lumen component names → Accessibility topic (cross-linked to Lumen project)',
    timestamp: minsAgo(12),
    tags: ['#WCAG', '#APCA', '#lumen-ds'],
    status: 'clustered',
  },
  {
    id: 'c2',
    content:
      "Devika wants the pastel palette gone before the Q2 kickoff. She said 'edge, contrast, reads on dark' — almost verbatim the brief we rejected in round one. Irony.",
    type: 'voice',
    clusterId: 'proj-b',
    inferenceReason:
      'Client entity (Devika) + "palette" + "Q2" brand signal → Lumen: Q2 Launch Comms',
    timestamp: minsAgo(35),
    tags: ['#devika', '#palette', '#Q2'],
    status: 'clustered',
  },
  {
    id: 'c3',
    content:
      "Bass didn't design titles. He compressed narrative. Every sequence is an argument about pace. That's the whole thesis in one line — kinetic type as rhetorical compression.",
    type: 'text',
    clusterId: 'proj-a',
    inferenceReason:
      '"Bass" + "kinetic" + "thesis" + argument framing → Thesis project',
    timestamp: minsAgo(58),
    tags: ['#saul-bass', '#thesis', '#argument'],
    status: 'clustered',
  },
  {
    id: 'c4',
    content:
      'TikTok hook: "I designed my whole studio around 3 thrifted objects and the grid finally made sense." 8 seconds. One handheld pan. Trust the hook.',
    type: 'text',
    clusterId: 'proj-c',
    inferenceReason:
      'Platform keyword (TikTok) + hook format + duration signal → Channel project',
    timestamp: minsAgo(90),
    tags: ['#tiktok', '#hook', '#studio'],
    status: 'clustered',
  },
  {
    id: 'c5',
    content:
      "Draft: Why AI tools won't replace designers (they'll replace the ones who ignore them)",
    type: 'link',
    clusterId: 'proj-c',
    inferenceReason:
      'Substack domain + editorial headline pattern + "designers" → Channel project',
    timestamp: minsAgo(120),
    tags: ['#substack', '#AI', '#draft-40pct'],
    status: 'clustered',
    linkUrl: 'https://mirawrites.substack.com/p/ai-designers-draft',
    linkTitle:
      "Why AI tools won't replace designers (they'll replace the ones who ignore them)",
    linkDomain: 'substack.com',
  },
  {
    id: 'c6',
    content:
      'Reach out to Maya @mayakmakes about the June collab — brand-meets-editorial is exactly the crossover the Lumen teaser needs. She owes me a coffee anyway.',
    type: 'text',
    clusterId: 'people',
    inferenceReason:
      'People entity (@mayakmakes) + collab intent + project cross-reference → People',
    timestamp: minsAgo(180),
    tags: ['#maya', '#collab', '#june'],
    status: 'clustered',
  },
  {
    id: 'c7',
    content:
      'Finalize the Lumen moodboard by Friday EOD. Jordan needs it to scope the DS component audit — blocking her means blocking the WCAG pass.',
    type: 'text',
    clusterId: 'tasks',
    inferenceReason:
      'Action phrasing ("finalize") + hard deadline ("Friday EOD") + blocker note → Tasks',
    timestamp: minsAgo(240),
    tags: ['#deadline', '#moodboard', '#jordan'],
    status: 'clustered',
  },
  {
    id: 'c8',
    content:
      'Bauhaus spread — typography as structure, not decoration. The grid IS the argument. Put this in the thesis spatial-composition section.',
    type: 'image',
    clusterId: 'proj-a',
    inferenceReason:
      '"Bauhaus" + "grid" + "thesis" + image modality → Thesis project',
    timestamp: minsAgo(300),
    tags: ['#bauhaus', '#grid', '#reference'],
    status: 'clustered',
  },
  {
    id: 'c9',
    content:
      "Linear's pricing page — look at the fold structure. Section hierarchy is 3 levels not 4, and the price anchor sits *above* the feature list, not below. Worth stealing for the Lumen site.",
    type: 'link',
    clusterId: 'proj-b',
    inferenceReason:
      'Competitor reference + "Lumen site" context + IA language → Lumen project',
    timestamp: minsAgo(420),
    tags: ['#research', '#linear', '#IA'],
    status: 'clustered',
    linkUrl: 'https://linear.app/pricing',
    linkTitle: 'Linear — Pricing',
    linkDomain: 'linear.app',
  },
  {
    id: 'c10',
    content:
      "Heron sync: thesis is too broad. Pick one medium — title sequences OR motion graphics, not both. Kinetic type is the binding thread, not the subject.",
    type: 'voice',
    clusterId: 'meetings',
    inferenceReason:
      'Advisor entity (Heron) + "sync" pattern + decision language → Meetings',
    timestamp: minsAgo(600),
    tags: ['#heron', '#thesis', '#decision'],
    status: 'clustered',
  },
  {
    id: 'c11',
    content:
      'Second Substack idea: "The grid is not neutral." A 600-word takedown of how the 12-col grid encodes a specific era\'s idea of order. Pair with the Bauhaus image above.',
    type: 'text',
    clusterId: 'proj-c',
    inferenceReason:
      'Substack format + cross-reference to earlier capture (Bauhaus) → Channel',
    timestamp: minsAgo(720),
    tags: ['#substack', '#grid', '#pitch'],
    status: 'clustered',
  },
  {
    id: 'c12',
    content:
      'Mentor sync prep deck — 3 slides max. Slide 1: "Here\'s the narrow cut." Slide 2: the Bass case. Slide 3: what I\'ll ship by the next sync. Not a status update, a commitment.',
    type: 'text',
    clusterId: 'tasks',
    inferenceReason:
      'Action + hard container ("3 slides") + upcoming meeting reference → Tasks',
    timestamp: minsAgo(1440),
    tags: ['#deck', '#heron', '#prep'],
    status: 'clustered',
  },
  // ── Thesis additions ────────────────────────────────────────────
  {
    id: 'c13',
    content:
      "Re-read Hofmann's Graphic Design Manual chapter 3 tonight. The claim that rhythm emerges from constraint is the exact structural argument the thesis has been missing.",
    type: 'text',
    clusterId: 'proj-a',
    inferenceReason:
      '"thesis" + typography reference + argument-framing language → Thesis project',
    timestamp: minsAgo(25),
    tags: ['#hofmann', '#thesis', '#rhythm'],
    status: 'clustered',
  },
  {
    id: 'c14',
    content:
      "Screengrab: Saul Bass's Anatomy of a Murder title — 42 seconds, 9 compositional beats. The cut lines function as kinetic punctuation, not decoration.",
    type: 'image',
    clusterId: 'proj-a',
    inferenceReason:
      'Saul Bass reference + kinetic analysis + image modality → Thesis project',
    timestamp: minsAgo(75),
    tags: ['#saul-bass', '#thesis', '#titles'],
    status: 'clustered',
  },
  {
    id: 'c15',
    content:
      'If kinetic type is rhetorical compression, then static type is rhetorical deferral. That distinction belongs in the thesis intro, paragraph one.',
    type: 'text',
    clusterId: 'proj-a',
    inferenceReason:
      'Kinetic/static type dichotomy + thesis-intro pointer → Thesis project',
    timestamp: minsAgo(155),
    tags: ['#kinetic', '#thesis', '#intro'],
    status: 'clustered',
  },
  // ── Lumen additions ─────────────────────────────────────────────
  {
    id: 'c16',
    content:
      "Lumen moodboard v3 — Devika loves panel 2 (editorial cutouts), wants panel 5 killed (the gradient). Amending tonight before the Friday review.",
    type: 'image',
    clusterId: 'proj-b',
    inferenceReason:
      'Lumen entity + Devika feedback + moodboard revision → Lumen project',
    timestamp: minsAgo(45),
    tags: ['#lumen', '#moodboard', '#devika'],
    status: 'clustered',
  },
  {
    id: 'c17',
    content:
      'Jordan just flagged the new button hover state fails contrast at 0.6 APCA. Fix before the DS handoff Thursday or the entire variant token set blocks.',
    type: 'voice',
    clusterId: 'proj-b',
    inferenceReason:
      'Jordan entity + Lumen DS + hover/contrast blocker → Lumen project',
    timestamp: minsAgo(110),
    tags: ['#jordan', '#lumen-ds', '#contrast'],
    status: 'clustered',
  },
  {
    id: 'c18',
    content:
      "Everlane's launch email — the 3-column product grid above the fold is exactly what the Lumen Q2 teaser should do. Steal the structure, not the aesthetic.",
    type: 'link',
    clusterId: 'proj-b',
    inferenceReason:
      'Competitor-email research + "Lumen Q2" context → Lumen project',
    timestamp: minsAgo(200),
    tags: ['#research', '#email', '#Q2'],
    status: 'clustered',
    linkUrl: 'https://www.everlane.com/journal',
    linkTitle: 'Everlane — Journal + launches',
    linkDomain: 'everlane.com',
  },
  {
    id: 'c19',
    content:
      'Lumen Q2 timeline v1 — Wk1 moodboard, Wk2 APCA audit, Wk3 component refactor, Wk4 copy pass, Wk5 email build, Wk6 soft launch. Send Devika before EOD.',
    type: 'text',
    clusterId: 'proj-b',
    inferenceReason:
      'Lumen + 6-week launch plan + Devika review → Lumen project',
    timestamp: minsAgo(360),
    tags: ['#lumen', '#timeline', '#Q2'],
    status: 'clustered',
  },
  // ── Channel additions ───────────────────────────────────────────
  {
    id: 'c20',
    content:
      "TikTok hook 2: \"I thought I needed 14 tabs open to work. Turns out I needed 3 chairs.\" Shoot Saturday while the studio light still holds.",
    type: 'voice',
    clusterId: 'proj-c',
    inferenceReason:
      'TikTok platform + hook format + production plan → Channel project',
    timestamp: minsAgo(135),
    tags: ['#tiktok', '#hook', '#saturday-shoot'],
    status: 'clustered',
  },
  {
    id: 'c21',
    content:
      'Substack scheduling note: Tuesday 9am Eastern has been my strongest window for 6 posts running. Batch-queue everything for that slot, stop improvising.',
    type: 'text',
    clusterId: 'proj-c',
    inferenceReason:
      'Substack platform + cadence / schedule pattern → Channel project',
    timestamp: minsAgo(500),
    tags: ['#substack', '#cadence', '#tuesday'],
    status: 'clustered',
  },
  // ── Accessibility additions ─────────────────────────────────────
  {
    id: 'c22',
    content:
      'APCA calculator — bookmark for the Lumen audit. Body-text cutoff at +75, large display at +60. The button token currently reads +58 on white.',
    type: 'link',
    clusterId: 'accessibility',
    inferenceReason:
      'APCA + contrast calculator + cutoff values → Accessibility topic',
    timestamp: minsAgo(80),
    tags: ['#APCA', '#tools', '#lumen-audit'],
    status: 'clustered',
    linkUrl: 'https://www.myndex.com/APCA/',
    linkTitle: 'APCA Contrast Calculator',
    linkDomain: 'myndex.com',
  },
  {
    id: 'c23',
    content:
      'WCAG 3.0 draft loosens the link-underline rule if the component is distinguishable by two other means. Lumen already has color + weight. Note for the spec.',
    type: 'text',
    clusterId: 'accessibility',
    inferenceReason:
      'WCAG + distinguishability rule → Accessibility topic',
    timestamp: minsAgo(260),
    tags: ['#WCAG', '#links', '#lumen-ds'],
    status: 'clustered',
  },
  // ── Tasks additions ─────────────────────────────────────────────
  {
    id: 'c24',
    content:
      'Send Prof. Heron the 3-slide deck by 5pm Friday. Include the Bass case and the narrow-cut decision. No hedging, no "either/or."',
    type: 'text',
    clusterId: 'tasks',
    inferenceReason:
      'Action verb + hard deadline ("Friday 5pm") → Tasks',
    timestamp: minsAgo(95),
    tags: ['#deadline', '#deck', '#heron'],
    status: 'clustered',
  },
  {
    id: 'c25',
    content:
      "Respond to the 3 unread Slacks from Devika before the week closes. Two are blockers. The third is asking about October — can wait.",
    type: 'text',
    clusterId: 'tasks',
    inferenceReason:
      'Action verb + deadline framing + blocker triage → Tasks',
    timestamp: minsAgo(380),
    tags: ['#slack', '#devika', '#unblock'],
    status: 'clustered',
  },
  // ── People additions ────────────────────────────────────────────
  {
    id: 'c26',
    content:
      'Email Prof. Heron to lock the mentor sync for next Thursday 2pm. He usually says yes same-day if I ask before lunch.',
    type: 'text',
    clusterId: 'people',
    inferenceReason:
      'Heron entity + scheduling intent + collaborator reach-out → People',
    timestamp: minsAgo(170),
    tags: ['#heron', '#email', '#sync'],
    status: 'clustered',
  },
  {
    id: 'c27',
    content:
      "Dev DM'd about a potential intro to a Brooklyn studio hiring MFA grads. Follow up Monday with a 4-piece portfolio cut — thesis trailer + Lumen + 2 old pieces.",
    type: 'voice',
    clusterId: 'people',
    inferenceReason:
      'DM / follow-up pattern + networking intent → People topic',
    timestamp: minsAgo(540),
    tags: ['#dev', '#intro', '#portfolio'],
    status: 'clustered',
  },
  // ── Inspiration additions ───────────────────────────────────────
  {
    id: 'c28',
    content:
      'Cover of the 1962 Neue Grafik issue — red bleed, Akzidenz Grotesk only, the exact weight of restraint I want the thesis deck to have.',
    type: 'image',
    clusterId: 'inspiration',
    inferenceReason:
      'Poster / reference image + type specimen framing → Inspiration',
    timestamp: minsAgo(140),
    tags: ['#neue-grafik', '#reference', '#restraint'],
    status: 'clustered',
  },
  {
    id: 'c29',
    content:
      "Kaliszewski's title-design archive — the Polish poster school as a pacing reference. Worth a 30-min deep dive this weekend before the thesis section on motion as argument.",
    type: 'link',
    clusterId: 'inspiration',
    inferenceReason:
      'Archive + reference-deep-dive intent + pacing framing → Inspiration',
    timestamp: minsAgo(410),
    tags: ['#poster', '#archive', '#pacing'],
    status: 'clustered',
    linkUrl: 'https://www.theculturetrip.com/europe/poland/articles/polish-poster-school/',
    linkTitle: 'The Polish Poster School — visual archive',
    linkDomain: 'theculturetrip.com',
  },
  {
    id: 'c30',
    content:
      "Subway tile moment from this morning's walk — the grout line IS the grid. Save for the 'grid is not neutral' Substack piece.",
    type: 'image',
    clusterId: 'inspiration',
    inferenceReason:
      'Street-photo moodboard capture + cross-link to Substack draft → Inspiration',
    timestamp: minsAgo(650),
    tags: ['#subway', '#grid', '#street'],
    status: 'clustered',
  },
];

export const CLUSTER_ORDER = [
  'proj-a',
  'proj-b',
  'proj-c',
  'accessibility',
  'tasks',
  'people',
  'meetings',
  'inspiration',
];

/*
 * Regex router — mocks a production LLM classifier.
 * Order matters: most specific signals first, falls back to the most active project.
 */
export function inferCluster(content: string): string {
  const lower = content.toLowerCase();
  if (/wcag|apca|contrast|a11y|accessibility|aria/.test(lower)) return 'accessibility';
  if (/lumen|devika|jordan|client|launch|q2|refresh|campaign|comms|linear/.test(lower)) return 'proj-b';
  if (/thesis|heron|kinetic|motion|bauhaus|bass|typeface|typograph|hofmann/.test(lower)) return 'proj-a';
  if (/tiktok|substack|instagram|reel|channel|hook|caption|publish|essay|draft/.test(lower)) return 'proj-c';
  if (/moodboard|poster|archive|specimen|reference|ref\b|inspir|screengrab|bleed|spread/.test(lower)) return 'inspiration';
  if (/heron|mentor|sync|meet|call|standup|debrief|review\b/.test(lower)) return 'meetings';
  if (/task|todo|deadline|by friday|by monday|eod|finalize|finish|complete|block\s+\dh/.test(lower)) return 'tasks';
  if (/maya|@|reach out|contact|collab|dm|email|follow.?up/.test(lower)) return 'people';
  return 'proj-b'; // Lumen is the most active project — sensible default
}

export function getInferenceReason(content: string, clusterId: string): string {
  const reasons: Record<string, string[]> = {
    'proj-a': [
      '"thesis" + motion/type keywords → Thesis project',
      'Saul Bass / Bauhaus reference → Thesis project',
      'Kinetic-type argument language → Thesis project',
    ],
    'proj-b': [
      'Lumen entity or Devika reference → Lumen launch comms',
      'Client / Q2 / launch signal → Lumen project',
      'Competitor-research pattern scoped to Lumen → Lumen project',
    ],
    'proj-c': [
      'TikTok / Substack platform keyword → Channel project',
      'Hook or essay format detected → Channel project',
      'Publishing cadence reference → Channel project',
    ],
    accessibility: [
      'WCAG / APCA keyword → Accessibility topic',
      'Contrast / a11y reference → Accessibility topic',
    ],
    tasks: [
      'Action verb + hard deadline ("by Friday EOD") → Tasks',
      'Commitment language with time-box → Tasks',
    ],
    people: [
      'People entity or @mention → People topic',
      'Collaboration or follow-up intent → People topic',
    ],
    meetings: [
      'Advisor / sync / review pattern → Meetings topic',
      'Decision-capture format typical of sync notes → Meetings topic',
    ],
    inspiration: [
      'Visual reference / poster / archive pattern → Inspiration topic',
      'Moodboard pull with no project home yet → Inspiration topic',
      'Type specimen or grid study → Inspiration topic',
    ],
  };
  const list = reasons[clusterId] || ['Semantic similarity to existing cluster'];
  // Deterministic selection so the shown reason is stable across renders.
  const idx = Math.abs(
    content.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0)
  ) % list.length;
  return list[idx];
}
