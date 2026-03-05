import { useState, useMemo } from "react";
import { generateDefaultBingoGrid, BingoCell, BUILDING_FLOORS } from "@/lib/data";

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  empty: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.5)" },
  active: { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#3B82F6" },
  complete: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", text: "#22C55E" },
  blocked: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#EF4444" },
};

export default function BingoGrid({ grid, onCellClick }: {
  grid: BingoCell[];
  onCellClick: (cell: BingoCell) => void;
}) {
  const headers = ["B", "I", "N", "G", "O"];

  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="grid grid-cols-5 gap-1 mb-1">
        {headers.map((h, i) => (
          <div key={h} className="text-center py-2 rounded-t text-sm font-bold tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif", color: BUILDING_FLOORS[i]?.hexColor || "#fff" }}>
            {h}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-5 gap-1">
        {grid.map((cell) => {
          const colors = STATUS_COLORS[cell.status];
          const floorColor = BUILDING_FLOORS[cell.row]?.hexColor || "#fff";
          return (
            <button
              key={cell.id}
              onClick={() => onCellClick(cell)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all hover:scale-105 active:scale-95"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span className="text-[10px] md:text-xs font-medium text-center leading-tight" style={{ color: colors.text }}>
                {cell.label}
              </span>
              {cell.status === "complete" && (
                <span className="text-[10px] mt-0.5" style={{ color: "#22C55E" }}>&#10003;</span>
              )}
              {cell.status === "active" && (
                <span className="w-1.5 h-1.5 rounded-full mt-0.5 animate-pulse" style={{ background: "#3B82F6" }}></span>
              )}
            </button>
          );
        })}
      </div>
      {/* Row labels */}
      <div className="mt-2 flex gap-2 flex-wrap justify-center">
        {BUILDING_FLOORS.map(f => (
          <span key={f.level} className="text-[9px] px-2 py-0.5 rounded" style={{ background: f.hexColor + "22", color: f.hexColor }}>
            Row {f.level}: {f.name}
          </span>
        ))}
      </div>
    </div>
  );
}
