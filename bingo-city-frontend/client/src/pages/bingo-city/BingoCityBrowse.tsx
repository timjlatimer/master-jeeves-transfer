/**
 * BingoCityBrowse.tsx — Stage 2: Browse Cards
 *
 * DESIGN: "Warm Noir" — grid of initiative cards, each showing a mini building
 * Each card: title, description, mini 5-floor stack, progress bar, owner name
 *
 * tRPC hook to replace: useBingoCards() → trpc.bingoCards.list.useQuery()
 *
 * shadcn/ui: Card, CardContent, Badge
 * Icons: ArrowLeft, Building2 (Lucide)
 * Routing: wouter Link
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link } from "wouter";
import FloorStack from "./components/FloorStack";
import { useBingoCards, type BingoCard } from "./data/mockData";

export default function BingoCityBrowse() {
  const { data: cards, isLoading } = useBingoCards();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          href="/bingo-city"
          className="flex items-center gap-1 text-xs font-mono text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Link>
        <Link
          href="/dashboard"
          className="text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
        >
          Mission Control →
        </Link>
      </header>

      <main className="flex-1 px-4 py-6 sm:py-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-[#ff8833]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white/95">
              Bingo City
            </h1>
          </div>
          <p className="text-sm text-white/50 max-w-sm mx-auto">
            Every building is an initiative. Pick one to see what's being built inside.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4">
        <p className="text-[10px] font-mono text-white/20 italic">
          "It's expensive to be poor." — We're changing that.
        </p>
      </footer>
    </div>
  );
}

function CardTile({ card }: { card: BingoCard }) {
  const progressPercent = Math.round(
    (card.completedSquares / card.totalSquares) * 100
  );
  const notStarted =
    card.totalSquares -
    card.completedSquares -
    card.inProgressSquares -
    card.blockedSquares;

  return (
    <Link href={`/bingo-city/card/${card.id}`}>
      <Card
        className="bg-transparent hover:bg-white/[0.02] transition-all duration-200 cursor-pointer group h-full"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <CardContent className="p-4">
          {/* Title + Badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white/90 group-hover:text-[#ff8833] transition-colors">
              {card.title}
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] shrink-0 border-white/10 text-white/40"
            >
              {progressPercent}%
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-white/45 leading-relaxed mb-3 line-clamp-2">
            {card.description}
          </p>

          {/* Mini Floor Stack */}
          <div className="mb-3 w-full">
            <FloorStack size="mini" />
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, #22c55e 0%, #15803d 100%)",
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="text-green-400">{card.completedSquares} done</span>
              <span className="text-blue-400">{card.inProgressSquares} active</span>
              {card.blockedSquares > 0 && (
                <span className="text-red-400">{card.blockedSquares} blocked</span>
              )}
            </div>
            <span className="text-[10px] text-white/30 truncate ml-2">
              {card.ownerName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
