/**
 * BingoCityCard.tsx — Stage 3: Card Detail (the main experience)
 *
 * DESIGN: "Warm Noir" — the heart of Bingo City
 * When Ruby Red clicks "Just Show Me," this is what she sees:
 * 1. Card title + stats
 * 2. 5-storey building (interactive floors)
 * 3. 5x5 Bingo Grid (25 cells with status colors)
 * 4. Rooftop Society
 * 5. "Imagine a whole city" tease
 * 6. Backstage Tour link
 *
 * tRPC hooks to replace:
 *   useBingoCard(id)    → trpc.bingoCards.getById.useQuery({ id })
 *   useBingoSquares(id) → trpc.bingoSquares.getByCardId.useQuery({ cardId: id })
 *
 * shadcn/ui: Button, Card, CardContent, Badge, Dialog
 * Icons: ArrowLeft, Building2, ChevronRight (Lucide)
 * Routing: wouter Link, useParams
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Building2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import BingoGrid from "./components/BingoGrid";
import BuildingVisual from "./components/BuildingVisual";
import HardHatTour from "./components/HardHatTour";
import {
  useBingoCard,
  useBingoSquares,
  type BingoSquare,
  STATUS_CONFIG,
  FLOORS,
} from "./data/mockData";

export default function BingoCityCard() {
  const params = useParams<{ id: string }>();
  const cardId = params.id || "ruby-red-maven";

  const { data: card } = useBingoCard(cardId);
  const { data: squares } = useBingoSquares(cardId);

  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<BingoSquare | null>(null);

  if (!card || !squares) return null;

  const progressPercent = Math.round(
    (card.completedSquares / card.totalSquares) * 100
  );

  const handleFloorClick = (floor: number) => {
    setActiveFloor((prev) => (prev === floor ? null : floor));
    setSelectedSquare(null);
  };

  const handleSquareClick = (square: BingoSquare) => {
    setSelectedSquare((prev) => (prev?.id === square.id ? null : square));
    setActiveFloor(square.floor);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          href="/bingo-city/browse"
          className="flex items-center gap-1 text-xs font-mono text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          All Cards
        </Link>
        <Link
          href="/dashboard"
          className="text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
        >
          Mission Control →
        </Link>
      </header>

      <main className="flex-1 px-4 py-6 sm:py-10 max-w-4xl mx-auto w-full">
        {/* ─── Section 1: Card Title + Stats ─── */}
        <section className="mb-8">
          <div className="flex items-start gap-3 mb-3">
            <Building2 className="w-6 h-6 text-[#ff8833] shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white/95">
                {card.title}
              </h1>
              <p className="text-sm text-white/50 mt-1 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant="outline"
              className="text-xs border-green-500/30 text-green-400 bg-green-500/10"
            >
              {card.completedSquares} complete
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10"
            >
              {card.inProgressSquares} in progress
            </Badge>
            {card.blockedSquares > 0 && (
              <Badge
                variant="outline"
                className="text-xs border-red-500/30 text-red-400 bg-red-500/10"
              >
                {card.blockedSquares} blocked
              </Badge>
            )}
            <Badge
              variant="outline"
              className="text-xs border-[#ff8833]/30 text-[#ff8833] bg-[#ff8833]/10"
            >
              {progressPercent}% overall
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                  background:
                    "linear-gradient(90deg, #22c55e 0%, #15803d 100%)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ─── Section 2: Building + Grid Layout ─── */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Building Visual */}
            <div>
              <div className="bingo-label text-[10px] mb-3">
                ▲ the building
              </div>
              <BuildingVisual
                squares={squares}
                activeFloor={activeFloor}
                onFloorClick={handleFloorClick}
                variant="detail"
              />
              <p className="text-[10px] text-white/30 text-center mt-2 font-mono">
                tap a floor to highlight that row
              </p>
            </div>

            {/* Bingo Grid */}
            <div>
              <div className="bingo-label text-[10px] mb-3">
                🎯 the bingo grid — 25 squares
              </div>
              <BingoGrid
                squares={squares}
                activeFloor={activeFloor}
                onSquareClick={handleSquareClick}
              />
            </div>
          </div>
        </section>

        {/* ─── Selected Square Detail ─── */}
        {selectedSquare && (
          <section className="mb-8">
            <Card
              className="bg-transparent"
              style={{
                border: `1px solid ${STATUS_CONFIG[selectedSquare.status].color}40`,
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-mono text-xs font-bold"
                        style={{
                          color: FLOORS[selectedSquare.floor - 1].color,
                        }}
                      >
                        #{selectedSquare.position}
                      </span>
                      <h3 className="text-sm font-semibold text-white/90">
                        {selectedSquare.title}
                      </h3>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {selectedSquare.description}
                    </p>
                    {selectedSquare.owner && (
                      <p className="text-[10px] font-mono text-white/30 mt-2">
                        Owner: {selectedSquare.owner}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] shrink-0"
                    style={{
                      borderColor: `${STATUS_CONFIG[selectedSquare.status].color}40`,
                      color: STATUS_CONFIG[selectedSquare.status].color,
                    }}
                  >
                    {STATUS_CONFIG[selectedSquare.status].icon}{" "}
                    {STATUS_CONFIG[selectedSquare.status].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ─── Section 3: Rooftop Society ─── */}
        <section className="mb-8">
          <Card
            className="bg-transparent"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="bingo-label text-[10px] mb-4">
                🏙️ who lives on the rooftop
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { emoji: "🐕", name: "Companion", role: "Your AI Chief of Staff" },
                  { emoji: "🦅", name: "Situations Mgr", role: "Always scanning ahead" },
                  { emoji: "🐱", name: "Voice of Concern", role: "Your gut feeling" },
                  { emoji: "🦁", name: "Project Manager", role: "Gets things done" },
                  { emoji: "🦉", name: "Journalist", role: "Brings back intel" },
                  { emoji: "🐻", name: "Source of Truth", role: "Guards accuracy" },
                  { emoji: "✨", name: "Angel", role: "Moral compass" },
                ].map((avatar) => (
                  <div
                    key={avatar.name}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <span className="text-lg">{avatar.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white/80 truncate">
                        {avatar.name}
                      </div>
                      <div className="text-[10px] text-white/40 truncate">
                        {avatar.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── Section 4: Scale Tease ─── */}
        <section className="mb-8 text-center py-8">
          <p className="text-lg sm:text-xl text-white/70 font-medium mb-2">
            This is <span className="text-[#ff8833]">one building</span>.
          </p>
          <p className="text-sm text-white/40 mb-4">
            Imagine a whole city of initiatives working for you.
          </p>
          <Link href="/bingo-city/browse">
            <Button
              variant="outline"
              className="gap-2 border-white/10 text-white/60 hover:bg-white/5 hover:text-white/80"
            >
              Explore the City
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </section>

        {/* ─── Section 5: Backstage Tour ─── */}
        <section className="mb-8">
          <Card
            className="bg-transparent"
            style={{
              border: "1px solid rgba(255,136,51,0.15)",
              background: "linear-gradient(135deg, rgba(255,136,51,0.04) 0%, transparent 50%)",
            }}
          >
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="bingo-label text-[10px] mb-1 text-[#ff8833]/60">
                  🏗️ want to see how it's built?
                </div>
                <h3 className="text-base font-semibold text-white/90 mb-1">
                  Take the Backstage Tour
                </h3>
                <p className="text-xs text-white/45">
                  5 rooms. 5 minutes. See the rooftop society, the five floors,
                  the bingo grid, and the vision for your city.
                </p>
              </div>
              <HardHatTour />
            </CardContent>
          </Card>
        </section>
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
