import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { INNER_RING_AVATARS, OUTER_AVATARS, SPECIAL_AVATARS, BUILDING_FLOORS, ALL_AVATARS } from "@/lib/data";

// ============================================================
// Building Floor Component
// ============================================================
function BuildingFloor({ level, color, name }: { level: number; color: string; name: string }) {
  const y = (level - 1) * 2.2;
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, y, 0]}>
      {/* Floor slab */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.15, 6]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Glass walls - front */}
      <mesh position={[0, 1, 3]}>
        <boxGeometry args={[6, 2, 0.08]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.35} metalness={0.1} roughness={0.1} transmission={0.5} />
      </mesh>
      {/* Glass walls - back */}
      <mesh position={[0, 1, -3]}>
        <boxGeometry args={[6, 2, 0.08]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.35} metalness={0.1} roughness={0.1} transmission={0.5} />
      </mesh>
      {/* Glass walls - left */}
      <mesh position={[-3, 1, 0]}>
        <boxGeometry args={[0.08, 2, 6]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.35} metalness={0.1} roughness={0.1} transmission={0.5} />
      </mesh>
      {/* Glass walls - right */}
      <mesh position={[3, 1, 0]}>
        <boxGeometry args={[0.08, 2, 6]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.35} metalness={0.1} roughness={0.1} transmission={0.5} />
      </mesh>
      {/* Window frames - vertical */}
      {[-2, -0.5, 1, 2.5].map((x, i) => (
        <mesh key={`vf-${i}`} position={[x, 1, 3.05]}>
          <boxGeometry args={[0.06, 2, 0.06]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Window frame - horizontal */}
      <mesh position={[0, 1, 3.05]}>
        <boxGeometry args={[6, 0.06, 0.06]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Interior glow */}
      <pointLight position={[0, 1, 0]} color={color} intensity={0.5} distance={4} />
    </group>
  );
}

// ============================================================
// Rooftop Platform
// ============================================================
function Rooftop({ onAvatarClick }: { onAvatarClick: (id: string) => void }) {
  const rooftopY = 5 * 2.2;

  return (
    <group position={[0, rooftopY, 0]}>
      {/* Rooftop slab */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6.2, 0.2, 6.2]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rooftop floor surface */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[6, 0.02, 6]} />
        <meshStandardMaterial color="#3a3a4e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Brass Stanchion (Inner Ring) - left side */}
      <StanchionRing />

      {/* Professional Team - LEFT SIDE inside stanchion */}
      <AvatarFigure id="pm" position={[-1.5, 0.5, -0.5]} color="#FFD700" emoji="PM" scale={1.1} onClick={onAvatarClick} />
      <AvatarFigure id="sm" position={[-2.2, 0.5, 0.3]} color="#FF6B6B" emoji="SM" onClick={onAvatarClick} />
      <AvatarFigure id="companion" position={[-0.8, 0.5, 0.8]} color="#4ECDC4" emoji="CS" onClick={onAvatarClick} />
      <AvatarFigure id="sot" position={[-1.8, 0.5, 1.2]} color="#45B7D1" emoji="ST" onClick={onAvatarClick} />
      <AvatarFigure id="igag" position={[-0.5, 0.5, -0.8]} color="#96CEB4" emoji="IG" onClick={onAvatarClick} />

      {/* Angel of Your Better Nature - CENTER */}
      <AngelFigure position={[0.5, 0.5, 0]} onClick={() => onAvatarClick("angel")} />

      {/* Voice of Concern - RIGHT CORNER (purple cat on bench) */}
      <VoiceOfConcern position={[2.3, 0.3, 2]} onClick={() => onAvatarClick("voc")} />

      {/* Outer avatars - arguing outside stanchion */}
      <AvatarFigure id="qa" position={[0.5, 0.5, -1.8]} color="#9B59B6" emoji="QA" scale={0.85} onClick={onAvatarClick} />
      <AvatarFigure id="journalist" position={[1.5, 0.5, -1.2]} color="#E74C3C" emoji="JN" scale={0.85} onClick={onAvatarClick} />
      <AvatarFigure id="sw" position={[1.8, 0.5, 0.5]} color="#F39C12" emoji="SW" scale={0.85} onClick={onAvatarClick} />

      {/* Wisdom Giants - semi-transparent, phasing */}
      <WisdomGiant position={[2.8, 0.5, -2.5]} />
      <WisdomGiant position={[-2.8, 0.5, 2.5]} />

      {/* Ambient rooftop light */}
      <pointLight position={[0, 3, 0]} color="#ffd700" intensity={0.8} distance={10} />
    </group>
  );
}

// ============================================================
// Stanchion Ring (brass guard rail)
// ============================================================
function StanchionRing() {
  const points: [number, number, number][] = [];
  const segments = 24;
  const radius = 1.8;
  const centerX = -1.3;
  const centerZ = 0.3;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([centerX + Math.cos(angle) * radius, 0.6, centerZ + Math.sin(angle) * radius]);
  }

  return (
    <group>
      {/* Posts */}
      {[0, 4, 8, 12, 16, 20].map(i => {
        const angle = (i / segments) * Math.PI * 2;
        return (
          <mesh key={i} position={[centerX + Math.cos(angle) * radius, 0.4, centerZ + Math.sin(angle) * radius]}>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#D4A017" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
      {/* Top rail - rendered as thin cylinders between posts */}
      {[0, 4, 8, 12, 16, 20].map((i, idx, arr) => {
        const nextI = arr[(idx + 1) % arr.length];
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = (nextI / segments) * Math.PI * 2;
        const x1 = centerX + Math.cos(a1) * radius;
        const z1 = centerZ + Math.sin(a1) * radius;
        const x2 = centerX + Math.cos(a2) * radius;
        const z2 = centerZ + Math.sin(a2) * radius;
        const mx = (x1 + x2) / 2;
        const mz = (z1 + z2) / 2;
        const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const angle = Math.atan2(z2 - z1, x2 - x1);
        return (
          <mesh key={`rail-${idx}`} position={[mx, 0.7, mz]} rotation={[0, -angle, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, len, 6]} />
            <meshStandardMaterial color="#D4A017" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================================
// Avatar Figure (Pixar-style simplified)
// ============================================================
function AvatarFigure({ id, position, color, emoji, scale = 1, onClick }: {
  id: string; position: [number, number, number]; color: string; emoji: string; scale?: number;
  onClick: (id: string) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    // Gentle idle animation
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.05;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Body */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
      >
        <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
        <meshStandardMaterial color={color} emissive={hovered ? color : "#000000"} emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
      >
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={color} emissive={hovered ? color : "#000000"} emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      {/* Label */}
      <Text position={[0, 0.65, 0]} fontSize={0.12} color={color} anchorX="center" anchorY="middle" font={undefined}>
        {emoji}
      </Text>
      {hovered && (
        <pointLight position={[0, 0.3, 0]} color={color} intensity={1} distance={1.5} />
      )}
    </group>
  );
}

// ============================================================
// Angel of Your Better Nature (glowing ethereal)
// ============================================================
function AngelFigure({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.15 + 0.3;
    const opacity = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    ref.current.children.forEach(child => {
      if ((child as THREE.Mesh).material) {
        ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = opacity;
      }
    });
  });

  return (
    <group ref={ref} position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <capsuleGeometry args={[0.18, 0.4, 8, 16]} />
        <meshStandardMaterial color="#FBBF24" transparent opacity={0.6} emissive="#FBBF24" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#FEF3C7" transparent opacity={0.6} emissive="#FBBF24" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0, 0.3, 0]} color="#FBBF24" intensity={2} distance={3} />
      <Text position={[0, 0.8, 0]} fontSize={0.1} color="#FBBF24" anchorX="center" font={undefined}>
        Angel
      </Text>
    </group>
  );
}

// ============================================================
// Voice of Concern (purple cat on bench)
// ============================================================
function VoiceOfConcern({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Bench */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.25]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Bench legs */}
      {[[-0.25, -0.12, 0.08], [0.25, -0.12, 0.08], [-0.25, -0.12, -0.08], [0.25, -0.12, -0.08]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.04, 0.2, 0.04]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
      {/* Cat body */}
      <mesh position={[0, 0.25, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <capsuleGeometry args={[0.12, 0.15, 8, 16]} />
        <meshStandardMaterial color="#8B5CF6" emissive={hovered ? "#8B5CF6" : "#000"} emissiveIntensity={hovered ? 0.5 : 0.1} />
      </mesh>
      {/* Cat head */}
      <mesh position={[0, 0.45, 0.05]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.15} />
      </mesh>
      {/* Cat ears */}
      <mesh position={[-0.06, 0.55, 0.05]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
      <mesh position={[0.06, 0.55, 0.05]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
      {/* Shawl */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.14, 0.03, 8, 16]} />
        <meshStandardMaterial color="#4338CA" />
      </mesh>
      {/* Glow */}
      <pointLight position={[0, 0.3, 0]} color="#8B5CF6" intensity={0.5} distance={2} />
      <Text position={[0, 0.7, 0]} fontSize={0.08} color="#8B5CF6" anchorX="center" font={undefined}>
        Voice of Concern
      </Text>
    </group>
  );
}

// ============================================================
// Wisdom Giant (semi-transparent, phasing)
// ============================================================
function WisdomGiant({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const opacity = Math.max(0, Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.5 + 0.2);
    ref.current.children.forEach(child => {
      if ((child as THREE.Mesh).material) {
        ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = opacity;
      }
    });
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial color="#94A3B8" transparent opacity={0.3} emissive="#94A3B8" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#CBD5E1" transparent opacity={0.3} emissive="#94A3B8" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ============================================================
// Ground Plane
// ============================================================
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.8} />
    </mesh>
  );
}

// ============================================================
// Scene
// ============================================================
function Scene({ onAvatarClick }: { onAvatarClick: (id: string) => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} color="#4a90d9" />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#ffd700" />

      <Ground />

      {/* Building Floors */}
      {BUILDING_FLOORS.map(floor => (
        <BuildingFloor key={floor.level} level={floor.level} color={floor.hexColor} name={floor.name} />
      ))}

      {/* Rooftop */}
      <Rooftop onAvatarClick={onAvatarClick} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        target={[0, 5, 0]}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// ============================================================
// Main Building View Component
// ============================================================
export default function BuildingView() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const avatar = selectedAvatar ? ALL_AVATARS.find(a => a.id === selectedAvatar) : null;

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [12, 14, 12], fov: 45 }}
        style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1a 100%)" }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene onAvatarClick={setSelectedAvatar} />
        </Suspense>
      </Canvas>

      {/* Floor Legend */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-lg p-3 space-y-1">
        <div className="text-[10px] font-bold tracking-wider uppercase opacity-60 mb-2">Building Floors</div>
        {BUILDING_FLOORS.map(f => (
          <div key={f.level} className="flex items-center gap-2 text-[11px]">
            <div className="w-3 h-3 rounded-sm" style={{ background: f.hexColor }}></div>
            <span className="opacity-70">L{f.level}: {f.name}</span>
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 right-4 glass-panel rounded-lg px-3 py-2 text-[10px] opacity-60">
        Drag to rotate &bull; Scroll to zoom &bull; Click avatars for details
      </div>

      {/* Avatar Detail Panel */}
      {avatar && (
        <div className="absolute top-4 left-4 glass-panel rounded-xl p-4 max-w-xs w-72 z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: avatar.color + "22", border: `2px solid ${avatar.color}` }}>
              {avatar.emoji}
            </div>
            <div>
              <h3 className="font-bold text-sm">{avatar.name}</h3>
              <p className="text-[10px] opacity-60">{avatar.role}</p>
            </div>
          </div>
          <p className="text-xs opacity-80 mb-2">{avatar.description}</p>
          <div className="flex gap-1 flex-wrap text-[9px] mb-3">
            <span className="px-2 py-0.5 rounded" style={{ background: avatar.color + "22", color: avatar.color }}>{avatar.zone.toUpperCase()}</span>
            <span className="px-2 py-0.5 rounded bg-white/5">{avatar.system}</span>
          </div>
          <button className="w-full py-1.5 rounded text-xs font-medium"
            style={{ background: avatar.color + "22", color: avatar.color, border: `1px solid ${avatar.color}44` }}
            onClick={() => setSelectedAvatar(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
