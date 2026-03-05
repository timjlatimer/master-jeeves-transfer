# Bingo City — A Self-Organizing AI Civilization

**Live Demo:** https://bingocity-kpqhagya.manus.space

Bingo City is a complete full-stack web application implementing Tim's vision of a self-organizing AI civilization built on Swiss governance principles, Kahneman's decision-making systems, and empathetic design for the working poor.

## Overview

Bingo City is a five-storey isometric building rendered in 3D with Three.js, featuring a rooftop society of 11 Pixar-style avatars representing different roles and decision-making systems. The application combines a dashboard infographic view with an interactive 3D building, Swiss governance model with petition escalation, swarm mind modes, and persistent data storage.

### Core Architecture

The application is built on three foundational concepts:

1. **The Building** — Five color-coded floors representing infrastructure (blue), data (green), operations (amber), community (red), and governance (gold).

2. **The Rooftop Society** — Three zones containing:
   - **Left Side (Professional Team)**: Project Manager, Situations Manager, Companion, Source of Truth, "I Got a Guy" Connector inside a brass stanchion inner ring
   - **Center**: Angel of Your Better Nature (moral compass)
   - **Right Corner**: Voice of Concern (purple cat on bench, emotional anchor)
   - **Outside**: Swarm Workers, Journalists, QA Sentinel debating and executing
   - **Edges**: Semi-transparent Wisdom Giants phasing in and out

3. **Swiss Governance** — Subsidiarity mapping (Commune/Canton/Confederation) with petition escalation system and benevolent dictator override.

## Features

### Dashboard View
- Annotated infographic showing all Bingo City concepts
- Three-zone topology explanation
- Inner Ring governance boundary with full roster table
- Swiss governance model visualization
- Petition escalation thresholds (5 levels)
- Swarm Mind modes (Chorus, Ensemble, Squadron)
- Minimum Viable City specification
- Avatar customization engine
- Move 37 insight section

### 3D View
- Five-storey isometric building with color-coded glass floors
- Rooftop with 11 clickable avatars
- Brass stanchion boundary for inner ring
- Orbit controls (drag to rotate, scroll to zoom)
- Auto-rotating camera
- Avatar detail panels on click
- Floor legend and controls hint

### Interactive Features
- **5x5 Bingo Grid** — Status tracking (empty, active, complete, blocked) with persistence
- **Governance Panel** — Create and endorse petitions with escalation tracking
- **News Channel** — Post and read news items by category
- **Swarm Mode Selector** — Switch between Chorus, Ensemble, Squadron modes
- **Avatar Chat** — Talk with any avatar for guidance and support
- **Settings Panel** — Animation continuum slider, communication preferences
- **Quick Avatar Access** — Lower-left corner buttons for rapid chat access

### Technical Features
- Dark Noir Metropolis Art Deco theme with brass gold accents
- Mobile-friendly responsive design
- Full-stack persistence with MySQL database
- tRPC for type-safe API routes
- Vitest unit tests
- No JSON parse errors — fully tested
- Supports both authenticated and unauthenticated users

## Local Setup

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL database (local or remote)

### Installation

1. Clone the repository:
```bash
cd bingo-city-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
DATABASE_URL=mysql://user:password@localhost:3306/bingo_city
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

4. Push database schema:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
bingo-city-app/
├── client/                 # React 19 frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, DashboardView, BuildingView)
│   │   ├── components/    # Reusable components (BingoGrid, GovernancePanel, etc.)
│   │   ├── lib/           # Shared data constants and utilities
│   │   ├── App.tsx        # Main router and layout
│   │   └── index.css      # Dark theme CSS with Art Deco styling
│   └── index.html         # HTML entry point with fonts
├── server/                # Express + tRPC backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── bingo.test.ts      # Vitest unit tests
│   └── _core/             # Framework-level code (auth, context, etc.)
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── shared/                # Shared constants
└── package.json           # Dependencies and scripts
```

## Key Files

- **`client/src/pages/DashboardView.tsx`** — Annotated infographic with all Bingo City concepts
- **`client/src/pages/BuildingView.tsx`** — Three.js 3D building with rooftop society
- **`client/src/pages/Home.tsx`** — Main page with view toggle and side panels
- **`client/src/lib/data.ts`** — All shared data constants (avatars, floors, governance, etc.)
- **`server/routers.ts`** — tRPC routes for bingo cards, petitions, news, chat, preferences
- **`drizzle/schema.ts`** — Database tables for persistence
- **`client/src/index.css`** — Dark Noir Metropolis theme with CSS variables

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Database
pnpm db:push          # Generate and apply migrations

# Testing
pnpm test             # Run Vitest unit tests

# Build & Deploy
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
```

## The Vision: Ruby Red's Bingo City

Bingo City is designed for Ruby Red — the 35-45 year old mom of two trying to make her finances stretch until payday. She's facing complex decisions every day: Should she put something back at the grocery checkout? Can the kids go to that $30 extracurricular? How does she pay for the flat tire?

The system empowers her with three core avatars:

1. **The Companion** — Friendly, learns her preferences, makes the system feel human
2. **Situations Manager** — Knows where she is, what's happening, what's coming next
3. **Voice of Concern** — Validates her gut feelings, ensures logic doesn't override wisdom

As she grows more comfortable, the full rooftop society emerges — Project Manager, Source of Truth, "I Got a Guy" Connector, and others — forming a complete AI civilization working *for* her, not *at* her.

**Move 37:** Ruby Red doesn't just benefit from Bingo City. Ruby Red gets her own Bingo City.

## Governance Model

Bingo City uses Swiss-style subsidiarity: "Nothing that can be done at a lower level should be done at a higher level."

- **Commune** — Individual Bingo Card (maximum local autonomy)
- **Canton** — Initiative Cluster / Pope's Domain (regional coordination)
- **Confederation** — HB1000 / Master Jeeves (system-wide decisions)

Petitions escalate through five levels:
1. Rooftop Discussion (any avatar raises an issue)
2. Formal Petition (10+ endorsements)
3. Inner Ring Vote (inner ring decides)
4. Pope Review (cross-card implications)
5. Master Jeeves (benevolent dictator override)

## Swarm Mind Modes

The rooftop society shifts between three operational modes:

- **CHORUS** — Equal voice, brainstorming, town hall mode (circle formation)
- **ENSEMBLE** — Specialist sections, Project Manager conducts (grouped by specialty)
- **SQUADRON** — Emergency formation, Situations Manager at point, crisis response (V-formation)

## Avatar Roles

### Inner Ring (Professional Team)
- **Project Manager** (Lion) — Leadership, apex of rooftop
- **Situations Manager** (Hawk) — Real-time awareness, minimum latency
- **Companion** (Golden Retriever) — Primary interface, communication orchestrator
- **Source of Truth** (Owl) — Baseline protection, institutional memory
- **"I Got a Guy" Connector** (Bear) — Community connection, social graph restoration

### Outer Ring (Execution & Intelligence)
- **QA Sentinel** (Eagle) — Quality assurance, pattern detection
- **Journalist** (Hummingbird) — Cloud Butterfly carriers, cross-card intelligence
- **Swarm Workers** (Bees) — Task execution, mode shifting

### Special Avatars
- **Voice of Concern** (Purple Cat) — Permanent emotional anchor, intuition
- **Angel of Your Better Nature** (Phoenix) — Moral compass, appears during difficult decisions
- **Wisdom Giants** (Translucent) — Real humans with lived experience, fractional HB1000

## Design Philosophy

The application embodies these principles:

1. **Empathy First** — Designed for Ruby Red, the working poor mother. "It's expensive to be poor" becomes "It's free to have a city working for you."

2. **Swiss Governance** — Subsidiarity, consensus, benevolent dictator override. Democracy + village model + wise leadership.

3. **Kahneman's Systems** — System 1 (intuition/Voice of Concern), System 2 (rational/Professional Team), System 3 (moral/Angel).

4. **Pixar Aesthetics** — Approachable, warm, expressive avatars that feel like friends, not algorithms.

5. **Dark Art Deco** — Noir Metropolis theme with brass gold accents. Sophisticated, trustworthy, timeless.

## Testing

All features are covered by Vitest unit tests:

```bash
pnpm test
```

Tests verify:
- Authentication flows (auth.me, auth.logout)
- Public access (news.list, petition.list)
- Protected procedures (bingo card CRUD, chat, preferences)
- Router structure and procedure availability

## Deployment

The application is deployed on Manus infrastructure and available at:
**https://bingocity-kpqhagya.manus.space**

To deploy your own instance:
1. Push changes to this repository
2. The deployment pipeline will automatically build and deploy
3. Database migrations run automatically on deploy

## Future Enhancements

- Voice synthesis for avatar responses (ElevenLabs integration)
- Real-time collaborative Bingo Cards (WebSocket support)
- Advanced analytics dashboard for initiative tracking
- Integration with external services (calendar, email, banking APIs)
- Customizable avatar personalities and visual styles
- Mobile app with offline support
- Multi-language support for international communities

## Credits

Built by the SIC HB1000 Solve Team with empathy for Ruby Red and all working poor families. Designed to prove that "It's expensive to be poor" can become "It's free to have a city working for you."

---

**Quote:** "Nothing that can be done at a lower level should be done at a higher level." — Swiss Federal Constitution Principle of Subsidiarity

**Vision:** "Ruby Red does not just benefit from Bingo City. Ruby Red gets her own Bingo City."
