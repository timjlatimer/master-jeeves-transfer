import { useState } from "react";
import { GOVERNANCE_LEVELS, ESCALATION_LEVELS } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function GovernancePanel() {
  const { isAuthenticated } = useAuth();
  const [showNewPetition, setShowNewPetition] = useState(false);
  const [petitionTitle, setPetitionTitle] = useState("");
  const [petitionDesc, setPetitionDesc] = useState("");

  const petitionsQuery = trpc.petition.list.useQuery();
  const createPetition = trpc.petition.create.useMutation({
    onSuccess: () => {
      toast.success("Petition created");
      setShowNewPetition(false);
      setPetitionTitle("");
      setPetitionDesc("");
      petitionsQuery.refetch();
    },
    onError: () => toast.error("Failed to create petition"),
  });
  const endorsePetition = trpc.petition.endorse.useMutation({
    onSuccess: () => {
      toast.success("Endorsed!");
      petitionsQuery.refetch();
    },
  });

  return (
    <div className="space-y-4">
      {/* Subsidiarity Mapping */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase opacity-60 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Swiss Governance — Subsidiarity
        </h3>
        <div className="space-y-2">
          {GOVERNANCE_LEVELS.map(g => (
            <div key={g.name} className="rounded-lg p-3 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${g.color}33` }}>
              <span className="text-xl">{g.icon}</span>
              <div>
                <h4 className="text-xs font-bold" style={{ color: g.color }}>{g.name}</h4>
                <p className="text-[10px] opacity-50">{g.mapping}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Levels */}
      <div>
        <h3 className="text-sm font-bold tracking-wider uppercase opacity-60 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Petition Escalation
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {ESCALATION_LEVELS.map(e => (
            <div key={e.level} className="flex-shrink-0 w-16 rounded-lg p-2 text-center" style={{ background: `${e.color}11`, border: `1px solid ${e.color}33` }}>
              <div className="text-lg font-bold" style={{ color: e.color }}>{e.level}</div>
              <div className="text-[8px] opacity-60 leading-tight">{e.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Petitions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold tracking-wider uppercase opacity-60" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Active Petitions
          </h3>
          {isAuthenticated && (
            <button onClick={() => setShowNewPetition(!showNewPetition)}
              className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>
              + New Petition
            </button>
          )}
        </div>

        {showNewPetition && (
          <div className="rounded-lg p-3 mb-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <input
              type="text"
              value={petitionTitle}
              onChange={e => setPetitionTitle(e.target.value)}
              placeholder="Petition title..."
              className="w-full bg-transparent border border-border/30 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50"
            />
            <textarea
              value={petitionDesc}
              onChange={e => setPetitionDesc(e.target.value)}
              placeholder="Description..."
              rows={2}
              className="w-full bg-transparent border border-border/30 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50 resize-none"
            />
            <button
              onClick={() => createPetition.mutate({ title: petitionTitle, description: petitionDesc })}
              disabled={!petitionTitle.trim()}
              className="w-full py-1.5 rounded text-xs font-medium disabled:opacity-30"
              style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>
              Submit Petition
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {petitionsQuery.data?.map((p: any) => {
            const levelColor = ESCALATION_LEVELS[(p.escalationLevel || 1) - 1]?.color || "#fff";
            return (
              <div key={p.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${levelColor}22` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-medium">{p.title}</h4>
                    {p.description && <p className="text-[10px] opacity-50 mt-0.5">{p.description}</p>}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: levelColor + "22", color: levelColor }}>
                    L{p.escalationLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] opacity-40">{p.endorsements} endorsements &bull; {p.status}</span>
                  {isAuthenticated && (
                    <button onClick={() => endorsePetition.mutate({ id: p.id })}
                      className="text-[9px] px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                      style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                      Endorse
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {(!petitionsQuery.data || petitionsQuery.data.length === 0) && (
            <p className="text-[10px] opacity-30 text-center py-4">No petitions yet. Be the first to raise an issue.</p>
          )}
        </div>
      </div>
    </div>
  );
}
