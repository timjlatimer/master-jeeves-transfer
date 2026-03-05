import { useState } from "react";
import {
  INNER_RING_AVATARS, OUTER_AVATARS, SPECIAL_AVATARS,
  GOVERNANCE_LEVELS, ESCALATION_LEVELS, SWARM_MODES,
  MVC_AVATARS, MVC_TIMELINE, AVATAR_CUSTOMIZATION, ALL_AVATARS,
} from "@/lib/data";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-sm md:text-base tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
      {children}
    </h2>
  );
}

function ZoneCard({ title, subtitle, color, borderColor, children }: {
  title: string; subtitle: string; color: string; borderColor: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg p-4 flex-1 min-w-0" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderColor}` }}>
      <div className="text-[10px] tracking-[0.15em] uppercase mb-1 opacity-60" style={{ color }}>{subtitle}</div>
      <h3 className="text-sm font-bold mb-2" style={{ color }}>{title}</h3>
      <p className="text-xs leading-relaxed opacity-70">{children}</p>
    </div>
  );
}

export default function DashboardView() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* THREE-ZONE TOPOLOGY */}
      <section className="section-card neon-border">
        <SectionTitle>The Rooftop Society — Three-Zone Topology</SectionTitle>
        <div className="flex flex-col md:flex-row gap-3">
          <ZoneCard title="LEFT SIDE — PROFESSIONAL TEAM" subtitle="Kahneman System 2 — Rational" color="#3B82F6" borderColor="rgba(59,130,246,0.3)">
            The operational brain. Project Manager, Situations Manager, Companion, Source of Truth, "I Got a Guy" Connector work inside the inner Ring stanchion.
            Outside: Swarm Workers, Journalists, QA Sentinel debate and execute. Daily stand-ups at 6:04 AM. Swiss Generalsversammlung-style deliberation. Culture eats strategy for breakfast.
          </ZoneCard>
          <ZoneCard title="CENTER — ANGEL OF YOUR BETTER NATURE" subtitle="System 3 — Moral" color="#FBBF24" borderColor="rgba(251,191,36,0.3)">
            Appears and disappears. Independent of both the professional team and the emotional anchor.
            Rational but emotional — moral. Provides good counsel during difficult decisions. The conscience that Kahneman's model misses.
          </ZoneCard>
          <ZoneCard title="RIGHT CORNER — VOICE OF CONCERN" subtitle="Kahneman System 1 — Intuitive" color="#EF4444" borderColor="rgba(239,68,68,0.3)">
            ONE permanent avatar who never moves. The voice of anxiety, safety, risk. "Should I?" Senses everything, feels everything. While the left side is professional, this one is the gut feeling. The intuition. "Most women will know this one."
          </ZoneCard>
        </div>
      </section>

      {/* INNER RING ROSTER */}
      <section className="section-card neon-border">
        <SectionTitle>The Inner Ring — Governance Boundary & Full Roster</SectionTitle>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Ring Diagram */}
          <div className="w-full lg:w-48 flex-shrink-0">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-dashed opacity-30" style={{ borderColor: "#F59E0B" }}></div>
              <div className="absolute inset-4 rounded-full border-2" style={{ borderColor: "#D4A017" }}></div>
              <div className="absolute inset-4 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1">
                  {INNER_RING_AVATARS.map(a => (
                    <div key={a.id} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                      style={{ background: a.color + "33", border: `1px solid ${a.color}` }}
                      onClick={() => setSelectedAvatar(a.id)}
                      title={a.name}>
                      {a.id.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] tracking-wider uppercase opacity-50 whitespace-nowrap">Inner Ring</div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 opacity-60 font-medium">ROLE</th>
                  <th className="text-left py-2 px-2 opacity-60 font-medium">ANIMAL METAPHOR</th>
                  <th className="text-left py-2 px-2 opacity-60 font-medium">ZONE</th>
                  <th className="text-left py-2 px-2 opacity-60 font-medium">FUNCTION</th>
                </tr>
              </thead>
              <tbody>
                {[...INNER_RING_AVATARS, ...OUTER_AVATARS, ...SPECIAL_AVATARS].map(a => (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedAvatar(a.id)}>
                    <td className="py-2 px-2 font-medium">{a.name}</td>
                    <td className="py-2 px-2 opacity-70">{a.animal} — {a.role.split(" ")[0].toLowerCase()}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: a.color + "22", color: a.color }}>
                        {a.zone.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-2 opacity-70 max-w-xs truncate">{a.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SWISS GOVERNANCE */}
      <section className="section-card neon-border">
        <SectionTitle>Swiss Governance Model — Subsidiarity Mapping</SectionTitle>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {GOVERNANCE_LEVELS.map(g => (
            <div key={g.name} className="flex-1 rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${g.color}33` }}>
              <div className="text-2xl mb-2">{g.icon}</div>
              <h3 className="font-bold mb-1" style={{ color: g.color }}>{g.name}</h3>
              <p className="text-xs opacity-70 mb-2">{g.description}</p>
              <div className="text-[10px] opacity-50 border-t border-border/30 pt-2 mt-2">
                {g.mapping}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs italic opacity-60" style={{ color: "#FBBF24" }}>
          "Nothing that can be done at a lower level should be done at a higher level."
          <span className="block mt-1 opacity-50">— Attributed to Swiss Federal Constitution Principle of Subsidiarity</span>
        </p>
      </section>

      {/* ESCALATION MODEL */}
      <section className="section-card neon-border">
        <SectionTitle>Swiss-Style Escalation Model — Petition Thresholds</SectionTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          {ESCALATION_LEVELS.map(e => (
            <div key={e.level} className="flex-1 rounded-lg p-3 text-center" style={{ background: `${e.color}11`, border: `1px solid ${e.color}33` }}>
              <div className="text-2xl font-bold mb-1" style={{ color: e.color }}>{e.level}</div>
              <div className="text-xs font-bold mb-1">{e.name}</div>
              <div className="text-[10px] opacity-60">{e.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SWARM MIND MODES */}
      <section className="section-card neon-border">
        <SectionTitle>Swarm Mind Modes — Dynamic Rooftop Shifting</SectionTitle>
        <div className="flex flex-col md:flex-row gap-3">
          {SWARM_MODES.map(s => (
            <div key={s.name} className="flex-1 rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}33` }}>
              <div className="inline-block px-3 py-1 rounded text-xs font-bold mb-2 tracking-wider" style={{ background: `${s.color}22`, color: s.color }}>
                {s.name}
              </div>
              <p className="text-xs opacity-70 mb-2">{s.description}</p>
              <p className="text-[10px] opacity-40 italic">{s.arrangement}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MINIMUM VIABLE CITY */}
      <section className="section-card" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
        <SectionTitle><span style={{ color: "#EF4444" }}>Minimum Viable City — The Trojan Horse Entry Point</span></SectionTitle>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {MVC_AVATARS.map(a => (
            <div key={a.id} className="flex-1 rounded-lg p-4 text-center" style={{ background: `${a.color}11`, border: `1px solid ${a.color}33` }}>
              <div className="text-3xl mb-2">{a.emoji}</div>
              <h3 className="text-sm font-bold mb-1" style={{ color: a.color }}>{a.name}</h3>
              <p className="text-xs opacity-70">{a.description}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {MVC_TIMELINE.map((t, i) => (
            <div key={i} className="flex-1 rounded p-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: "#FBBF24" }}>{t.period}</div>
              <div className="text-[10px] opacity-60">{t.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AVATAR CUSTOMIZATION */}
      <section className="section-card neon-border">
        <SectionTitle>Avatar Customization — Pixar-Style Personality Engine</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(AVATAR_CUSTOMIZATION).map(([key, values]) => (
            <div key={key} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">{key}</h4>
              <ul className="space-y-1">
                {values.map(v => (
                  <li key={v} className="text-[11px] opacity-70">{v}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* MOVE 37 */}
      <section className="rounded-lg p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(251,191,36,0.1))", border: "1px solid rgba(251,191,36,0.3)" }}>
        <div className="inline-block px-3 py-1 rounded text-[10px] font-bold tracking-widest mb-3" style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>
          MOVE 37 — THE INSIGHT NOBODY SAW COMING
        </div>
        <h2 className="text-lg md:text-xl font-bold mb-1">Ruby Red does not just benefit from Bingo City.</h2>
        <h2 className="text-lg md:text-xl font-bold mb-4">Ruby Red gets her own Bingo City.</h2>
        <p className="text-xs opacity-70 max-w-2xl mx-auto leading-relaxed">
          The same fractal architecture that empowers the Solve Team collapses into a personal city for the working poor mother. The enterprise tool becomes the consumer product. Three AI advocates — Companion, Situations Manager, Voice of Concern — form her minimum viable city. "It's expensive to be poor" becomes "It's free to have a city working for you."
        </p>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col md:flex-row justify-between items-center py-4 border-t border-border/30 text-[10px] opacity-40">
        <span>SIC HB1000 Solve Team — Bingo City Architecture v0.8</span>
        <span className="italic" style={{ color: "#EF4444" }}>"It's expensive to be poor." — We're changing that.</span>
        <span>Designed by Bingo City AI</span>
      </footer>

      {/* AVATAR DETAIL PANEL */}
      {selectedAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedAvatar(null)}>
          <div className="glass-panel rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            {(() => {
              const avatar = ALL_AVATARS.find(a => a.id === selectedAvatar);
              if (!avatar) return null;
              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: avatar.color + "22", border: `2px solid ${avatar.color}` }}>
                      {avatar.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{avatar.name}</h3>
                      <p className="text-xs opacity-60">{avatar.role}</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-80 mb-3">{avatar.description}</p>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-1 rounded" style={{ background: avatar.color + "22", color: avatar.color }}>{avatar.zone.toUpperCase()}</span>
                    <span className="px-2 py-1 rounded bg-white/5">{avatar.system}</span>
                    <span className="px-2 py-1 rounded bg-white/5">{avatar.animal}</span>
                  </div>
                  <button className="mt-4 w-full py-2 rounded text-sm font-medium" style={{ background: avatar.color + "22", color: avatar.color, border: `1px solid ${avatar.color}44` }}
                    onClick={() => setSelectedAvatar(null)}>Close</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
