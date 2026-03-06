/**
 * IsometricBuilding.tsx
 * =====================
 * 50% Pixar-level isometric CSS office building.
 * - 5 color-coded glass floors
 * - Each floor's windows ARE the bingo squares (5 per floor)
 * - Window glow = status (green/blue/gray/red)
 * - Click any window → onSquareClick(squareIndex)
 * - Rooftop team: avatars visible on top
 * - teamOnRoof prop: true = team on rooftop, false = team on floors
 *
 * Design: Warm Noir + 50% Pixar warmth
 * Colors: Blue F1, Green F2, Orange F3, Red F4, Gold F5
 */

import React, { useState } from "react";
import type { BingoSquare } from "../data/mockData";

interface IsometricBuildingProps {
  squares: BingoSquare[];
  teamOnRoof: boolean;
  onSquareClick?: (square: BingoSquare) => void;
  onFloorClick?: (floorIndex: number) => void;
  activeFloor?: number | null;
  compact?: boolean;
}

const FLOORS = [
  { id: 1, label: "Infrastructure", emoji: "🏗️", color: "#1e40af", glow: "#3b82f6", light: "#60a5fa", row: 0 },
  { id: 2, label: "Data",           emoji: "📊", color: "#15803d", glow: "#22c55e", light: "#4ade80", row: 1 },
  { id: 3, label: "Operations",     emoji: "⚙️", color: "#d97706", glow: "#f59e0b", light: "#fbbf24", row: 2 },
  { id: 4, label: "Community",      emoji: "🤝", color: "#dc2626", glow: "#ef4444", light: "#f87171", row: 3 },
  { id: 5, label: "Governance",     emoji: "👑", color: "#ca8a04", glow: "#eab308", light: "#fde047", row: 4 },
];

const AVATARS = [
  { emoji: "🐕", name: "Companion",       role: "Chief of Staff",     zone: "left",   color: "#f59e0b" },
  { emoji: "🦅", name: "Situations Mgr",  role: "Always scanning",    zone: "left",   color: "#3b82f6" },
  { emoji: "🦁", name: "Project Mgr",     role: "Gets things done",   zone: "left",   color: "#f97316" },
  { emoji: "🦉", name: "Source of Truth", role: "Guards accuracy",    zone: "left",   color: "#8b5cf6" },
  { emoji: "🐻", name: "I Got a Guy",     role: "Knows who to call",  zone: "left",   color: "#10b981" },
  { emoji: "🐱", name: "Voice of Concern",role: "Your gut feeling",   zone: "right",  color: "#a855f7" },
  { emoji: "✨", name: "Angel",           role: "Moral compass",      zone: "center", color: "#fbbf24" },
];

const STATUS_GLOW: Record<string, string> = {
  complete:    "#22c55e",
  in_progress: "#3b82f6",
  not_started: "rgba(255,255,255,0.08)",
  blocked:     "#ef4444",
};

const STATUS_BORDER: Record<string, string> = {
  complete:    "#22c55e",
  in_progress: "#60a5fa",
  not_started: "rgba(255,255,255,0.12)",
  blocked:     "#ef4444",
};

export default function IsometricBuilding({
  squares,
  teamOnRoof,
  onSquareClick,
  onFloorClick,
  activeFloor,
  compact = false,
}: IsometricBuildingProps) {
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);

  // Floors rendered bottom-up (F1 at bottom, F5 at top)
  const floorsBottomUp = [...FLOORS].reverse();

  const getSquaresForFloor = (floorId: number) => {
    // Floor 1 = squares 1-5, Floor 2 = 6-10, etc.
    const start = (floorId - 1) * 5;
    return squares.slice(start, start + 5);
  };

  const floorH = compact ? 52 : 72;
  const buildingW = compact ? 320 : 440;
  const rooftopH = compact ? 80 : 110;
  const totalH = FLOORS.length * floorH + rooftopH + 20;

  return (
    <div
      style={{
        width: buildingW,
        maxWidth: "100%",
        margin: "0 auto",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* ── BUILDING WRAPPER with isometric tilt ── */}
      <div
        style={{
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
          background: "#0c0c1a",
          position: "relative",
        }}
      >
        {/* ── ROOFTOP ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            borderBottom: "2px solid rgba(255,255,255,0.1)",
            padding: compact ? "12px 16px 8px" : "16px 20px 12px",
            position: "relative",
            minHeight: rooftopH,
          }}
        >
          {/* Rooftop label */}
          <div style={{
            fontSize: 9,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}>
            ▲ Rooftop Society
          </div>

          {/* Stanchion / inner ring meeting — lower-left, backs toward viewer */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: compact ? 6 : 10,
            flexWrap: "wrap",
          }}>
            {/* LEFT ZONE — Professional Team in stanchion */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: compact ? 4 : 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: compact ? "6px 8px" : "8px 12px",
              position: "relative",
            }}>
              {/* Stanchion rope line */}
              <div style={{
                position: "absolute",
                top: -1,
                left: 8,
                right: 8,
                height: 2,
                background: "linear-gradient(90deg, #ca8a04, #f59e0b, #ca8a04)",
                borderRadius: 1,
              }} />
              <div style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "#f59e0b",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                position: "absolute",
                top: -14,
                left: 8,
              }}>Inner Ring</div>

              {AVATARS.filter(a => a.zone === "left").map((av, i) => (
                <AvatarPin
                  key={av.name}
                  avatar={av}
                  visible={teamOnRoof}
                  compact={compact}
                  delay={i * 60}
                  facingAway={true}
                />
              ))}
            </div>

            {/* SPACER */}
            <div style={{ flex: 1 }} />

            {/* RIGHT CORNER — Voice of Concern, alone on bench */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}>
              <AvatarPin
                avatar={AVATARS.find(a => a.zone === "right")!}
                visible={teamOnRoof}
                compact={compact}
                delay={300}
                facingAway={false}
              />
              {/* Bench */}
              <div style={{
                width: compact ? 28 : 36,
                height: 4,
                background: "#78350f",
                borderRadius: 2,
                marginTop: 2,
              }} />
            </div>

            {/* CENTER — Angel, ethereal, floating */}
            <div style={{
              position: "absolute",
              top: compact ? 16 : 20,
              left: "50%",
              transform: "translateX(-50%)",
              opacity: teamOnRoof ? 0.85 : 0,
              transition: "opacity 0.6s ease",
              pointerEvents: "none",
            }}>
              <div style={{
                fontSize: compact ? 20 : 28,
                filter: "drop-shadow(0 0 12px rgba(255,255,200,0.9))",
                animation: "float 3s ease-in-out infinite",
              }}>✨</div>
            </div>
          </div>

          {/* Team status indicator */}
          {!teamOnRoof && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(10,10,20,0.7)",
              borderRadius: 0,
            }}>
              <span style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>Team working on floors ↓</span>
            </div>
          )}
        </div>

        {/* ── FLOORS (top = F5, bottom = F1) ── */}
        {floorsBottomUp.map((floor, fi) => {
          const floorSquares = getSquaresForFloor(floor.id);
          const isActive = activeFloor === floor.id || hoveredFloor === floor.id;
          const floorAvatarZone = !teamOnRoof ? AVATARS.filter((_, i) => i === fi % AVATARS.length) : [];

          return (
            <div
              key={floor.id}
              onClick={() => onFloorClick?.(floor.id)}
              onMouseEnter={() => setHoveredFloor(floor.id)}
              onMouseLeave={() => setHoveredFloor(null)}
              style={{
                height: floorH,
                background: isActive
                  ? `linear-gradient(90deg, ${floor.color}30, ${floor.color}18, ${floor.color}30)`
                  : `linear-gradient(90deg, ${floor.color}20, ${floor.color}10, ${floor.color}20)`,
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                borderTop: fi === 0 ? "none" : `1px solid rgba(255,255,255,0.04)`,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                gap: 8,
                cursor: "pointer",
                transition: "background 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Floor color accent bar on left */}
              <div style={{
                width: 4,
                height: "70%",
                background: floor.color,
                borderRadius: 2,
                boxShadow: `0 0 8px ${floor.glow}`,
                flexShrink: 0,
              }} />

              {/* Floor label */}
              <div style={{
                width: compact ? 70 : 90,
                flexShrink: 0,
              }}>
                <div style={{
                  fontSize: compact ? 8 : 9,
                  fontFamily: "monospace",
                  color: floor.light,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}>
                  F{floor.id} {floor.emoji}
                </div>
                <div style={{
                  fontSize: compact ? 9 : 10,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  marginTop: 1,
                }}>
                  {floor.label}
                </div>
              </div>

              {/* Windows = Bingo Squares */}
              <div style={{
                display: "flex",
                gap: compact ? 4 : 6,
                flex: 1,
                justifyContent: "flex-end",
              }}>
                {floorSquares.map((sq, si) => {
                  const isHovered = hoveredSquare === sq.position;
                  const isCenter = sq.position === 13;
                  return (
                    <button
                      key={sq.position}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSquareClick?.(sq);
                      }}
                      onMouseEnter={() => setHoveredSquare(sq.position)}
                      onMouseLeave={() => setHoveredSquare(null)}
                      title={`${sq.title} — ${sq.status.replace("_", " ")}`}
                      style={{
                        width: compact ? 36 : 52,
                        height: compact ? 32 : 44,
                        background: isHovered
                          ? `${STATUS_GLOW[sq.status]}40`
                          : `${STATUS_GLOW[sq.status]}20`,
                        border: `1.5px solid ${isCenter ? "#f59e0b" : STATUS_BORDER[sq.status]}`,
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        transition: "all 0.15s ease",
                        boxShadow: isHovered
                          ? `0 0 12px ${STATUS_GLOW[sq.status]}60, inset 0 0 8px ${STATUS_GLOW[sq.status]}20`
                          : sq.status !== "not_started"
                            ? `0 0 6px ${STATUS_GLOW[sq.status]}30`
                            : "none",
                        transform: isHovered ? "scale(1.08)" : "scale(1)",
                        position: "relative",
                        overflow: "hidden",
                        padding: 0,
                      }}
                    >
                      {/* Window glass reflection */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: "40%",
                        height: "40%",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
                        borderRadius: "3px 0 0 0",
                        pointerEvents: "none",
                      }} />

                      {/* Status dot */}
                      <div style={{
                        width: compact ? 6 : 8,
                        height: compact ? 6 : 8,
                        borderRadius: "50%",
                        background: STATUS_GLOW[sq.status],
                        boxShadow: sq.status !== "not_started" ? `0 0 6px ${STATUS_GLOW[sq.status]}` : "none",
                        flexShrink: 0,
                      }} />

                      {/* Square number */}
                      <div style={{
                        fontSize: compact ? 7 : 8,
                        fontFamily: "monospace",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1,
                      }}>
                        {sq.position}{isCenter ? "★" : ""}
                      </div>

                      {/* Avatar on floor when team is downstairs */}
                      {!teamOnRoof && si === 2 && (
                        <div style={{
                          position: "absolute",
                          bottom: 1,
                          fontSize: 8,
                          opacity: 0.7,
                          animation: "float 2s ease-in-out infinite",
                        }}>
                          {AVATARS[floor.id - 1]?.emoji || "👤"}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Floor progress indicator */}
              <div style={{
                width: compact ? 24 : 32,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}>
                <div style={{
                  fontSize: compact ? 8 : 9,
                  fontFamily: "monospace",
                  color: floor.light,
                  opacity: 0.8,
                }}>
                  {floorSquares.filter(s => s.status === "complete").length}/5
                </div>
                <div style={{
                  width: "100%",
                  height: 3,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${(floorSquares.filter(s => s.status === "complete").length / 5) * 100}%`,
                    height: "100%",
                    background: floor.glow,
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>
          );
        })}

        {/* ── BUILDING BASE / FOUNDATION ── */}
        <div style={{
          height: 12,
          background: "linear-gradient(180deg, #0a0a14 0%, #060610 100%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }} />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Avatar Pin Component ── */
interface AvatarPinProps {
  avatar: typeof AVATARS[0];
  visible: boolean;
  compact: boolean;
  delay: number;
  facingAway: boolean;
}

function AvatarPin({ avatar, visible, compact, delay, facingAway }: AvatarPinProps) {
  const [hovered, setHovered] = useState(false);
  const size = compact ? 28 : 38;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar bubble */}
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${avatar.color}60, ${avatar.color}20)`,
        border: `2px solid ${avatar.color}80`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: compact ? 14 : 20,
        boxShadow: hovered
          ? `0 0 16px ${avatar.color}80, 0 4px 12px rgba(0,0,0,0.4)`
          : `0 0 8px ${avatar.color}40, 0 2px 6px rgba(0,0,0,0.3)`,
        transition: "all 0.2s ease",
        transform: facingAway ? "scaleX(-1)" : "scaleX(1)",
        animation: "float 3s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}>
        {avatar.emoji}
      </div>

      {/* Name label */}
      <div style={{
        fontSize: compact ? 7 : 8,
        fontFamily: "monospace",
        color: "rgba(255,255,255,0.6)",
        textAlign: "center",
        letterSpacing: "0.05em",
        lineHeight: 1.2,
        maxWidth: size + 8,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {avatar.name.split(" ")[0]}
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: 6,
          background: "rgba(10,10,20,0.95)",
          border: `1px solid ${avatar.color}60`,
          borderRadius: 8,
          padding: "6px 10px",
          whiteSpace: "nowrap",
          zIndex: 100,
          boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 8px ${avatar.color}30`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: avatar.color }}>{avatar.name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{avatar.role}</div>
        </div>
      )}
    </div>
  );
}
