/**
 * FloorStack.tsx — Mini 5-floor building stack
 *
 * DESIGN: "Warm Noir" — stacked colored bars representing building floors
 * Used in: BingoCityWelcome (large), BingoCityBrowse (mini), BingoCityCard (interactive)
 *
 * shadcn/ui: none (pure CSS/Tailwind)
 * Icons: none (uses emoji)
 */

import { FLOORS, type FloorInfo } from "../data/mockData";

interface FloorStackProps {
  /** "mini" for browse cards, "full" for welcome/detail pages */
  size?: "mini" | "full";
  /** Currently highlighted floor (1-5), used in card detail */
  activeFloor?: number | null;
  /** Callback when a floor is clicked */
  onFloorClick?: (floor: number) => void;
  /** Show floor labels */
  showLabels?: boolean;
  /** Completion data per floor (optional) */
  floorProgress?: Record<number, { complete: number; total: number }>;
}

export default function FloorStack({
  size = "full",
  activeFloor = null,
  onFloorClick,
  showLabels = true,
  floorProgress,
}: FloorStackProps) {
  const isMini = size === "mini";

  // Render floors from top (5-Governance) to bottom (1-Infrastructure)
  const floorsTopDown = [...FLOORS].reverse();

  if (isMini) {
    return (
      <div className="flex flex-col gap-[2px] w-full">
        {floorsTopDown.map((floor) => (
          <MiniFloor key={floor.number} floor={floor} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Rooftop indicator */}
      <div className="flex items-center justify-center mb-2">
        <span className="bingo-label text-[10px]">rooftop ▲</span>
      </div>

      {/* Building body */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {floorsTopDown.map((floor) => (
          <FullFloor
            key={floor.number}
            floor={floor}
            isActive={activeFloor === floor.number}
            onClick={onFloorClick ? () => onFloorClick(floor.number) : undefined}
            showLabels={showLabels}
            progress={floorProgress?.[floor.number]}
          />
        ))}
      </div>

      {/* Foundation */}
      <div
        className="h-2 rounded-b-lg mt-0"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
    </div>
  );
}

function MiniFloor({ floor }: { floor: FloorInfo }) {
  return (
    <div
      className="h-2 rounded-sm transition-all duration-200"
      style={{ backgroundColor: floor.color, opacity: 0.7 }}
      title={`${floor.label} — ${floor.name}`}
    />
  );
}

function FullFloor({
  floor,
  isActive,
  onClick,
  showLabels,
  progress,
}: {
  floor: FloorInfo;
  isActive: boolean;
  onClick?: () => void;
  showLabels: boolean;
  progress?: { complete: number; total: number };
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 transition-all duration-200
        ${onClick ? "hover:brightness-125 cursor-pointer" : "cursor-default"}
        ${isActive ? "ring-1 ring-white/20 brightness-125" : ""}
      `}
      style={{
        backgroundColor: `${floor.color}22`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Floor color indicator */}
      <div
        className="w-3 h-8 rounded-sm shrink-0"
        style={{ backgroundColor: floor.color }}
      />

      {showLabels && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-mono text-xs font-bold" style={{ color: floor.color }}>
            {floor.label}
          </span>
          <span className="text-sm text-white/70 truncate">{floor.name}</span>
          <span className="text-base">{floor.emoji}</span>
        </div>
      )}

      {progress && (
        <span className="text-xs font-mono text-white/40 shrink-0">
          {progress.complete}/{progress.total}
        </span>
      )}
    </button>
  );
}
