/**
 * StatsStrip.tsx — Stats strip at bottom of welcome page
 *
 * DESIGN: "Warm Noir" — subtle horizontal strip with key numbers
 * Shows: buildings count, bingo squares, avatar roles, floors per building
 *
 * shadcn/ui: none
 * Icons: none
 */

import { MOCK_CARDS, ROOFTOP_AVATARS } from "../data/mockData";

export default function StatsStrip() {
  const stats = [
    {
      value: MOCK_CARDS.length,
      label: "Buildings",
      emoji: "🏢",
    },
    {
      value: MOCK_CARDS.length * 25,
      label: "Bingo Squares",
      emoji: "🎯",
    },
    {
      value: ROOFTOP_AVATARS.length,
      label: "Avatar Roles",
      emoji: "🤖",
    },
    {
      value: 5,
      label: "Floors Each",
      emoji: "🏗️",
    },
  ];

  return (
    <div
      className="w-full py-4 px-2"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white/90 font-mono">
              {stat.value}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/40">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
