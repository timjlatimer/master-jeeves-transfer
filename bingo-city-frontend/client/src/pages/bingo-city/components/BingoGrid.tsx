/**
 * BingoGrid.tsx — 5x5 Bingo Grid with status colors
 *
 * DESIGN: "Warm Noir" — warm amber highlights, status colors as traffic lights
 * Center square (position 13) gets special treatment with highlighted border
 *
 * shadcn/ui: Badge
 * Icons: none (uses status symbols)
 */

import { Badge } from "@/components/ui/badge";
import {
  FLOORS,
  STATUS_CONFIG,
  type BingoSquare,
  type SquareStatus,
} from "../data/mockData";

interface BingoGridProps {
  squares: BingoSquare[];
  /** Highlighted floor (1-5) — highlights that row */
  activeFloor?: number | null;
  /** Callback when a square is clicked */
  onSquareClick?: (square: BingoSquare) => void;
}

export default function BingoGrid({
  squares,
  activeFloor = null,
  onSquareClick,
}: BingoGridProps) {
  // Sort squares by position
  const sorted = [...squares].sort((a, b) => a.position - b.position);

  // Group into rows of 5 (floor 1 = positions 1-5, etc.)
  const rows: BingoSquare[][] = [];
  for (let i = 0; i < sorted.length; i += 5) {
    rows.push(sorted.slice(i, i + 5));
  }

  return (
    <div className="w-full">
      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center">
        {(Object.entries(STATUS_CONFIG) as [SquareStatus, typeof STATUS_CONFIG.complete][]).map(
          ([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="text-sm"
                style={{ color: config.color }}
              >
                {config.icon}
              </span>
              <span className="text-xs text-white/50">{config.label}</span>
            </div>
          )
        )}
      </div>

      {/* Grid */}
      <div className="space-y-1">
        {rows.map((row, rowIdx) => {
          const floorNum = rowIdx + 1;
          const floor = FLOORS[rowIdx];
          const isActiveRow = activeFloor === floorNum;

          return (
            <div key={floorNum}>
              {/* Floor label */}
              <div className="flex items-center gap-2 mb-1 mt-3 first:mt-0">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: floor.color }}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: floor.color }}
                >
                  {floor.label} {floor.name}
                </span>
              </div>

              {/* Row of 5 cells */}
              <div className="grid grid-cols-5 gap-1">
                {row.map((square) => (
                  <GridCell
                    key={square.id}
                    square={square}
                    floorColor={floor.color}
                    isRowActive={isActiveRow}
                    isCenter={square.position === 13}
                    onClick={onSquareClick ? () => onSquareClick(square) : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GridCell({
  square,
  floorColor,
  isRowActive,
  isCenter,
  onClick,
}: {
  square: BingoSquare;
  floorColor: string;
  isRowActive: boolean;
  isCenter: boolean;
  onClick?: () => void;
}) {
  const status = STATUS_CONFIG[square.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative rounded-md p-2 transition-all duration-200 text-left
        ${onClick ? "hover:brightness-125 cursor-pointer" : "cursor-default"}
        ${isRowActive ? "ring-1 ring-white/20" : ""}
        ${isCenter ? "ring-1" : ""}
      `}
      style={{
        backgroundColor: `${status.color}15`,
        borderLeft: `3px solid ${status.color}`,
        ...(isCenter ? { borderColor: "#ff8833", boxShadow: "0 0 12px rgba(255,136,51,0.15)" } : {}),
      }}
      title={`${square.title} — ${status.label}`}
    >
      {/* Position number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-mono text-[10px] font-bold"
          style={{ color: status.color }}
        >
          {square.position}
        </span>
        <span className="text-xs" style={{ color: status.color }}>
          {status.icon}
        </span>
      </div>

      {/* Title — truncated on small screens */}
      <div className="text-[10px] sm:text-xs text-white/70 leading-tight line-clamp-2">
        {square.title}
      </div>

      {/* Center square badge */}
      {isCenter && (
        <div className="absolute -top-1.5 -right-1.5">
          <Badge
            variant="outline"
            className="text-[8px] px-1 py-0 border-[#ff8833] text-[#ff8833] bg-[#ff8833]/10"
          >
            ★
          </Badge>
        </div>
      )}
    </button>
  );
}
