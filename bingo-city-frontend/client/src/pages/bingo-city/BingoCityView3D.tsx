/**
 * BingoCityView3D.tsx — The 3D City Experience
 *
 * A fully navigable 3D scene using React Three Fiber + Drei.
 * - Orbit controls: zoom, pan, rotate, touch support
 * - 6 Bingo Card buildings arranged in a city grid
 * - Each building: 5 color-coded glass floors + rooftop
 * - Ruby Red Maven building: featured, glowing orange, larger
 * - Click any building → zoom in + show card detail panel
 * - Floor windows glow based on completion status
 * - Animated floating avatars on rooftops
 * - City ground plane with grid lines
 *
 * Design: Warm Noir + 50% Pixar warmth
 * Engine: React Three Fiber + Drei
 *
 * tRPC integration: Replace useBingoCards() with trpc.bingoCards.list.useQuery()
 */

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Float,
  Environment,
  Stars,
  Sparkles as ThreeSparkles,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { Link } from "wouter";
import { ArrowLeft, ZoomIn, RotateCcw, Building2 } from "lucide-react";
import { useBingoCards, RUBY_RED_SQUARES } from "./data/mockData";

// ─── Floor color palette ─────────────────────────────────────────────
const FLOOR_COLORS = [
  "#1e40af", // F1 Infrastructure — blue
  "#15803d", // F2 Data — green
  "#d97706", // F3 Operations — orange
  "#dc2626", // F4 Community — red
  "#ca8a04", // F5 Governance — gold
];

const FLOOR_NAMES = ["Infrastructure", "Data", "Operations", "Community", "Governance"];
const FLOOR_EMOJIS = ["🏗️", "📊", "⚙️", "🤝", "👑"];

// ─── City layout positions ─────────────────────────────────────────
const CITY_POSITIONS: [number, number][] = [
  [0, 0],      // Ruby Red Maven — center featured
  [-6, -5],    // Companion Core
  [6, -5],     // Budget Guardian
  [-6, 5],     // Benefits Navigator
  [6, 5],      // Deal Hunter
  [0, -10],    // Advocate Shield
];

// ─── Single Building Component ────────────────────────────────────
interface BuildingProps {
  position: [number, number, number];
  cardId: string;
  title: string;
  completion: number; // 0-100
  isFeatured: boolean;
  floorProgress: number[]; // 0-5 per floor
  onClick: () => void;
  isSelected: boolean;
}

function Building({
  position,
  cardId,
  title,
  completion,
  isFeatured,
  floorProgress,
  onClick,
  isSelected,
}: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const floorHeight = 0.7;
  const buildingWidth = isFeatured ? 3.2 : 2.4;
  const buildingDepth = isFeatured ? 3.2 : 2.4;
  const totalFloors = 5;

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle hover bob
    if (hovered || isSelected) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        0.05
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* ── Ground shadow / glow ── */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[buildingWidth + 2, buildingDepth + 2]} />
        <meshBasicMaterial
          color={isFeatured ? "#ff8833" : "#3b82f6"}
          transparent
          opacity={hovered || isSelected ? 0.15 : 0.06}
        />
      </mesh>

      {/* ── Building floors (bottom = F1, top = F5) ── */}
      {FLOOR_COLORS.map((color, fi) => {
        const y = fi * floorHeight + floorHeight / 2;
        const progress = floorProgress[fi] || 0;
        const glowIntensity = progress / 5;

        return (
          <group key={fi} position={[0, y, 0]}>
            {/* Floor body */}
            <mesh>
              <boxGeometry args={[buildingWidth, floorHeight - 0.04, buildingDepth]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.75 + glowIntensity * 0.2}
                roughness={0.1}
                metalness={0.3}
                emissive={color}
                emissiveIntensity={glowIntensity * 0.4 + (hovered ? 0.1 : 0)}
              />
            </mesh>

            {/* Glass window panels — front face */}
            {[0, 1, 2, 3, 4].map((wi) => {
              const wx = (wi - 2) * (buildingWidth / 5.5);
              const windowStatus = wi < progress ? "complete" : wi === Math.floor(progress) ? "in_progress" : "not_started";
              const windowColor = windowStatus === "complete" ? "#22c55e" : windowStatus === "in_progress" ? "#60a5fa" : "#ffffff";
              const windowOpacity = windowStatus === "complete" ? 0.7 : windowStatus === "in_progress" ? 0.4 : 0.08;

              return (
                <mesh key={wi} position={[wx, 0, buildingDepth / 2 + 0.01]}>
                  <planeGeometry args={[buildingWidth / 6.5, floorHeight * 0.65]} />
                  <meshBasicMaterial
                    color={windowColor}
                    transparent
                    opacity={windowOpacity}
                  />
                </mesh>
              );
            })}

            {/* Floor edge glow strip */}
            <mesh position={[0, floorHeight / 2, 0]}>
              <boxGeometry args={[buildingWidth + 0.05, 0.04, buildingDepth + 0.05]} />
              <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* ── Rooftop ── */}
      <group position={[0, totalFloors * floorHeight + 0.15, 0]}>
        {/* Rooftop deck */}
        <mesh>
          <boxGeometry args={[buildingWidth + 0.1, 0.1, buildingDepth + 0.1]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Rooftop railing */}
        {[
          [0, buildingDepth / 2],
          [0, -buildingDepth / 2],
          [buildingWidth / 2, 0],
          [-buildingWidth / 2, 0],
        ].map(([rx, rz], ri) => (
          <mesh key={ri} position={[rx, 0.2, rz]}>
            <boxGeometry args={[ri < 2 ? buildingWidth : 0.05, 0.3, ri < 2 ? 0.05 : buildingDepth]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
          </mesh>
        ))}

        {/* Floating avatar emojis on rooftop */}
        {isFeatured && (
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
            <Text
              position={[-0.8, 0.6, 0]}
              fontSize={0.4}
              anchorX="center"
              anchorY="middle"
            >
              🐕
            </Text>
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.35}
              anchorX="center"
              anchorY="middle"
            >
              ✨
            </Text>
            <Text
              position={[0.8, 0.6, 0.3]}
              fontSize={0.4}
              anchorX="center"
              anchorY="middle"
            >
              🐱
            </Text>
          </Float>
        )}

        {/* Antenna for featured building */}
        {isFeatured && (
          <group position={[0, 0.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#ff8833" />
            </mesh>
            {/* Pulsing light */}
            <pointLight color="#ff8833" intensity={2} distance={3} />
          </group>
        )}

        {/* Building name label */}
        <Html
          position={[0, 0.8, buildingDepth / 2 + 0.3]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(10,10,20,0.9)",
              border: `1px solid ${isFeatured ? "#ff8833" : "rgba(255,255,255,0.15)"}`,
              borderRadius: 6,
              padding: "3px 8px",
              whiteSpace: "nowrap",
              fontSize: 10,
              fontFamily: "monospace",
              color: isFeatured ? "#ff8833" : "rgba(255,255,255,0.7)",
              letterSpacing: "0.05em",
              boxShadow: isFeatured ? "0 0 12px rgba(255,136,51,0.3)" : "none",
            }}
          >
            {title}
          </div>
        </Html>
      </group>

      {/* ── Selection/hover outline ── */}
      {(hovered || isSelected) && (
        <mesh position={[0, (totalFloors * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.15, totalFloors * floorHeight + 0.15, buildingDepth + 0.15]} />
          <meshBasicMaterial
            color={isFeatured ? "#ff8833" : "#60a5fa"}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Floor labels on hover */}
      {hovered && (
        <Html
          position={[-buildingWidth / 2 - 0.5, (totalFloors * floorHeight) / 2, 0]}
          center={false}
          distanceFactor={6}
          style={{ pointerEvents: "none" }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column-reverse",
            gap: 2,
          }}>
            {FLOOR_COLORS.map((color, fi) => (
              <div key={fi} style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 9,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.7)",
                background: "rgba(10,10,20,0.8)",
                padding: "2px 6px",
                borderRadius: 3,
                borderLeft: `2px solid ${color}`,
                whiteSpace: "nowrap",
              }}>
                <span style={{ color }}>{FLOOR_EMOJIS[fi]}</span>
                {floorProgress[fi]}/5
              </div>
            ))}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── City Ground Plane ────────────────────────────────────────────
function CityGround() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#06060f"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[60, 30, "#1a1a3e", "#0d0d20"]}
        position={[0, -0.09, 0]}
      />

      {/* City name on ground */}
      <Text
        position={[0, -0.08, 14]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.2}
        color="#ff8833"
        anchorX="center"
        anchorY="middle"
        font={undefined}
        characters="BINGO CITY"
      >
        BINGO CITY
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, -0.08, 16]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.4}
        color="rgba(255,255,255,0.2)"
        anchorX="center"
        anchorY="middle"
      >
        A city working for you
      </Text>
    </group>
  );
}

// ─── Camera controller for zoom-to-building ──────────────────────
function CameraController({
  target,
  onReady,
}: {
  target: [number, number, number] | null;
  onReady: (controls: any) => void;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      onReady(controlsRef.current);
    }
  }, [onReady]);

  useFrame(() => {
    if (!target || !controlsRef.current) return;
    // Smoothly move camera target toward selected building
    const targetVec = new THREE.Vector3(...target);
    controlsRef.current.target.lerp(targetVec, 0.05);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={0.1}
    />
  );
}

// ─── Main 3D City Scene ───────────────────────────────────────────
function CityScene({
  cards,
  selectedId,
  onSelect,
}: {
  cards: any[];
  selectedId: string | null;
  onSelect: (id: string, pos: [number, number, number]) => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        color="#fff8f0"
      />
      <pointLight position={[-10, 15, -10]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#ff8833" />

      {/* Stars background */}
      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade />

      {/* Atmospheric sparkles */}
      <ThreeSparkles
        count={80}
        scale={[30, 15, 30]}
        size={1.5}
        speed={0.3}
        color="#ff8833"
        opacity={0.3}
      />

      {/* Ground */}
      <CityGround />

      {/* Buildings */}
      {cards.map((card, i) => {
        const [px, pz] = CITY_POSITIONS[i] || [i * 7, 0];
        const pos: [number, number, number] = [px, 0, pz];
        // Use real squares for Ruby Red Maven, estimate for others
        const squares = card.id === "ruby-red-maven" ? RUBY_RED_SQUARES : null;
        const completion = Math.round((card.completedSquares / card.totalSquares) * 100);
        const floorProgress = squares
          ? [
              squares.filter((s) => s.floor === 1 && s.status === "complete").length,
              squares.filter((s) => s.floor === 2 && s.status === "complete").length,
              squares.filter((s) => s.floor === 3 && s.status === "complete").length,
              squares.filter((s) => s.floor === 4 && s.status === "complete").length,
              squares.filter((s) => s.floor === 5 && s.status === "complete").length,
            ]
          : [
              Math.round((completion / 100) * 5 * 1.2),
              Math.round((completion / 100) * 5 * 1.0),
              Math.round((completion / 100) * 5 * 0.8),
              Math.round((completion / 100) * 5 * 0.5),
              Math.round((completion / 100) * 5 * 0.2),
            ].map((v) => Math.min(5, v));

        return (
          <Building
            key={card.id}
            position={pos}
            cardId={card.id}
            title={card.title}
            completion={Math.round((card.completedSquares / card.totalSquares) * 100)}
            isFeatured={card.id === "ruby-red-maven"}
            floorProgress={floorProgress}
            onClick={() => onSelect(card.id, pos)}
            isSelected={selectedId === card.id}
          />
        );
      })}
    </>
  );
}

// ─── Selected Building Panel ──────────────────────────────────────
function SelectedBuildingPanel({
  card,
  onClose,
}: {
  card: any;
  onClose: () => void;
}) {
  const completion = Math.round((card.completedSquares / card.totalSquares) * 100);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(420px, calc(100vw - 32px))",
        background: "rgba(10,10,20,0.95)",
        border: `1px solid ${card.id === "ruby-red-maven" ? "#ff8833" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 16,
        padding: "16px 20px",
        backdropFilter: "blur(20px)",
        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${card.id === "ruby-red-maven" ? "rgba(255,136,51,0.15)" : "rgba(59,130,246,0.1)"}`,
        zIndex: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
            Selected Building
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: card.id === "ruby-red-maven" ? "#ff8833" : "white" }}>
            {card.title}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>Overall Progress</span>
          <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", fontWeight: 700 }}>{completion}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${completion}%`,
            height: "100%",
            background: card.id === "ruby-red-maven" ? "#ff8833" : "#22c55e",
            borderRadius: 2,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Floor progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {FLOOR_COLORS.map((color, fi) => (
          <div key={fi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>F{fi + 1}</div>
            <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{
                width: `${((card.squares?.filter((s: any) => s.floor === fi + 1 && s.status === "complete").length || 0) / 5) * 100}%`,
                height: "100%",
                background: color,
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Complete", value: card.completedSquares, color: "#22c55e" },
          { label: "Active", value: card.inProgressSquares, color: "#60a5fa" },
          { label: "Blocked", value: card.blockedSquares, color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: "6px 8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href={`/bingo-city/card/${card.id}`}>
        <button style={{
          width: "100%",
          padding: "10px 16px",
          background: card.id === "ruby-red-maven" ? "#ff8833" : "rgba(255,255,255,0.08)",
          border: "none",
          borderRadius: 10,
          color: card.id === "ruby-red-maven" ? "black" : "white",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}>
          <Building2 size={14} />
          Enter This Building →
        </button>
      </Link>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────
export default function BingoCityView3D() {
  const { data: cards } = useBingoCards();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
  const [controlsRef, setControlsRef] = useState<any>(null);
  const [showHint, setShowHint] = useState(true);

  const selectedCard = selectedId ? cards.find((c: any) => c.id === selectedId) : null;

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (id: string, pos: [number, number, number]) => {
    setSelectedId(id === selectedId ? null : id);
    setCameraTarget(id === selectedId ? null : [pos[0], pos[1] + 2, pos[2]]);
  };

  const handleReset = () => {
    setSelectedId(null);
    setCameraTarget(null);
    if (controlsRef) {
      controlsRef.target.set(0, 0, 0);
      controlsRef.object.position.set(0, 18, 22);
    }
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0a0a14",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0, 18, 22], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        style={{ background: "linear-gradient(180deg, #0a0a14 0%, #0c0c1a 100%)" }}
      >
        <Suspense fallback={null}>
          <CityScene
            cards={cards}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
          <CameraController
            target={cameraTarget}
            onReady={setControlsRef}
          />
        </Suspense>
      </Canvas>

      {/* ── UI Overlay ── */}

      {/* Top bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "linear-gradient(180deg, rgba(10,10,20,0.9) 0%, transparent 100%)",
        zIndex: 10,
      }}>
        <Link href="/bingo-city">
          <button style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            padding: "6px 12px",
            cursor: "pointer",
            fontFamily: "monospace",
          }}>
            <ArrowLeft size={12} />
            Back
          </button>
        </Link>

        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.05em",
          textAlign: "center",
        }}>
          <span style={{ color: "#ff8833" }}>BINGO</span> CITY
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontWeight: 400, marginTop: 1 }}>
            {cards.length} buildings · {cards.reduce((a: number, c: any) => a + c.totalSquares, 0)} squares
            </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleReset}
            title="Reset view"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={12} />
          </button>
          <Link href="/dashboard">
            <button style={{
              background: "rgba(255,136,51,0.1)",
              border: "1px solid rgba(255,136,51,0.3)",
              borderRadius: 8,
              color: "#ff8833",
              fontSize: 10,
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Mission Control →
            </button>
          </Link>
        </div>
      </div>

      {/* Interaction hint */}
      {showHint && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(10,10,20,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "12px 20px",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 10,
          animation: "fadeOut 1s ease 3s forwards",
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🏙️</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Drag to rotate · Scroll to zoom</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3, fontFamily: "monospace" }}>Click any building to explore it</div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: selectedCard ? 180 : 24,
        right: 16,
        background: "rgba(10,10,20,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "10px 12px",
        zIndex: 10,
        transition: "bottom 0.3s ease",
      }}>
        <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Floors</div>
        {FLOOR_COLORS.map((color, fi) => (
          <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>F{fi + 1} {FLOOR_NAMES[fi]}</span>
          </div>
        ))}
      </div>

      {/* Selected building panel */}
      {selectedCard && (
        <SelectedBuildingPanel
          card={selectedCard}
          onClose={() => { setSelectedId(null); setCameraTarget(null); }}
        />
      )}

      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
