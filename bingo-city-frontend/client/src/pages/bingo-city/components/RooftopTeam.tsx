/**
 * RooftopTeam.tsx — Rooftop Society avatars
 *
 * DESIGN: "Warm Noir" — emoji avatars in soft-bordered circles with role text
 * Three zones: Left (Professional Team), Center (Angel), Right (Voice of Concern)
 *
 * shadcn/ui: Badge
 * Icons: none (uses emoji)
 */

import { Badge } from "@/components/ui/badge";
import { ROOFTOP_AVATARS, type RooftopAvatar } from "../data/mockData";

interface RooftopTeamProps {
  /** "compact" for welcome page, "full" for card detail */
  variant?: "compact" | "full";
}

export default function RooftopTeam({ variant = "full" }: RooftopTeamProps) {
  const leftZone = ROOFTOP_AVATARS.filter((a) => a.zone === "left");
  const centerZone = ROOFTOP_AVATARS.filter((a) => a.zone === "center");
  const rightZone = ROOFTOP_AVATARS.filter((a) => a.zone === "right");

  if (variant === "compact") {
    // Show just the 3 key avatars for the welcome page
    const keyAvatars = [
      ROOFTOP_AVATARS.find((a) => a.id === "cs")!,
      ROOFTOP_AVATARS.find((a) => a.id === "sm")!,
      ROOFTOP_AVATARS.find((a) => a.id === "voc")!,
    ];

    return (
      <div className="flex items-center justify-center gap-4">
        {keyAvatars.map((avatar) => (
          <CompactAvatar key={avatar.id} avatar={avatar} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bingo-label text-center mb-4">
        ▲ the rooftop society
      </div>

      {/* Three-zone layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Left — Professional Team */}
        <div
          className="rounded-lg p-3"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="bingo-label text-[10px] mb-3 text-blue-400">
            left side — professional team
          </div>
          <div className="flex flex-wrap gap-2">
            {leftZone.map((avatar) => (
              <AvatarChip key={avatar.id} avatar={avatar} />
            ))}
          </div>
        </div>

        {/* Center — Angel */}
        <div
          className="rounded-lg p-3"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="bingo-label text-[10px] mb-3 text-yellow-400">
            center — moral compass
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {centerZone.map((avatar) => (
              <AvatarChip key={avatar.id} avatar={avatar} />
            ))}
          </div>
        </div>

        {/* Right — Voice of Concern */}
        <div
          className="rounded-lg p-3"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="bingo-label text-[10px] mb-3 text-purple-400">
            right corner — the intuition
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {rightZone.map((avatar) => (
              <AvatarChip key={avatar.id} avatar={avatar} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactAvatar({ avatar }: { avatar: RooftopAvatar }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {avatar.emoji}
      </div>
      <span className="text-[10px] font-mono text-white/50 text-center leading-tight">
        {avatar.name}
      </span>
    </div>
  );
}

function AvatarChip({ avatar }: { avatar: RooftopAvatar }) {
  return (
    <div className="flex items-center gap-2 group">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {avatar.emoji}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-white/80 truncate">
          {avatar.name}
        </div>
        <div className="text-[10px] text-white/40 truncate">{avatar.role}</div>
      </div>
    </div>
  );
}
