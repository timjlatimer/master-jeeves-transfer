/**
 * BingoCityWelcome.tsx — Stage 1: Welcome Page (the front door)
 *
 * DESIGN: "Warm Noir" — cinematic dark, warm orange accent, empathy-first
 * Ruby Red understands in 5 seconds: "This is a team of AI helpers organized
 * into a bingo card. Each square is something they're building for me."
 *
 * shadcn/ui: Button, Card, CardContent
 * Icons: ArrowRight, Sparkles (Lucide)
 * Routing: wouter Link
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import BuildingVisual from "./components/BuildingVisual";
import StatsStrip from "./components/StatsStrip";

export default function BingoCityWelcome() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3">
        <div />
        <Link
          href="/dashboard"
          className="text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
        >
          Mission Control →
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white/95 mb-3">
            Welcome to{" "}
            <span className="text-[#ff8833]">Bingo City</span>
          </h1>
          <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed">
            A team of AI helpers, organized into a bingo card.
            Each square is something they're building for you.
            Watch the progress — your city is growing.
          </p>
        </div>

        {/* Hero Building */}
        <div className="w-full max-w-xs mx-auto mb-8 sm:mb-10">
          <BuildingVisual variant="hero" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto mb-10">
          <Link href="/bingo-city/card/ruby-red-maven" className="flex-1">
            <Button
              className="w-full gap-2 bg-[#ff8833] text-black hover:bg-[#ff8833]/90 font-semibold text-sm py-5"
            >
              <Sparkles className="w-4 h-4" />
              Just Show Me
            </Button>
          </Link>
          <Link href="/bingo-city/browse" className="flex-1">
            <Button
              variant="outline"
              className="w-full gap-2 border-white/10 text-white/70 hover:bg-white/5 hover:text-white/90 text-sm py-5"
            >
              Pick a Card
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* What is this? — quick explainer */}
        <Card
          className="w-full max-w-md mx-auto mb-10 bg-transparent"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <CardContent className="p-4">
            <div className="bingo-label text-[10px] mb-2">how it works</div>
            <div className="space-y-2 text-sm text-white/60 leading-relaxed">
              <p>
                <span className="text-white/80 font-medium">Each building</span> is an
                initiative — a set of 25 things being built for you.
              </p>
              <p>
                <span className="text-white/80 font-medium">Each floor</span> is a
                category — from infrastructure to governance.
              </p>
              <p>
                <span className="text-white/80 font-medium">On the rooftop</span> sits a
                team of AI avatars working together on your behalf.
              </p>
              <p>
                <span className="text-white/80 font-medium">Multiple buildings</span>{" "}
                form a city — your city of support.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Stats Strip */}
      <StatsStrip />

      {/* Footer */}
      <footer className="text-center py-4 px-4">
        <p className="text-[10px] font-mono text-white/20 italic">
          "It's expensive to be poor." — We're changing that.
        </p>
      </footer>
    </div>
  );
}
