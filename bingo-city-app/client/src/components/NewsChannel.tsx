import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function NewsChannel() {
  const { isAuthenticated } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const newsQuery = trpc.news.list.useQuery();
  const createNews = trpc.news.create.useMutation({
    onSuccess: () => {
      toast.success("News posted");
      setShowNew(false);
      setTitle("");
      setContent("");
      newsQuery.refetch();
    },
  });

  const categoryColors: Record<string, string> = {
    general: "#3B82F6",
    alert: "#EF4444",
    update: "#22C55E",
    governance: "#F59E0B",
    community: "#8B5CF6",
  };

  // Default news items when DB is empty
  const defaultNews = [
    { id: -1, title: "Bingo City Architecture v0.8 Released", content: "The complete five-storey building with rooftop society is now live. All avatar roles defined.", category: "update", source: "System", createdAt: new Date().toISOString() },
    { id: -2, title: "Swiss Governance Model Activated", content: "Commune-Canton-Confederation subsidiarity mapping is now operational. Petition system online.", category: "governance", source: "Governance", createdAt: new Date().toISOString() },
    { id: -3, title: "Ruby Red's Minimum Viable City", content: "Three core advocates — Companion, Situations Manager, Voice of Concern — form the entry point.", category: "community", source: "Move 37", createdAt: new Date().toISOString() },
  ];

  const items = (newsQuery.data && newsQuery.data.length > 0) ? newsQuery.data : defaultNews;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wider uppercase opacity-60" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          News Channel
        </h3>
        {isAuthenticated && (
          <button onClick={() => setShowNew(!showNew)}
            className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.3)" }}>
            + Post
          </button>
        )}
      </div>

      {showNew && (
        <div className="rounded-lg p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Headline..."
            className="w-full bg-transparent border border-border/30 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." rows={2}
            className="w-full bg-transparent border border-border/30 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50 resize-none" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-transparent border border-border/30 rounded px-2 py-1.5 text-xs focus:outline-none">
            <option value="general">General</option>
            <option value="alert">Alert</option>
            <option value="update">Update</option>
            <option value="governance">Governance</option>
            <option value="community">Community</option>
          </select>
          <button onClick={() => createNews.mutate({ title, content, category, source: "User" })}
            disabled={!title.trim()}
            className="w-full py-1.5 rounded text-xs font-medium disabled:opacity-30"
            style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.3)" }}>
            Publish
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item: any) => {
          const catColor = categoryColors[item.category || "general"] || "#3B82F6";
          return (
            <div key={item.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-2">
                <div className="w-1 h-full rounded-full flex-shrink-0 self-stretch" style={{ background: catColor, minHeight: "2rem" }}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: catColor + "22", color: catColor }}>
                      {item.category || "general"}
                    </span>
                    <span className="text-[8px] opacity-30">{item.source}</span>
                  </div>
                  <h4 className="text-xs font-medium">{item.title}</h4>
                  {item.content && <p className="text-[10px] opacity-50 mt-0.5 line-clamp-2">{item.content}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
