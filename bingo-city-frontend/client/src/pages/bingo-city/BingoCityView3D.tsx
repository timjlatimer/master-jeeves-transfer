/**
 * BingoCityView3D.tsx — CSS Isometric City (iOS-safe, no WebGL)
 * ==============================================================
 * Pure CSS/SVG isometric city. Works on iOS Safari, Android, all browsers.
 * Replaced Three.js/WebGL which does not work reliably on iOS.
 *
 * Design: Warm Noir + 50% Pixar warmth
 * - Multiple buildings in isometric CSS space
 * - Ruby Red Maven building featured (larger, glowing orange)
 * - Drag/pan to explore the city
 * - Tap any building → info panel → "Enter Building"
 *
 * tRPC hook: Replace buildCityData() with trpc.bingoCards.list.useQuery()
 */
import React, { useState, useRef } from "react";
import { Link } from "wouter";
import { MOCK_CARDS, RUBY_RED_SQUARES } from "./data/mockData";

const BG = "linear-gradient(160deg, #0a0a14 0%, #0c0c1a 40%, #0d0d20 100%)";

const FLOOR_DEFS = [
  { top: "#1e40af", front: "#1e3a8a", side: "#172554", label: "Infrastructure" },
  { top: "#15803d", front: "#14532d", side: "#052e16", label: "Data" },
  { top: "#d97706", front: "#92400e", side: "#451a03", label: "Operations" },
  { top: "#dc2626", front: "#7f1d1d", side: "#450a0a", label: "Community" },
  { top: "#ca8a04", front: "#713f12", side: "#422006", label: "Governance" },
];

interface CityBuilding {
  id: string;
  title: string;
  owner: string;
  progress: number;
  floorProgress: number[];
  featured?: boolean;
  col: number;
  row: number;
}

function buildCityData(): CityBuilding[] {
  const rrFloors = [0, 0, 0, 0, 0];
  RUBY_RED_SQUARES.forEach((sq) => {
    const fi = Math.floor((Number(sq.id) - 1) / 5);
    if (fi >= 0 && fi < 5 && sq.status === "complete") rrFloors[fi]++;
  });
  const rrPct = Math.round(
    (RUBY_RED_SQUARES.filter((s) => s.status === "complete").length / 25) * 100
  );

  const layout = [
    { id: "ruby-red-maven",  col: 1, row: 1, featured: true },
    { id: "budget-guardian", col: 3, row: 0 },
    { id: "benefits-nav",    col: 0, row: 0 },
    { id: "deal-hunter",     col: 3, row: 2 },
    { id: "bill-strategist", col: 0, row: 2 },
    { id: "advocate",        col: 2, row: 3 },
  ];

  return layout.map((pos, i) => {
    if (pos.featured) {
      return {
        id: pos.id,
        title: "Ruby Red Maven",
        owner: "Companion Team",
        progress: rrPct,
        floorProgress: rrFloors,
        featured: true,
        col: pos.col,
        row: pos.row,
      };
    }
    const card = MOCK_CARDS[i % MOCK_CARDS.length];
    const completed = card?.completedSquares ?? 0;
    const total = card?.totalSquares ?? 25;
    const p = total > 0 ? Math.round((completed / total) * 100) : 20 + i * 10;
    const fp = Math.round((p / 100) * 5);
    return {
      id: pos.id,
      title: card?.title ?? `Initiative ${i + 1}`,
      owner: card?.ownerName ?? "Team",
      progress: p,
      floorProgress: [
        Math.min(5, fp + 1),
        Math.min(5, fp),
        Math.max(0, fp - 1),
        Math.max(0, fp - 2),
        Math.max(0, fp - 3),
      ],
      col: pos.col,
      row: pos.row,
    };
  });
}

// ── Single isometric building rendered as SVG ─────────────────────
function IsoBuilding({
  b,
  active,
  onClick,
}: {
  b: CityBuilding;
  active: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const sc = b.featured ? 1.5 : 1.0;
  const fh = 22 * sc;
  const bw = 56 * sc;
  const bd = 44 * sc;
  const cos30 = 0.866;
  const sin30 = 0.5;
  const fw = bw * cos30;
  const fwy = bw * sin30;
  const fd = bd * cos30;
  const fdy = bd * sin30;
  const totalH = FLOOR_DEFS.length * fh;
  const svgW = fw + fd + 24;
  const svgH = totalH + fwy + fdy + 60;
  const ox = fd + 12;
  const oy = svgH - 22;

  function pts(yBase: number) {
    return {
      front: { x: ox,           y: oy - yBase },
      left:  { x: ox - fw,      y: oy - yBase - fwy },
      back:  { x: ox - fw + fd, y: oy - yBase - fwy - fdy },
      right: { x: ox + fd,      y: oy - yBase - fdy },
    };
  }

  const glow = b.featured ? "#ff8833" : "#3b82f6";
  const lit = active || hov;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer",
        transform: lit ? "translateY(-8px)" : "translateY(0)",
        transition: "transform 0.25s ease",
        filter: lit
          ? `drop-shadow(0 0 ${b.featured ? 20 : 10}px ${glow})`
          : "none",
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ overflow: "visible" }}
      >
        {/* Ground glow */}
        <ellipse
          cx={ox + fd / 2 - fw / 2}
          cy={oy + 6}
          rx={fw * 0.9}
          ry={8 * sc}
          fill={glow}
          opacity={lit ? 0.25 : 0.08}
        />

        {/* Floors bottom-up */}
        {FLOOR_DEFS.map((fd_def, fi) => {
          const yBase = fi * fh;
          const yTop = yBase + fh;
          const b0 = pts(yBase);
          const t0 = pts(yTop);
          const prog = b.floorProgress[fi] ?? 0;
          const ratio = prog / 5;

          const frontFace = `${b0.front.x},${b0.front.y} ${b0.left.x},${b0.left.y} ${t0.left.x},${t0.left.y} ${t0.front.x},${t0.front.y}`;
          const rightFace = `${b0.front.x},${b0.front.y} ${b0.right.x},${b0.right.y} ${t0.right.x},${t0.right.y} ${t0.front.x},${t0.front.y}`;
          const topFace = `${t0.front.x},${t0.front.y} ${t0.left.x},${t0.left.y} ${t0.back.x},${t0.back.y} ${t0.right.x},${t0.right.y}`;

          const windows = Array.from({ length: 5 }, (_, wi) => {
            const t = (wi + 0.5) / 5;
            const wx = b0.front.x + (b0.left.x - b0.front.x) * t;
            const wy =
              b0.front.y + (b0.left.y - b0.front.y) * t - fh * 0.5;
            return { wx, wy, done: wi < prog };
          });

          return (
            <g key={fi}>
              <polygon
                points={frontFace}
                fill={fd_def.front}
                opacity={0.85 + ratio * 0.15}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.5"
              />
              <polygon
                points={rightFace}
                fill={fd_def.side}
                opacity={0.7 + ratio * 0.2}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
              <polygon
                points={topFace}
                fill={fd_def.top}
                opacity={0.9}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.5"
              />
              {windows.map((w, wi) => (
                <circle
                  key={wi}
                  cx={w.wx}
                  cy={w.wy}
                  r={2.2 * sc}
                  fill={w.done ? "#22c55e" : "rgba(255,255,255,0.1)"}
                  opacity={w.done ? 1 : 0.5}
                />
              ))}
              <line
                x1={t0.front.x} y1={t0.front.y}
                x2={t0.left.x}  y2={t0.left.y}
                stroke={fd_def.top} strokeWidth={1.5} opacity={0.6}
              />
              <line
                x1={t0.front.x} y1={t0.front.y}
                x2={t0.right.x} y2={t0.right.y}
                stroke={fd_def.top} strokeWidth={1} opacity={0.4}
              />
            </g>
          );
        })}

        {/* Roof cap */}
        {(() => {
          const top = pts(FLOOR_DEFS.length * fh);
          const roofPts = `${top.front.x},${top.front.y} ${top.left.x},${top.left.y} ${top.back.x},${top.back.y} ${top.right.x},${top.right.y}`;
          return (
            <g>
              <polygon
                points={roofPts}
                fill={b.featured ? "#1a1a3e" : "#1a1a2e"}
                stroke={
                  b.featured
                    ? "rgba(255,136,51,0.5)"
                    : "rgba(255,255,255,0.15)"
                }
                strokeWidth="1"
              />
              {b.featured && (
                <>
                  <text x={top.front.x - 6}  y={top.front.y - 8}  fontSize={11} textAnchor="middle">🐕</text>
                  <text x={top.front.x + 7}   y={top.front.y - 5}  fontSize={9}  textAnchor="middle">🦅</text>
                  <text
                    x={top.left.x + (top.front.x - top.left.x) * 0.4}
                    y={top.left.y + (top.front.y - top.left.y) * 0.4 - 8}
                    fontSize={10} textAnchor="middle"
                  >✨</text>
                  <text
                    x={top.right.x + (top.front.x - top.right.x) * 0.4}
                    y={top.right.y + (top.front.y - top.right.y) * 0.4 - 6}
                    fontSize={9} textAnchor="middle"
                  >🐱</text>
                </>
              )}
              {b.featured && (
                <g>
                  <line
                    x1={top.front.x} y1={top.front.y - 2}
                    x2={top.front.x} y2={top.front.y - 22}
                    stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
                  />
                  <circle cx={top.front.x} cy={top.front.y - 24} r={3} fill="#ff8833" opacity={0.9} />
                </g>
              )}
            </g>
          );
        })()}

        {/* Progress bar */}
        <rect
          x={ox - fw * 0.4} y={oy + 10}
          width={fw * 0.8} height={3} rx={1.5}
          fill="rgba(255,255,255,0.08)"
        />
        <rect
          x={ox - fw * 0.4} y={oy + 10}
          width={fw * 0.8 * (b.progress / 100)} height={3} rx={1.5}
          fill={b.featured ? "#ff8833" : "#22c55e"}
        />
      </svg>

      {/* Label */}
      <div style={{ textAlign: "center", marginTop: -2 }}>
        <div
          style={{
            fontSize: b.featured ? 11 : 9,
            fontWeight: b.featured ? 700 : 500,
            color: b.featured ? "#ff8833" : "rgba(255,255,255,0.65)",
            fontFamily: "monospace",
            letterSpacing: "0.04em",
          }}
        >
          {b.featured && "★ "}
          {b.title}
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
          {b.progress}%
        </div>
      </div>
    </div>
  );
}

// ── Main City Page ────────────────────────────────────────────────
export default function BingoCityView3D() {
  const [active, setActive] = useState<string>("ruby-red-maven");
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const buildings = buildCityData();
  const activeB = buildings.find((b) => b.id === active);

  const onMD = (e: React.MouseEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMM = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPanX((p) => p + e.clientX - last.current.x);
    setPanY((p) => p + e.clientY - last.current.y);
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMU = () => { dragging.current = false; };
  const onTS = (e: React.TouchEvent) => {
    dragging.current = true;
    last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTM = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    setPanX((p) => p + e.touches[0].clientX - last.current.x);
    setPanY((p) => p + e.touches[0].clientY - last.current.y);
    last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTE = () => { dragging.current = false; };

  const UNIT = 160;
  const cos30 = 0.866;
  const sin30 = 0.5;
  function gts(col: number, row: number) {
    return {
      x: (col - row) * cos30 * UNIT,
      y: (col + row) * sin30 * UNIT,
    };
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: "white",
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(10,10,20,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/bingo-city" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏙️</span>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>BINGO </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#ff8833" }}>CITY</span>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
                ← BACK
              </div>
            </div>
          </div>
        </Link>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#ff8833", fontWeight: 600 }}>
            THE CITY
          </div>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
            DRAG · TAP · EXPLORE
          </div>
        </div>
      </header>

      {/* City canvas */}
      <div
        onMouseDown={onMD}
        onMouseMove={onMM}
        onMouseUp={onMU}
        onMouseLeave={onMU}
        onTouchStart={onTS}
        onTouchMove={onTM}
        onTouchEnd={onTE}
        style={{
          position: "fixed",
          inset: 0,
          paddingTop: 56,
          cursor: "grab",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 35% at 50% 65%, rgba(255,136,51,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* City grid */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px))`,
            transition: dragging.current ? "none" : "transform 0.08s ease",
          }}
        >
          {buildings.map((b) => {
            const { x, y } = gts(b.col, b.row);
            return (
              <div
                key={b.id}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  zIndex: b.featured ? 10 : 1,
                }}
              >
                <IsoBuilding
                  b={b}
                  active={active === b.id}
                  onClick={() => setActive(b.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Floor legend */}
      <div
        style={{
          position: "fixed",
          top: 68, right: 12,
          zIndex: 50,
          background: "rgba(10,10,20,0.88)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "10px 12px",
        }}
      >
        <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", marginBottom: 6, letterSpacing: "0.1em" }}>
          FLOORS
        </div>
        {FLOOR_DEFS.map((fd, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: fd.top }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              F{i + 1} {fd.label}
            </span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 6, paddingTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Complete</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Not started</span>
          </div>
        </div>
      </div>

      {/* Building count */}
      <div
        style={{
          position: "fixed",
          top: 68, left: 12,
          zIndex: 50,
          background: "rgba(10,10,20,0.88)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,136,51,0.2)",
          borderRadius: 8,
          padding: "8px 12px",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: "#ff8833", fontFamily: "monospace", lineHeight: 1 }}>
          {buildings.length}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
          BUILDINGS
        </div>
      </div>

      {/* Active building panel */}
      {activeB && (
        <div
          style={{
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            zIndex: 100,
            background: "rgba(10,10,20,0.96)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,136,51,0.2)",
            padding: "14px 16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: activeB.featured ? 16 : 14, fontWeight: 700, color: activeB.featured ? "#ff8833" : "white" }}>
                {activeB.featured && "★ "}{activeB.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {activeB.owner} · {activeB.progress}% complete
              </div>
            </div>
            <Link href={`/bingo-city/card/${activeB.id}`}>
              <button
                style={{
                  padding: "10px 18px",
                  background: activeB.featured ? "#ff8833" : "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: 8,
                  color: activeB.featured ? "#0a0a14" : "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Enter Building →
              </button>
            </Link>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {FLOOR_DEFS.map((fd, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${((activeB.floorProgress[i] ?? 0) / 5) * 100}%`,
                      background: fd.top,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginTop: 2, textAlign: "center" }}>
                  F{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      <div
        style={{
          position: "fixed",
          bottom: activeB ? 120 : 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          fontSize: 9,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transition: "bottom 0.3s ease",
        }}
      >
        DRAG TO EXPLORE · TAP A BUILDING · TAP "ENTER BUILDING" TO GO INSIDE
      </div>
    </div>
  );
}
