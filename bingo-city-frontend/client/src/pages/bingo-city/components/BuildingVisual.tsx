/**
 * BuildingVisual.tsx — Full building visualization with rooftop + floors
 *
 * DESIGN: "Warm Noir" — CSS-drawn building with glowing floors and rooftop avatars
 * This is the hero visual that communicates "5-storey building with AI team on top"
 *
 * shadcn/ui: none (pure CSS/SVG)
 * Icons: none (uses emoji + CSS shapes)
 */

import { FLOORS, ROOFTOP_AVATARS, type BingoSquare } from "../data/mockData";
import FloorStack from "./FloorStack";
import RooftopTeam from "./RooftopTeam";

interface BuildingVisualProps {
  squares?: BingoSquare[];
  activeFloor?: number | null;
  onFloorClick?: (floor: number) => void;
  /** "hero" for welcome page, "detail" for card detail */
  variant?: "hero" | "detail";
}

export default function BuildingVisual({
  squares,
  activeFloor = null,
  onFloorClick,
  variant = "detail",
}: BuildingVisualProps) {
  // Calculate floor progress from squares
  const floorProgress: Record<number, { complete: number; total: number }> = {};
  if (squares) {
    for (const floor of FLOORS) {
      const floorSquares = squares.filter((s) => s.floor === floor.number);
      floorProgress[floor.number] = {
        complete: floorSquares.filter((s) => s.status === "complete").length,
        total: floorSquares.length,
      };
    }
  }

  if (variant === "hero") {
    return <HeroBuilding />;
  }

  return (
    <div className="w-full">
      {/* Rooftop */}
      <div
        className="rounded-t-xl p-4"
        style={{
          background: "linear-gradient(180deg, rgba(255,136,51,0.08) 0%, rgba(255,136,51,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
        }}
      >
        <div className="bingo-label text-[10px] text-center mb-3">▲ rooftop society</div>
        <RooftopTeam variant="compact" />
      </div>

      {/* Building body */}
      <FloorStack
        size="full"
        activeFloor={activeFloor}
        onFloorClick={onFloorClick}
        showLabels
        floorProgress={floorProgress}
      />
    </div>
  );
}

/**
 * HeroBuilding — Large CSS-drawn building for the welcome page
 * Shows the concept visually: 5 colored floors + rooftop avatars
 */
function HeroBuilding() {
  const keyAvatars = [
    { emoji: "🐕", label: "Companion" },
    { emoji: "🦅", label: "Situations Mgr" },
    { emoji: "🐱", label: "Voice of Concern" },
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Sky / stars */}
      <div className="relative">
        {/* Rooftop platform */}
        <div
          className="rounded-t-xl px-4 py-5 relative"
          style={{
            background: "linear-gradient(180deg, rgba(255,136,51,0.12) 0%, rgba(255,136,51,0.04) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
          }}
        >
          {/* Antenna */}
          <div className="flex justify-center mb-3">
            <div className="w-px h-6 bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff8833] -ml-[2.5px] mt-0 animate-pulse" />
          </div>

          {/* Avatars */}
          <div className="flex items-end justify-center gap-5">
            {keyAvatars.map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 0 16px rgba(255,136,51,0.1)",
                  }}
                >
                  {a.emoji}
                </div>
                <span className="text-[9px] font-mono text-white/40 text-center leading-tight whitespace-nowrap">
                  {a.label}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-2">
            <span className="bingo-label text-[9px]">rooftop society</span>
          </div>
        </div>

        {/* Building floors */}
        <div
          className="overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[...FLOORS].reverse().map((floor) => (
            <div
              key={floor.number}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                backgroundColor: `${floor.color}18`,
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              <div
                className="w-2.5 h-6 rounded-sm"
                style={{ backgroundColor: floor.color }}
              />
              <span className="font-mono text-[10px] font-bold" style={{ color: floor.color }}>
                {floor.label}
              </span>
              <span className="text-xs text-white/50">{floor.name}</span>
              <span className="ml-auto text-sm">{floor.emoji}</span>
            </div>
          ))}
        </div>

        {/* Foundation */}
        <div
          className="h-3 rounded-b-lg"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderTop: "none",
          }}
        />

        {/* Ground shadow */}
        <div
          className="h-2 mx-4 rounded-full mt-1"
          style={{
            background: "radial-gradient(ellipse, rgba(255,136,51,0.08) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
