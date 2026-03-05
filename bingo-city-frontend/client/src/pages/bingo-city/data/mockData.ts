/**
 * mockData.ts — Bingo City Mock Data Layer
 *
 * DESIGN: "Warm Noir" — cinematic dark, amber accents, empathy-first copy
 *
 * This file contains all mock data for the Bingo City front-end.
 * When Jeeves integrates these components, replace the mock hooks
 * below with real tRPC hooks:
 *
 *   useBingoCards()       → trpc.bingoCards.list.useQuery()
 *   useBingoCard(id)      → trpc.bingoCards.getById.useQuery({ id })
 *   useBingoSquares(id)   → trpc.bingoSquares.getByCardId.useQuery({ cardId: id })
 */

// ─── Types ───────────────────────────────────────────────────────────

export type SquareStatus = "not_started" | "in_progress" | "complete" | "blocked";

export interface BingoSquare {
  id: string;
  position: number; // 1-25
  title: string;
  description: string;
  status: SquareStatus;
  floor: number; // 1-5
  owner?: string;
}

export interface RooftopAvatar {
  id: string;
  name: string;
  role: string;
  emoji: string;
  zone: "left" | "center" | "right";
  description: string;
}

export interface BingoCard {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  createdAt: string;
  totalSquares: number;
  completedSquares: number;
  inProgressSquares: number;
  blockedSquares: number;
}

export interface FloorInfo {
  number: number;
  name: string;
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  emoji: string;
}

// ─── Floor Definitions ──────────────────────────────────────────────

export const FLOORS: FloorInfo[] = [
  {
    number: 1,
    name: "Infrastructure",
    label: "F1",
    color: "#1e40af",
    bgClass: "bg-[#1e40af]",
    borderClass: "border-[#1e40af]",
    textClass: "text-[#1e40af]",
    emoji: "🏗️",
  },
  {
    number: 2,
    name: "Data",
    label: "F2",
    color: "#15803d",
    bgClass: "bg-[#15803d]",
    borderClass: "border-[#15803d]",
    textClass: "text-[#15803d]",
    emoji: "📊",
  },
  {
    number: 3,
    name: "Operations",
    label: "F3",
    color: "#d97706",
    bgClass: "bg-[#d97706]",
    borderClass: "border-[#d97706]",
    textClass: "text-[#d97706]",
    emoji: "⚙️",
  },
  {
    number: 4,
    name: "Community",
    label: "F4",
    color: "#dc2626",
    bgClass: "bg-[#dc2626]",
    borderClass: "border-[#dc2626]",
    textClass: "text-[#dc2626]",
    emoji: "🤝",
  },
  {
    number: 5,
    name: "Governance",
    label: "F5",
    color: "#ca8a04",
    bgClass: "bg-[#ca8a04]",
    borderClass: "border-[#ca8a04]",
    textClass: "text-[#ca8a04]",
    emoji: "👑",
  },
];

// ─── Rooftop Avatars ────────────────────────────────────────────────

export const ROOFTOP_AVATARS: RooftopAvatar[] = [
  {
    id: "pm",
    name: "Project Manager",
    role: "Apex of the rooftop",
    emoji: "🦁",
    zone: "left",
    description: "Manages all projects. Ensures every to-do is done.",
  },
  {
    id: "sm",
    name: "Situations Manager",
    role: "Real-time awareness",
    emoji: "🦅",
    zone: "left",
    description: "Knows where Ruby Red is right now. Scans for what's next.",
  },
  {
    id: "cs",
    name: "Companion",
    role: "Chief of Staff",
    emoji: "🐕",
    zone: "left",
    description: "Your AI best friend. Orchestrates all other avatars. Always with you.",
  },
  {
    id: "jn",
    name: "Journalist",
    role: "Intelligence",
    emoji: "🦉",
    zone: "left",
    description: "Attends meetings across all initiatives. Brings back intel.",
  },
  {
    id: "st",
    name: "Source of Truth",
    role: "Baseline protection",
    emoji: "🐻",
    zone: "left",
    description: "Guards documentation accuracy. Flags drift from baselines.",
  },
  {
    id: "angel",
    name: "Angel of Better Nature",
    role: "Moral compass",
    emoji: "✨",
    zone: "center",
    description: "Provides good counsel during difficult decisions.",
  },
  {
    id: "voc",
    name: "Voice of Concern",
    role: "The gut feeling",
    emoji: "🐱",
    zone: "right",
    description: "Senses everything. Feels everything. The intuition.",
  },
];

// ─── Ruby Red Maven Card — 25 Squares ──────────────────────────────

export const RUBY_RED_SQUARES: BingoSquare[] = [
  // Floor 1 — Infrastructure (positions 1-5)
  {
    id: "sq-1",
    position: 1,
    title: "User Auth System",
    description: "Secure login so Ruby Red's data stays private",
    status: "complete",
    floor: 1,
    owner: "Companion",
  },
  {
    id: "sq-2",
    position: 2,
    title: "Data Encryption",
    description: "Bank-level encryption for all personal information",
    status: "complete",
    floor: 1,
    owner: "Source of Truth",
  },
  {
    id: "sq-3",
    position: 3,
    title: "Mobile-First UI",
    description: "Works perfectly on the phone she already has",
    status: "complete",
    floor: 1,
    owner: "Journalist",
  },
  {
    id: "sq-4",
    position: 4,
    title: "Offline Mode",
    description: "Still works when the Wi-Fi cuts out",
    status: "in_progress",
    floor: 1,
    owner: "Project Manager",
  },
  {
    id: "sq-5",
    position: 5,
    title: "API Gateway",
    description: "Connects all the helpers together behind the scenes",
    status: "complete",
    floor: 1,
    owner: "Situations Manager",
  },

  // Floor 2 — Data (positions 6-10)
  {
    id: "sq-6",
    position: 6,
    title: "Budget Guardian",
    description: "Tracks every dollar. Forecasts shortfalls before they happen.",
    status: "complete",
    floor: 2,
    owner: "Companion",
  },
  {
    id: "sq-7",
    position: 7,
    title: "Benefits Navigator",
    description: "Monitors all programs she qualifies for. Auto-applies.",
    status: "in_progress",
    floor: 2,
    owner: "Situations Manager",
  },
  {
    id: "sq-8",
    position: 8,
    title: "Spending Patterns",
    description: "Learns her habits to find savings she didn't know existed",
    status: "in_progress",
    floor: 2,
    owner: "Journalist",
  },
  {
    id: "sq-9",
    position: 9,
    title: "Income Tracker",
    description: "Knows when payday is and plans around it automatically",
    status: "complete",
    floor: 2,
    owner: "Source of Truth",
  },
  {
    id: "sq-10",
    position: 10,
    title: "Bill Calendar",
    description: "Every due date mapped. No more surprise charges.",
    status: "complete",
    floor: 2,
    owner: "Project Manager",
  },

  // Floor 3 — Operations (positions 11-15)
  {
    id: "sq-11",
    position: 11,
    title: "Deal Hunter",
    description: "Scans prices, finds coupons, optimizes the grocery list.",
    status: "in_progress",
    floor: 3,
    owner: "Companion",
  },
  {
    id: "sq-12",
    position: 12,
    title: "Bill Strategist",
    description: "Optimizes payment order. Minimizes late fees. Negotiates.",
    status: "not_started",
    floor: 3,
    owner: "Situations Manager",
  },
  {
    id: "sq-13",
    position: 13,
    title: "Emergency Fund Builder",
    description: "The flat tire fund. Builds it $5 at a time if needed.",
    status: "in_progress",
    floor: 3,
    owner: "Project Manager",
  },
  {
    id: "sq-14",
    position: 14,
    title: "Subscription Auditor",
    description: "Finds and cancels forgotten subscriptions draining the account",
    status: "complete",
    floor: 3,
    owner: "Journalist",
  },
  {
    id: "sq-15",
    position: 15,
    title: "Smart Notifications",
    description: "Gentle nudges at the right time, not annoying alerts",
    status: "not_started",
    floor: 3,
    owner: "Source of Truth",
  },

  // Floor 4 — Community (positions 16-20)
  {
    id: "sq-16",
    position: 16,
    title: "Advocate",
    description: "Flags predatory practices. Finds free legal resources.",
    status: "not_started",
    floor: 4,
    owner: "Voice of Concern",
  },
  {
    id: "sq-17",
    position: 17,
    title: "Community Connect",
    description: "Links to local food banks, assistance programs, support groups",
    status: "in_progress",
    floor: 4,
    owner: "Companion",
  },
  {
    id: "sq-18",
    position: 18,
    title: "Kids Activity Finder",
    description: "Free and low-cost activities so the kids don't miss out",
    status: "not_started",
    floor: 4,
    owner: "Situations Manager",
  },
  {
    id: "sq-19",
    position: 19,
    title: "Peer Network",
    description: "Connect with other moms navigating the same challenges",
    status: "not_started",
    floor: 4,
    owner: "Journalist",
  },
  {
    id: "sq-20",
    position: 20,
    title: "Crisis Playbook",
    description: "Step-by-step guides for when everything goes wrong at once",
    status: "blocked",
    floor: 4,
    owner: "Project Manager",
  },

  // Floor 5 — Governance (positions 21-25)
  {
    id: "sq-21",
    position: 21,
    title: "Privacy Controls",
    description: "Ruby Red owns her data. Period. Full control over what's shared.",
    status: "in_progress",
    floor: 5,
    owner: "Source of Truth",
  },
  {
    id: "sq-22",
    position: 22,
    title: "Feedback Loop",
    description: "Her voice shapes what gets built next",
    status: "not_started",
    floor: 5,
    owner: "Voice of Concern",
  },
  {
    id: "sq-23",
    position: 23,
    title: "Transparency Report",
    description: "See exactly what the AI is doing and why",
    status: "not_started",
    floor: 5,
    owner: "Angel of Better Nature",
  },
  {
    id: "sq-24",
    position: 24,
    title: "Ethics Guardian",
    description: "Ensures no predatory patterns sneak into the system",
    status: "in_progress",
    floor: 5,
    owner: "Voice of Concern",
  },
  {
    id: "sq-25",
    position: 25,
    title: "Swiss Protocol",
    description: "Democratic governance. Her city, her rules.",
    status: "not_started",
    floor: 5,
    owner: "Project Manager",
  },
];

// ─── Mock Bingo Cards ───────────────────────────────────────────────

export const MOCK_CARDS: BingoCard[] = [
  {
    id: "ruby-red-maven",
    title: "Ruby Red Maven",
    description:
      "Everything needed to give Ruby Red a complete AI-powered support system. Budget tracking, benefits navigation, deal hunting, community connection, and democratic governance — all working together.",
    ownerName: "SIC HB1000 Solve Team",
    createdAt: "2026-01-15",
    totalSquares: 25,
    completedSquares: 8,
    inProgressSquares: 8,
    blockedSquares: 1,
  },
  {
    id: "companion-core",
    title: "Companion Core",
    description:
      "Building the AI Companion — Ruby Red's always-on Chief of Staff who orchestrates all other avatars and keeps everything running smoothly.",
    ownerName: "Companion Team",
    createdAt: "2026-02-01",
    totalSquares: 25,
    completedSquares: 12,
    inProgressSquares: 6,
    blockedSquares: 0,
  },
  {
    id: "budget-guardian",
    title: "Budget Guardian",
    description:
      "The financial watchdog. Tracks every dollar, forecasts shortfalls before they happen, and replaces the 2 AM mental math.",
    ownerName: "Finance Avatar Team",
    createdAt: "2026-02-10",
    totalSquares: 25,
    completedSquares: 5,
    inProgressSquares: 10,
    blockedSquares: 2,
  },
  {
    id: "benefits-navigator",
    title: "Benefits Navigator",
    description:
      "Monitors all programs Ruby Red qualifies for and auto-applies. Replaces the 47 websites she can't check.",
    ownerName: "Benefits Team",
    createdAt: "2026-02-15",
    totalSquares: 25,
    completedSquares: 3,
    inProgressSquares: 7,
    blockedSquares: 1,
  },
  {
    id: "deal-hunter",
    title: "Deal Hunter",
    description:
      "Scans prices, finds coupons, optimizes the grocery list. Replaces the cognitive cost of comparison shopping.",
    ownerName: "Commerce Team",
    createdAt: "2026-02-20",
    totalSquares: 25,
    completedSquares: 2,
    inProgressSquares: 4,
    blockedSquares: 0,
  },
  {
    id: "advocate-shield",
    title: "Advocate Shield",
    description:
      "Flags predatory practices. Finds free legal resources. Connects to community. Replaces systemic protection she lacks.",
    ownerName: "Advocacy Team",
    createdAt: "2026-03-01",
    totalSquares: 25,
    completedSquares: 1,
    inProgressSquares: 3,
    blockedSquares: 0,
  },
];

// ─── Status Config ──────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  SquareStatus,
  { label: string; color: string; bgClass: string; icon: string }
> = {
  not_started: {
    label: "Not Started",
    color: "#6b7280",
    bgClass: "bg-gray-600/20",
    icon: "○",
  },
  in_progress: {
    label: "In Progress",
    color: "#3b82f6",
    bgClass: "bg-blue-600/20",
    icon: "◐",
  },
  complete: {
    label: "Complete",
    color: "#22c55e",
    bgClass: "bg-green-600/20",
    icon: "●",
  },
  blocked: {
    label: "Blocked",
    color: "#ef4444",
    bgClass: "bg-red-600/20",
    icon: "✕",
  },
};

// ─── Hard Hat Tour Rooms ────────────────────────────────────────────

export interface TourRoom {
  id: number;
  title: string;
  description: string;
  emoji: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const TOUR_ROOMS: TourRoom[] = [
  {
    id: 1,
    title: "The Rooftop Society",
    description:
      "Meet the AI avatars who live on every building's rooftop. The Companion (your Chief of Staff), the Situations Manager (always scanning), and the Voice of Concern (your gut feeling made visible). They work together so you never make impossible choices alone.",
    emoji: "🏙️",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_pixar_6e08dfa0.png",
    imageAlt: "Pixar-style rooftop with AI avatar team",
  },
  {
    id: 2,
    title: "The Five Floors",
    description:
      "Every building has five floors — Infrastructure (the foundation), Data (the intelligence), Operations (the daily work), Community (the connections), and Governance (the rules). Each floor is a row of five tasks on the bingo card.",
    emoji: "🏢",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_city_infographic_9d4e5b1a.png",
    imageAlt: "Bingo City architecture infographic",
  },
  {
    id: 3,
    title: "The Bingo Grid",
    description:
      "25 squares, 5 rows, 5 columns. Each square is something being built for you. Green means done. Blue means in progress. When a full row lights up, that floor of the building is complete. When all 25 are green — that's a bingo.",
    emoji: "🎯",
  },
  {
    id: 4,
    title: "The City Grows",
    description:
      "Each initiative gets its own building. The Ruby Red Maven card, the Budget Guardian, the Benefits Navigator — they're all buildings in your city. As more get built, your city grows. Your support system expands.",
    emoji: "🌆",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_annotated_v2_f85b0177.png",
    imageAlt: "Bingo City annotated architecture",
  },
  {
    id: 5,
    title: "Your City, Your Rules",
    description:
      "This isn't just a tool built for you — it becomes your tool. Swiss-style governance means you have a voice. Your feedback shapes what gets built next. \"It's expensive to be poor\" becomes \"It's free to have a city working for you.\"",
    emoji: "🗳️",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_annotated_d707ba32.png",
    imageAlt: "The Rooftop Society three-zone topology",
  },
];

// ─── Mock tRPC-style Hooks ──────────────────────────────────────────
// Replace these with real tRPC hooks when integrating:
//   import { trpc } from "@/lib/trpc";
//   const { data: cards } = trpc.bingoCards.list.useQuery();

export function useBingoCards() {
  return {
    data: MOCK_CARDS,
    isLoading: false,
    error: null,
  };
}

export function useBingoCard(id: string) {
  const card = MOCK_CARDS.find((c) => c.id === id) ?? MOCK_CARDS[0];
  return {
    data: card,
    isLoading: false,
    error: null,
  };
}

export function useBingoSquares(cardId: string) {
  // For the mock, all cards return the Ruby Red squares
  // In production, this would fetch squares specific to the card
  void cardId;
  return {
    data: RUBY_RED_SQUARES,
    isLoading: false,
    error: null,
  };
}

export function useRooftopAvatars() {
  return {
    data: ROOFTOP_AVATARS,
    isLoading: false,
    error: null,
  };
}

// ─── Image URLs (CDN) ───────────────────────────────────────────────

export const IMAGES = {
  rooftopPixar:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_pixar_6e08dfa0.png",
  annotatedV2:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_annotated_v2_f85b0177.png",
  infographic:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_city_infographic_9d4e5b1a.png",
  rooftopVisual:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_visual_8d91c81a.png",
  rooftopAnnotated:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663303496813/YyBBRSHnB9ctyNzHh2tSKK/bingo_rooftop_annotated_d707ba32.png",
};
