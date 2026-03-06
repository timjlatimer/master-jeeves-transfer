/**
 * BingoCityWelcome.tsx — Stage 1: Welcome Page (the front door)
 *
 * DESIGN: "Warm Noir" — cinematic dark, warm orange accent, empathy-first
 * Ruby Red understands in 5 seconds: "This is a team of AI helpers organized
 * into a bingo card. Each square is something they're building for me."
 *
 * KEY UPGRADES:
 * - IsometricBuilding replaces BuildingVisual — 50% Pixar level
 * - Team toggle: rooftop ↔ floors
 * - "Explore the City" → /bingo-city/city (3D view)
 * - Surprise & delight: "Join the City" invitation
 * - Jeeves hook: "Open in Mission Control →" placeholder
 *
 * shadcn/ui: Button, Card, CardContent
 * Icons: ArrowRight, Sparkles, Building2, Globe (Lucide)
 * Routing: wouter Link
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Building2, Globe, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import IsometricBuilding from "./components/IsometricBuilding";
import StatsStrip from "./components/StatsStrip";
import { useBingoSquares } from "./data/mockData";

// Jeeves integration hook — replace this URL with the real Learning Loop URL
const JEEVES_MISSION_CONTROL_URL = "/dashboard";

export default function BingoCityWelcome() {
  const [teamOnRoof, setTeamOnRoof] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState<any>(null);
  const { data: squares } = useBingoSquares("ruby-red-maven");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a14 0%, #0c0c1a 50%, #0a0a14 100%)",
        display: "flex",
        flexDirection: "column",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Top bar ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        {/* Bingo City wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, #ff8833, #ff6600)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}>🏙️</div>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.9)",
          }}>
            BINGO <span style={{ color: "#ff8833" }}>CITY</span>
          </span>
        </div>

        {/* Mission Control link — Jeeves hook */}
        <a
          href={JEEVES_MISSION_CONTROL_URL}
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          Mission Control →
        </a>
      </header>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px 32px",
        gap: 0,
      }}>

        {/* ── Hero headline ── */}
        <div style={{ textAlign: "center", marginBottom: 24, maxWidth: 420 }}>
          <div style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#ff8833",
            marginBottom: 10,
          }}>
            ★ Move 37 — The Game-Changing Insight
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 6vw, 36px)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 12,
            color: "rgba(255,255,255,0.95)",
          }}>
            Welcome to{" "}
            <span style={{ color: "#ff8833" }}>Bingo City</span>
          </h1>
          <p style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.65,
            maxWidth: 360,
            margin: "0 auto",
          }}>
            A simple 5×5 Bingo Card that carries an entire AI civilization.
            Your personal city of advocates, working around the clock
            to make life less expensive for you.
          </p>
          <div style={{
            marginTop: 12,
            padding: "8px 16px",
            background: "rgba(255,136,51,0.08)",
            border: "1px solid rgba(255,136,51,0.2)",
            borderRadius: 8,
            display: "inline-block",
          }}>
            <span style={{
              fontSize: 12,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.5)",
            }}>
              "It's expensive to be poor." — We're changing that.
            </span>
          </div>
        </div>

        {/* ── Team toggle control ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <button
            onClick={() => setTeamOnRoof(true)}
            style={{
              background: teamOnRoof ? "rgba(255,136,51,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${teamOnRoof ? "rgba(255,136,51,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              color: teamOnRoof ? "#ff8833" : "rgba(255,255,255,0.35)",
              fontSize: 11,
              fontFamily: "monospace",
              padding: "5px 14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🏢 Team on Rooftop
          </button>
          <button
            onClick={() => setTeamOnRoof(false)}
            style={{
              background: !teamOnRoof ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${!teamOnRoof ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              color: !teamOnRoof ? "#60a5fa" : "rgba(255,255,255,0.35)",
              fontSize: 11,
              fontFamily: "monospace",
              padding: "5px 14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🏗️ Send to Floors
          </button>
        </div>

        {/* ── Isometric Building (the hero visual) ── */}
        <div style={{ width: "100%", maxWidth: 480, marginBottom: 20 }}>
          <IsometricBuilding
            squares={squares}
            teamOnRoof={teamOnRoof}
            onSquareClick={(sq) => setSelectedSquare(sq)}
            compact={false}
          />
        </div>

        {/* ── Square detail popup (when a window is clicked) ── */}
        {selectedSquare && (
          <div style={{
            width: "100%",
            maxWidth: 480,
            marginBottom: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>
                {selectedSquare.title}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                Floor {selectedSquare.floor} · {selectedSquare.status.replace("_", " ")} · {selectedSquare.owner}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.4 }}>
                {selectedSquare.description}
              </div>
            </div>
            <button
              onClick={() => setSelectedSquare(null)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 16,
                padding: 4,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 480,
          marginBottom: 24,
        }}>
          {/* Primary CTA */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/bingo-city/card/ruby-red-maven" style={{ flex: 1, textDecoration: "none" }}>
              <button style={{
                width: "100%",
                padding: "14px 20px",
                background: "linear-gradient(135deg, #ff8833, #ff6600)",
                border: "none",
                borderRadius: 10,
                color: "black",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 20px rgba(255,136,51,0.3)",
                transition: "all 0.2s ease",
              }}>
                ✨ Just Show Me
              </button>
            </Link>
            <Link href="/bingo-city/browse" style={{ flex: 1, textDecoration: "none" }}>
              <button style={{
                width: "100%",
                padding: "14px 20px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}>
                Pick a Card →
              </button>
            </Link>
          </div>

          {/* 3D City CTA — the wow button */}
          <Link href="/bingo-city/city" style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%",
              padding: "14px 20px",
              background: "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(168,85,247,0.12))",
              border: "1px solid rgba(96,165,250,0.25)",
              borderRadius: 10,
              color: "rgba(255,255,255,0.85)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
            }}>
              🏙️ Explore the Whole City →
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>3D</span>
            </button>
          </Link>
        </div>

        {/* ── How it works — 3-step explainer ── */}
        <div style={{
          width: "100%",
          maxWidth: 480,
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginBottom: 12,
          }}>
            How it works
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { num: "1", title: "The Grid", desc: "A 5×5 bingo card — 25 things being built for you. Each square is a promise." },
              { num: "2", title: "The Building", desc: "Each card becomes a 5-storey building. Each floor is a category of work. Windows glow when work is done." },
              { num: "3", title: "The City", desc: "Multiple buildings form a city. Your city. A civilization of AI advocates working for you." },
            ].map((step) => (
              <div key={step.num} style={{
                display: "flex",
                gap: 12,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(255,136,51,0.12)",
                  border: "1px solid rgba(255,136,51,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#ff8833",
                  flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── "Join the City" invitation — surprise & delight ── */}
        <div style={{
          width: "100%",
          maxWidth: 480,
          padding: "20px",
          background: "linear-gradient(135deg, rgba(255,136,51,0.08), rgba(255,100,0,0.04))",
          border: "1px solid rgba(255,136,51,0.2)",
          borderRadius: 12,
          textAlign: "center",
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>🏙️</div>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 6,
          }}>
            Ruby Red Gets Her Own Bingo City.
          </div>
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            marginBottom: 14,
          }}>
            The same architecture that powers the Solve Team collapses into a personal city
            for the working mother. Five advocates. Budget Guardian. Benefits Navigator.
            Deal Hunter. Bill Strategist. Advocate. All working for you.
          </div>
          <div style={{
            fontSize: 11,
            fontStyle: "italic",
            color: "#ff8833",
            opacity: 0.8,
          }}>
            "It's free to have a city working for you."
          </div>
        </div>

      </main>

      {/* ── Stats Strip ── */}
      <StatsStrip />

      {/* ── Footer ── */}
      <footer style={{
        textAlign: "center",
        padding: "12px 16px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <p style={{
          fontSize: 10,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.2)",
          fontStyle: "italic",
        }}>
          "It's expensive to be poor." — We're changing that.
        </p>
      </footer>
    </div>
  );
}
