import { useState } from "react";

export default function SettingsPanel({
  animationLevel,
  onAnimationChange,
  commPreference,
  onCommChange,
}: {
  animationLevel: number;
  onAnimationChange: (v: number) => void;
  commPreference: string;
  onCommChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Animation Continuum */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase opacity-60 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Animation Continuum
        </h3>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between text-[10px] opacity-50 mb-2">
            <span>Photorealistic</span>
            <span>Full Pixar</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={animationLevel}
            onChange={e => onAnimationChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #FBBF24 ${animationLevel}%, rgba(255,255,255,0.1) ${animationLevel}%)`,
            }}
          />
          <div className="text-center text-[10px] mt-1 opacity-40">{animationLevel}%</div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase opacity-60 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Communication Preferences
        </h3>
        <div className="space-y-2">
          {[
            { id: "voice", label: "Voice Messaging", icon: "🎙️", desc: "Avatars speak to you with voice" },
            { id: "text", label: "Text Messaging", icon: "💬", desc: "Written messages and reports" },
            { id: "notices", label: "Notices Only", icon: "🔔", desc: "Minimal, notification-style updates" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => onCommChange(opt.id)}
              className="w-full rounded-lg p-3 text-left flex items-center gap-3 transition-all"
              style={{
                background: commPreference === opt.id ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${commPreference === opt.id ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <span className="text-lg">{opt.icon}</span>
              <div>
                <div className="text-xs font-medium">{opt.label}</div>
                <div className="text-[10px] opacity-40">{opt.desc}</div>
              </div>
              {commPreference === opt.id && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.2)", color: "#FBBF24" }}>Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Benevolent Dictator Override */}
      <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <h3 className="text-xs font-bold mb-1" style={{ color: "#EF4444" }}>Benevolent Dictator Override</h3>
        <p className="text-[10px] opacity-50">
          Master Jeeves / Tim retain ultimate override authority. Democracy + Swiss village model + benevolent dictator = the governance blend. This ensures the system can never be captured by bad actors while maintaining democratic principles at every level.
        </p>
      </div>
    </div>
  );
}
