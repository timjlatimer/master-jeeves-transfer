import { useState, useRef, useEffect } from "react";
import { ALL_AVATARS } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AvatarChat({ avatarId, onClose }: { avatarId: string; onClose: () => void }) {
  const { isAuthenticated } = useAuth();
  const avatar = ALL_AVATARS.find(a => a.id === avatarId);
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{ text: string; isAvatar: boolean }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setLocalMessages(prev => [...prev, { text: data.response, isAvatar: true }]);
    },
    onError: () => {
      // Fallback for unauthenticated users
      const fallback = `I appreciate you reaching out. As ${avatar?.name || "an avatar"}, I'm here to help. Let me think about that...`;
      setLocalMessages(prev => [...prev, { text: fallback, isAvatar: true }]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [localMessages]);

  if (!avatar) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    setLocalMessages(prev => [...prev, { text: message, isAvatar: false }]);
    if (isAuthenticated) {
      sendMessage.mutate({ avatarId, message });
    } else {
      // Offline response for non-authenticated
      setTimeout(() => {
        const responses: Record<string, string> = {
          pm: "I've noted that. Let me check the project timeline and get back to you.",
          sm: "I'm scanning the current situation. Let me assess and provide real-time insights.",
          companion: "I hear you. Let's work through this together — what matters most right now?",
          sot: "Let me check the baseline records for relevant context.",
          igag: "I think I know someone who can help. Let me make a connection.",
          voc: "I sense something important here. Trust your instincts.",
          angel: "Take a breath. Consider what your better nature would counsel.",
          qa: "I'll run a quality check on that.",
          journalist: "Interesting. Let me cross-reference with other initiatives.",
          sw: "On it. The swarm is mobilizing.",
          wg: "Drawing from lived experience... I've seen this pattern before.",
        };
        setLocalMessages(prev => [...prev, { text: responses[avatarId] || "I understand. Let me think about that.", isAvatar: true }]);
      }, 800);
    }
    setMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass-panel rounded-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: avatar.color + "22", border: `2px solid ${avatar.color}` }}>
            {avatar.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{avatar.name}</h3>
            <p className="text-[10px] opacity-50">{avatar.role}</p>
          </div>
          <button onClick={onClose} className="text-lg opacity-50 hover:opacity-100 transition-opacity">&times;</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
          {/* Welcome message */}
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: avatar.color + "22", border: `1px solid ${avatar.color}` }}>
              {avatar.emoji}
            </div>
            <div className="rounded-lg p-2 max-w-[80%] text-xs" style={{ background: avatar.color + "11" }}>
              Hello! I'm {avatar.name}. {avatar.description.split(".")[0]}. How can I help you today?
            </div>
          </div>

          {localMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.isAvatar ? "" : "flex-row-reverse"}`}>
              {msg.isAvatar && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{ background: avatar.color + "22", border: `1px solid ${avatar.color}` }}>
                  {avatar.emoji}
                </div>
              )}
              <div className={`rounded-lg p-2 max-w-[80%] text-xs ${msg.isAvatar ? "" : "bg-primary/20"}`}
                style={msg.isAvatar ? { background: avatar.color + "11" } : {}}>
                {msg.text}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: avatar.color + "22", border: `1px solid ${avatar.color}` }}>
                {avatar.emoji}
              </div>
              <div className="rounded-lg p-2 text-xs opacity-50" style={{ background: avatar.color + "11" }}>
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={`Message ${avatar.name}...`}
              className="flex-1 bg-transparent border border-border/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
            />
            <button onClick={handleSend} disabled={!message.trim()}
              className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors"
              style={{ background: avatar.color + "22", color: avatar.color, border: `1px solid ${avatar.color}44` }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
