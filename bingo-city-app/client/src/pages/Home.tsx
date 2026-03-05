import { useState, useCallback, lazy, Suspense } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { generateDefaultBingoGrid, BingoCell, ALL_AVATARS } from "@/lib/data";
import DashboardView from "./DashboardView";
import BingoGrid from "@/components/BingoGrid";
import SwarmModePanel from "@/components/SwarmModePanel";
import GovernancePanel from "@/components/GovernancePanel";
import NewsChannel from "@/components/NewsChannel";
import AvatarChat from "@/components/AvatarChat";
import SettingsPanel from "@/components/SettingsPanel";

const BuildingView = lazy(() => import("./BuildingView"));

type ViewMode = "dashboard" | "3d";
type SidePanel = "bingo" | "governance" | "swarm" | "news" | "settings" | null;

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [chatAvatar, setChatAvatar] = useState<string | null>(null);
  const [grid, setGrid] = useState<BingoCell[]>(generateDefaultBingoGrid);
  const [swarmMode, setSwarmMode] = useState("chorus");
  const [animationLevel, setAnimationLevel] = useState(50);
  const [commPreference, setCommPreference] = useState("text");

  const handleCellClick = useCallback((cell: BingoCell) => {
    setGrid(prev => prev.map(c => {
      if (c.id !== cell.id) return c;
      const nextStatus: Record<string, string> = { empty: "active", active: "complete", complete: "blocked", blocked: "empty" };
      return { ...c, status: (nextStatus[c.status] || "empty") as BingoCell["status"] };
    }));
  }, []);

  const togglePanel = (panel: SidePanel) => {
    setSidePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", color: "#FBBF24" }}>
              BINGO <span style={{ color: "#EF4444" }}>CITY</span>
            </h1>
            <span className="hidden sm:inline text-[10px] tracking-wider uppercase opacity-40">
              A Self-Organizing AI Civilization
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => setViewMode("dashboard")}
                className="px-3 py-1.5 text-[11px] font-medium transition-colors"
                style={{
                  background: viewMode === "dashboard" ? "rgba(251,191,36,0.2)" : "transparent",
                  color: viewMode === "dashboard" ? "#FBBF24" : "rgba(255,255,255,0.5)",
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className="px-3 py-1.5 text-[11px] font-medium transition-colors"
                style={{
                  background: viewMode === "3d" ? "rgba(251,191,36,0.2)" : "transparent",
                  color: viewMode === "3d" ? "#FBBF24" : "rgba(255,255,255,0.5)",
                }}
              >
                3D View
              </button>
            </div>

            {/* SIC Badge */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded text-[9px] tracking-wider" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              SIC HB1000 SOLVE TEAM
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="text-[10px] opacity-50">{user?.name || "User"}</div>
            ) : (
              <a href={getLoginUrl()} className="text-[10px] px-2 py-1 rounded"
                style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>
                Sign In
              </a>
            )}
          </div>
        </div>
      </header>

      {/* FEATURE NAV BAR */}
      <nav className="sticky top-[52px] z-30 glass-panel border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex gap-1 overflow-x-auto">
          {[
            { id: "bingo" as SidePanel, label: "Bingo Grid", icon: "🎯" },
            { id: "governance" as SidePanel, label: "Governance", icon: "🏛️" },
            { id: "swarm" as SidePanel, label: "Swarm Modes", icon: "🐝" },
            { id: "news" as SidePanel, label: "News", icon: "📰" },
            { id: "settings" as SidePanel, label: "Settings", icon: "⚙️" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => togglePanel(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all whitespace-nowrap"
              style={{
                background: sidePanel === item.id ? "rgba(251,191,36,0.15)" : "transparent",
                color: sidePanel === item.id ? "#FBBF24" : "rgba(255,255,255,0.5)",
                border: sidePanel === item.id ? "1px solid rgba(251,191,36,0.2)" : "1px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel */}
        {sidePanel && (
          <aside className="w-full sm:w-80 lg:w-96 flex-shrink-0 border-r border-border/20 overflow-y-auto p-4 glass-panel">
            {sidePanel === "bingo" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-wider uppercase opacity-60" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  5x5 Bingo Card
                </h3>
                <BingoGrid grid={grid} onCellClick={handleCellClick} />
                <p className="text-[10px] opacity-30 text-center">Click cells to cycle: empty → active → complete → blocked</p>
              </div>
            )}
            {sidePanel === "governance" && <GovernancePanel />}
            {sidePanel === "swarm" && <SwarmModePanel currentMode={swarmMode} onModeChange={setSwarmMode} />}
            {sidePanel === "news" && <NewsChannel />}
            {sidePanel === "settings" && (
              <SettingsPanel
                animationLevel={animationLevel}
                onAnimationChange={setAnimationLevel}
                commPreference={commPreference}
                onCommChange={setCommPreference}
              />
            )}
          </aside>
        )}

        {/* Main View */}
        <main className="flex-1 overflow-y-auto">
          {viewMode === "dashboard" ? (
            <DashboardView />
          ) : (
            <div className="h-[calc(100vh-100px)]">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs opacity-50">Loading 3D Building...</p>
                  </div>
                </div>
              }>
                <BuildingView />
              </Suspense>
            </div>
          )}
        </main>
      </div>

      {/* AVATAR QUICK ACCESS - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-30 flex flex-col gap-1">
        {ALL_AVATARS.slice(0, 5).map(avatar => (
          <button
            key={avatar.id}
            onClick={() => setChatAvatar(avatar.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95"
            style={{
              background: avatar.color + "22",
              border: `2px solid ${avatar.color}`,
              boxShadow: `0 0 10px ${avatar.color}33`,
            }}
            title={`Chat with ${avatar.name}`}
          >
            {avatar.emoji}
          </button>
        ))}
        <button
          onClick={() => setChatAvatar(chatAvatar ? null : "companion")}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
          style={{ background: "rgba(251,191,36,0.2)", border: "2px solid #FBBF24" }}
          title="More avatars..."
        >
          +{ALL_AVATARS.length - 5}
        </button>
      </div>

      {/* Chat Modal */}
      {chatAvatar && (
        <AvatarChat avatarId={chatAvatar} onClose={() => setChatAvatar(null)} />
      )}
    </div>
  );
}
