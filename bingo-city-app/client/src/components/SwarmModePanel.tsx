import { SWARM_MODES } from "@/lib/data";

export default function SwarmModePanel({ currentMode, onModeChange }: {
  currentMode: string;
  onModeChange: (mode: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold tracking-wider uppercase opacity-60" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Swarm Mind Mode
      </h3>
      <div className="flex flex-col gap-2">
        {SWARM_MODES.map(mode => {
          const isActive = currentMode.toLowerCase() === mode.name.toLowerCase();
          return (
            <button
              key={mode.name}
              onClick={() => onModeChange(mode.name.toLowerCase())}
              className="rounded-lg p-3 text-left transition-all"
              style={{
                background: isActive ? `${mode.color}22` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? mode.color + "66" : "rgba(255,255,255,0.08)"}`,
                boxShadow: isActive ? `0 0 15px ${mode.color}22` : "none",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: mode.color, boxShadow: isActive ? `0 0 8px ${mode.color}` : "none" }}></div>
                <span className="text-xs font-bold tracking-wider" style={{ color: isActive ? mode.color : "rgba(255,255,255,0.6)" }}>
                  {mode.name}
                </span>
                {isActive && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 ml-auto">ACTIVE</span>}
              </div>
              <p className="text-[10px] opacity-50 leading-relaxed">{mode.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
