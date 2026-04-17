import { Cluster, Capture } from './types';

export const CLUSTERS: Cluster[] = [
  {
    id: 'proj-a',
    name: 'Thesis — Type in Motion',
    label: 'Thesis',
    category: 'project',
    color: '#6366F1',
    description: 'Portfolio thesis exploring kinetic typography and motion design lineage.',
    synthesis:
      '3 captures reference Saul Bass across separate sessions. Thesis argument is converging: kinetic type as rhetorical compression. Missing a structured argument map and first draft outline.',
    nextStep:
      'Build a 3-slide argument map: kinetic type → cognitive rhythm → viewer retention. Anchor with Saul Bass as the primary case study.',
  },
  {
    id: 'proj-b',
    name: 'Internship — Launch Comms',
    label: 'Launch Comms',
    category: 'project',
    color: '#8B5CF6',
    description: 'Freelance internship brief — own launch comms and visual tone for Q2 product release.',
    synthesis:
      '4 recent captures flag a Q2 brand refresh plus a WCAG compliance gap in the current design system. Client confirmed the pastel palette is being scrapped. No launch comms timeline drafted yet.',
    nextStep:
      'Draft a 6-week launch comms timeline. Schedule WCAG 3.0 compliance review at week 2. Send calendar invite to the client before end of week.',
  },
  {
    id: 'proj-c',
    name: 'Personal — Content Channel',
    label: 'Content',
    category: 'project',
    color: '#EC4899',
    description: 'Personal TikTok + Substack channel — live and iterating.',
    synthesis:
      'Content pipeline has 2 pending TikTok concepts and 1 Substack draft at ~40% completion. Last publish was 9 days ago — engagement drops after 10 days without posting. Thursday is the optimal window.',
    nextStep:
      "Finish the Substack draft and schedule for Thursday. Batch-record both TikTok hooks this weekend while the studio light is good.",
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    label: 'A11y',
    category: 'topic',
    color: '#3B82F6',
    description: 'WCAG standards, contrast ratios, and inclusive design references.',
    synthesis:
      'WCAG 3.0 contrast changes affect 3 components in the current design system. Two separate captures reference the same compliance gap from different angles.',
    nextStep:
      'Audit the 3 affected DS components against WCAG 3.0 APCA contrast algorithm. Log findings in a shared doc with the engineering lead.',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    label: 'Tasks',
    category: 'topic',
    color: '#10B981',
    description: 'Action items, deadlines, and to-dos across all projects.',
    synthesis:
      '3 open tasks detected. Oldest is 5 days stale. Two tasks share a Friday deadline — potential conflict.',
    nextStep:
      'Finalize the internship moodboard by EOD Friday. Block 2h on the calendar now to avoid the deadline conflict.',
  },
  {
    id: 'people',
    name: 'People',
    label: 'People',
    category: 'topic',
    color: '#F59E0B',
    description: 'Collaborators, contacts, and follow-ups.',
    synthesis:
      'Maya (@mayakmakes) has not been followed up with since the initial collab mention 4 days ago. Mentor sync is overdue by 1 week.',
    nextStep:
      'Send Maya a 2-line DM about the June collab. Rebook the mentor sync for this week.',
  },
  {
    id: 'meetings',
    name: 'Meetings',
    label: 'Meetings',
    category: 'topic',
    color: '#64748B',
    description: 'Syncs, calls, and scheduled sessions.',
    synthesis:
      "Last mentor sync referenced a pivotal direction change on the thesis — no follow-up action was captured.",
    nextStep:
      'Write up 3 bullet points summarizing the thesis direction before the next mentor session.',
  },
];

export const INITIAL_CAPTURES: Capture[] = [
  {
    id: 'c1',
    content:
      'WCAG 3.0 draft dropped — need to check new APCA contrast requirements against our design system components. The old 4.5:1 ratio is being replaced entirely.',
    type: 'text',
    clusterId: 'accessibility',
    inferenceReason: '"WCAG" + "contrast" + "design system" matched → Accessibility topic',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    tags: ['#WCAG', '#accessibility', '#design-system'],
    status: 'clustered',
  },
  {
    id: 'c2',
    content:
      "Client wants brand refresh locked before Q2 kickoff. Pastel palette feels off — needs more edge, higher contrast, something that reads on dark backgrounds.",
    type: 'voice',
    clusterId: 'proj-b',
    inferenceReason: '"brand refresh" + "client" + "Q2" → Project B: Launch Comms',
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    tags: ['#brand', '#Q2', '#client'],
    status: 'clustered',
  },
  {
    id: 'c3',
    content:
      "Saul Bass didn't just design titles — he compressed narrative. Each sequence is an argument. That's the thesis: kinetic type as an act of rhetorical compression.",
    type: 'text',
    clusterId: 'proj-a',
    inferenceReason: '"Saul Bass" + "kinetic type" + "thesis" → Project A: Thesis',
    timestamp: new Date(Date.now() - 1000 * 60 * 58),
    tags: ['#motion', '#thesis', '#saul-bass'],
    status: 'clustered',
  },
  {
    id: 'c4',
    content:
      'TikTok hook: "I redesigned my studio using only thrift finds — here\'s the system that actually keeps it organized." Short, scroll-stopper, service-y.',
    type: 'text',
    clusterId: 'proj-c',
    inferenceReason: '"TikTok hook" + social content format detected → Project C: Content',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    tags: ['#tiktok', '#content', '#hook'],
    status: 'clustered',
  },
  {
    id: 'c5',
    content: "Draft: Why AI tools won't replace designers (they'll replace the ones who ignore them)",
    type: 'link',
    clusterId: 'proj-c',
    inferenceReason: 'Substack editorial format + "AI" + "designers" → Project C: Content',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    tags: ['#substack', '#AI', '#draft'],
    status: 'clustered',
    linkUrl: 'https://substack.com',
    linkTitle: "Draft: Why AI tools won't replace designers (they'll replace the ones who ignore them)",
    linkDomain: 'substack.com',
  },
  {
    id: 'c6',
    content:
      'Reach out to Maya @mayakmakes about a design collab for the June content push. She does brand-meets-editorial — exactly the aesthetic crossover I need.',
    type: 'text',
    clusterId: 'people',
    inferenceReason: 'People entity (@mayakmakes) + collaboration intent → People',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    tags: ['#collab', '#june', '#people'],
    status: 'clustered',
  },
  {
    id: 'c7',
    content:
      'Finalize moodboard for the internship brand refresh by Friday EOD. Engineering lead needs it to scope the DS component audit.',
    type: 'text',
    clusterId: 'tasks',
    inferenceReason: 'Action item + deadline ("by Friday EOD") → Tasks cluster',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    tags: ['#deadline', '#moodboard', '#tasks'],
    status: 'clustered',
  },
  {
    id: 'c8',
    content:
      'Bauhaus grid experiments — typography as structure, not decoration. The grid IS the argument. Perfect thesis reference for the spatial composition section.',
    type: 'image',
    clusterId: 'proj-a',
    inferenceReason: '"Bauhaus" + "typography" + image format → Project A: Thesis',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    tags: ['#bauhaus', '#typography', '#grid'],
    status: 'clustered',
  },
  {
    id: 'c9',
    content:
      'Competitor landing page — their information hierarchy is cleaner than ours. Worth dissecting the fold structure and how they handle the pricing section.',
    type: 'link',
    clusterId: 'proj-b',
    inferenceReason: '"competitor" + "landing page" + internship context → Project B: Launch Comms',
    timestamp: new Date(Date.now() - 1000 * 60 * 420),
    tags: ['#research', '#competitor', '#UX'],
    status: 'clustered',
    linkUrl: 'https://linear.app',
    linkTitle: 'Linear — Project management for modern software teams',
    linkDomain: 'linear.app',
  },
  {
    id: 'c10',
    content:
      "Mentor sync: thesis direction feels too broad. She said narrow to one medium — either title sequences OR motion graphics, not both. Kinetic type as the binding thread.",
    type: 'voice',
    clusterId: 'meetings',
    inferenceReason: '"mentor sync" + note-taking pattern → Meetings cluster',
    timestamp: new Date(Date.now() - 1000 * 60 * 600),
    tags: ['#mentor', '#thesis', '#direction'],
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
];

export function inferCluster(content: string): string {
  const lower = content.toLowerCase();
  if (/wcag|apca|contrast|a11y|accessibility|aria/.test(lower)) return 'accessibility';
  if (/client|launch|brand|comms|q2|internship|competitor|refresh|campaign/.test(lower)) return 'proj-b';
  if (/thesis|kinetic|motion|bauhaus|saul|typeface|typograph|font|animate/.test(lower)) return 'proj-a';
  if (/tiktok|substack|instagram|reel|content|post|publish|hook|caption/.test(lower)) return 'proj-c';
  if (/meet|sync|call|session|mentor|standup|debrief/.test(lower)) return 'meetings';
  if (/task|todo|deadline|by friday|by monday|eod|finish|finalize|complete/.test(lower)) return 'tasks';
  if (/@|reach out|contact|collab|dm|email|follow.?up/.test(lower)) return 'people';
  return 'proj-b'; // default to most active project
}

export function getInferenceReason(content: string, clusterId: string): string {
  const lower = content.toLowerCase();
  const reasons: Record<string, string[]> = {
    'proj-a': [
      '"motion" + "type" keywords → Thesis project context',
      'Typography/motion reference → Project A: Thesis',
      'Saul Bass / Bauhaus signal → Project A cluster',
    ],
    'proj-b': [
      '"launch" + "brand" → Internship: Launch Comms',
      '"client" intent signal → Project B cluster',
      'Comms / campaign pattern → Project B: Launch Comms',
    ],
    'proj-c': [
      'Social content format detected → Personal Channel',
      'Platform keyword (TikTok/Substack) → Project C',
      'Publishing / content intent → Project C cluster',
    ],
    accessibility: [
      'WCAG / contrast keyword → Accessibility topic',
      'A11y standards reference → Accessibility cluster',
    ],
    tasks: [
      'Action item pattern detected → Tasks',
      'Deadline language ("by Friday") → Tasks cluster',
    ],
    people: [
      'People entity or @mention → People cluster',
      'Collaboration intent detected → People',
    ],
    meetings: [
      'Sync / session pattern → Meetings cluster',
      '"mentor" + note-taking format → Meetings',
    ],
  };
  const list = reasons[clusterId] || ['Semantic similarity to existing cluster'];
  return list[Math.floor(Math.random() * list.length)];
}
