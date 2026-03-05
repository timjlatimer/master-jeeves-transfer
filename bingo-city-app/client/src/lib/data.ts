// ============================================================
// Bingo City — Shared Data Constants
// ============================================================

export interface Avatar {
  id: string;
  name: string;
  role: string;
  animal: string;
  emoji: string;
  zone: "inner-ring" | "outer" | "center" | "right-corner";
  color: string;
  description: string;
  system: string;
}

export const INNER_RING_AVATARS: Avatar[] = [
  {
    id: "pm",
    name: "Project Manager",
    role: "Leadership & Authority",
    animal: "Lion",
    emoji: "🦁",
    zone: "inner-ring",
    color: "#FFD700",
    description: "Apex of rooftop, manages all projects, first among equals. Ensures every to-do is done.",
    system: "Kahneman System 2 — Rational",
  },
  {
    id: "sm",
    name: "Situations Manager",
    role: "Real-time Awareness & Scanning",
    animal: "Hawk",
    emoji: "🦅",
    zone: "inner-ring",
    color: "#FF6B6B",
    description: "Real-time awareness, minimum latency. Knows where Ruby Red is right now.",
    system: "Kahneman System 2 — Rational",
  },
  {
    id: "companion",
    name: "Companion (Chief of Staff)",
    role: "Primary Interface & Communication",
    animal: "Golden Retriever",
    emoji: "🐕",
    zone: "inner-ring",
    color: "#4ECDC4",
    description: "User's primary interface, orchestrates communication. The friendly face. The Trojan Horse avatar.",
    system: "Kahneman System 2 — Rational",
  },
  {
    id: "sot",
    name: "Source of Truth",
    role: "Baseline Protection & Memory",
    animal: "Owl",
    emoji: "🦉",
    zone: "inner-ring",
    color: "#45B7D1",
    description: "Baseline protection, institutional memory, prevents drift. Community knowledge.",
    system: "Kahneman System 2 — Rational",
  },
  {
    id: "igag",
    name: '"I Got a Guy" Connector',
    role: "Community Connection",
    animal: "Bear",
    emoji: "🐻",
    zone: "inner-ring",
    color: "#96CEB4",
    description: "Knows who to call, restores the human social graph. The community connector.",
    system: "Kahneman System 2 — Rational",
  },
];

export const OUTER_AVATARS: Avatar[] = [
  {
    id: "qa",
    name: "QA Sentinel",
    role: "Quality Assurance",
    animal: "Eagle",
    emoji: "🦅",
    zone: "outer",
    color: "#9B59B6",
    description: "Quality assurance, pattern detection, anomaly flagging. Swiss Protocol compliance.",
    system: "Kahneman System 2 — Rational",
  },
  {
    id: "journalist",
    name: "Journalist",
    role: "Intelligence & Cross-pollination",
    animal: "Hummingbird",
    emoji: "🐦",
    zone: "outer",
    color: "#E74C3C",
    description: "Cloud Butterfly carriers, cross-card intelligence, insight capture.",
    system: "Kahneman System 2 — Rational",
  },
  {
    id: "sw",
    name: "Swarm Workers",
    role: "Task Execution",
    animal: "Bees",
    emoji: "🐝",
    zone: "outer",
    color: "#F39C12",
    description: "Task execution, shift between Chorus/Ensemble/Squadron modes.",
    system: "Kahneman System 2 — Rational",
  },
];

export const SPECIAL_AVATARS: Avatar[] = [
  {
    id: "voc",
    name: "Voice of Concern",
    role: "Emotional Intelligence & Intuition",
    animal: "Purple Cat",
    emoji: "🐱",
    zone: "right-corner",
    color: "#8B5CF6",
    description: 'Permanent emotional anchor. Intuition, never moves. System 1. The voice of anxiety, safety, risk. "Should I?" The one most women will know.',
    system: "Kahneman System 1 — Intuitive",
  },
  {
    id: "angel",
    name: "Angel of Your Better Nature",
    role: "Moral Compass & Conscience",
    animal: "Phoenix",
    emoji: "✨",
    zone: "center",
    color: "#FBBF24",
    description: "Mind counsel, appears during difficult decisions. System 3. Independent of both professionals and anxiety voice.",
    system: "Kahneman System 3 — Intuitive",
  },
  {
    id: "wg",
    name: "Wisdom Giants",
    role: "Fractional Experience",
    animal: "Translucent",
    emoji: "👻",
    zone: "outer",
    color: "#94A3B8",
    description: "Real humans with lived experience, appear, contribute, depart. Fractional HB1000 information.",
    system: "Transcendent",
  },
];

export const ALL_AVATARS = [...INNER_RING_AVATARS, ...OUTER_AVATARS, ...SPECIAL_AVATARS];

export interface BuildingFloor {
  level: number;
  name: string;
  color: string;
  hexColor: string;
  description: string;
}

export const BUILDING_FLOORS: BuildingFloor[] = [
  { level: 1, name: "Infrastructure", color: "blue", hexColor: "#3B82F6", description: "Foundation systems, APIs, connectivity" },
  { level: 2, name: "Data", color: "green", hexColor: "#22C55E", description: "Information layer, analytics, storage" },
  { level: 3, name: "Operations", color: "amber", hexColor: "#F59E0B", description: "Workflows, processes, automation" },
  { level: 4, name: "Community", color: "red", hexColor: "#EF4444", description: "People, relationships, communication" },
  { level: 5, name: "Governance", color: "gold", hexColor: "#D4A017", description: "Rules, protocols, decision-making" },
];

export interface GovernanceLevel {
  name: string;
  icon: string;
  color: string;
  description: string;
  mapping: string;
}

export const GOVERNANCE_LEVELS: GovernanceLevel[] = [
  {
    name: "Commune",
    icon: "🏘️",
    color: "#22C55E",
    description: "Smallest political unit. Maximum local autonomy. Citizens gather to decide. Generalized sovereignty. Education, welfare, infrastructure, taxation.",
    mapping: "Individual Bingo Card",
  },
  {
    name: "Canton",
    icon: "🏔️",
    color: "#F59E0B",
    description: "Regional autonomy. Own constitution, budget, taxation, families, welfare communities, control. International conferences for shared issues.",
    mapping: "Initiative Cluster / Pope's Domain",
  },
  {
    name: "Confederation",
    icon: "🇨🇭",
    color: "#EF4444",
    description: "Limited to enumerated powers. Foreign policy, currency, defense. Federal Council = 7 equals governing by consensus. No single executive.",
    mapping: "HB1000 / Master Jeeves",
  },
];

export interface EscalationLevel {
  level: number;
  name: string;
  description: string;
  color: string;
}

export const ESCALATION_LEVELS: EscalationLevel[] = [
  { level: 1, name: "Rooftop Discussion", color: "#3B82F6", description: "Any avatar raises an issue. Rooftop-level/City-level discussion." },
  { level: 2, name: "Formal Petition", color: "#22C55E", description: "10+ avatars endorse. PM must formally respond." },
  { level: 3, name: "Inner Ring Vote", color: "#F59E0B", description: "Petition passes debate. Inner ring formally decides." },
  { level: 4, name: "Pope Review", color: "#F97316", description: "Cross-card implications. Pope reviews for domain-wide impact." },
  { level: 5, name: "Master Jeeves", color: "#EF4444", description: "System-wide decisions. Organizational level. Benevolent dictator override." },
];

export interface SwarmMode {
  name: string;
  color: string;
  description: string;
  arrangement: string;
}

export const SWARM_MODES: SwarmMode[] = [
  {
    name: "CHORUS",
    color: "#22C55E",
    description: "Equal voice, brainstorming. All avatars contribute. Town hall/brainstorming mode. Deliberation and debate.",
    arrangement: "Circle formation, all avatars equidistant",
  },
  {
    name: "ENSEMBLE",
    color: "#F59E0B",
    description: "Specialist sections. Each avatar plays their instrument. Structured but differentiated. Project Manager conducts.",
    arrangement: "Grouped by specialty, PM at center",
  },
  {
    name: "SQUADRON",
    color: "#EF4444",
    description: "Emergency formation. Hierarchical chain of command. Situations Manager takes point. Fast, decisive, no debate. Crisis response.",
    arrangement: "V-formation, SM at point",
  },
];

export const MVC_AVATARS = [
  {
    id: "companion",
    name: "The Companion",
    emoji: "🐕",
    color: "#4ECDC4",
    description: "The friendly face. Talks to Ruby Red. Learns her preferences. Makes the system feel human. The Trojan Horse avatar — the one that gets her to open the door.",
  },
  {
    id: "sm",
    name: "Situations Manager",
    emoji: "🦅",
    color: "#FF6B6B",
    description: "The intelligence. Knows where Ruby Red is. Knows what the world is. Knows what's about to happen. Makes the system contextually aware. Scans her.",
  },
  {
    id: "voc",
    name: "Voice of Concern",
    emoji: "🐱",
    color: "#8B5CF6",
    description: "The emotional anchor. Validates Ruby Red's concerns. Mirrors her gut feelings. Ensures the system never operates purely on logic. Humanity. Wisdom. Intuition.",
  },
];

export const MVC_TIMELINE = [
  { period: "Week 1", description: '3 avatars, 1 Bingo Card, grocery budget, flat tire watch. Establish trust in 10 days.' },
  { period: "Week 3-4", description: 'Angel appears during a hard decision. Wisdom Giant visits with a tip. System feels alive.' },
  { period: "Month 2", description: 'Second avatar added. Fill escalation, QA tools, patterns. "I Got a Guy" activates a resource.' },
  { period: "Month 3", description: 'Full rooftop, Inner Ring forms. Swiss governance activates. Complete Bingo City.' },
];

export interface BingoCell {
  id: string;
  row: number;
  col: number;
  label: string;
  category: string;
  status: "empty" | "active" | "complete" | "blocked";
}

export function generateDefaultBingoGrid(): BingoCell[] {
  const categories = ["Infrastructure", "Data", "Operations", "Community", "Governance"];
  const labels = [
    ["API Setup", "Auth Flow", "DB Schema", "CDN Config", "Monitoring"],
    ["Analytics", "Reports", "ETL Pipeline", "Data Lake", "Dashboards"],
    ["Workflows", "Automation", "CI/CD", "FREE", "Testing"],
    ["Onboarding", "Comms", "Events", "Support", "Feedback"],
    ["Policies", "Compliance", "Audit", "Voting", "Protocols"],
  ];
  const cells: BingoCell[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      cells.push({
        id: `cell-${r}-${c}`,
        row: r,
        col: c,
        label: labels[r][c],
        category: categories[r],
        status: r === 2 && c === 3 ? "complete" : "empty",
      });
    }
  }
  return cells;
}

export const AVATAR_CUSTOMIZATION = {
  gender: ["Male", "Female", "Non-Binary"],
  personality: ["Quirky", "Fun", "Sassy", "Argumentative", "Intellectual", "Cautious"],
  culture: ["Language", "Values", "Cultural references", "Power distance"],
  visualStyle: ["Photorealistic", "Pixar-inspired", "In-between-glass", "Expressive eyes"],
};
