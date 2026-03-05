# Bingo City Front-End Components

**Built for Jeeves (Master Jeeves) to integrate into the V14 Learning Loop Mission Control app.**

> "It's expensive to be poor." — We're changing that.

## What This Is

A complete set of React 19 + TypeScript components that render the Bingo City consumer-facing front door. These are **standalone components with mock data** — Jeeves wires them to real tRPC endpoints.

Ruby Red understands in 5 seconds: *"This is a team of AI helpers organized into a bingo card. Each square is something they're building for me. I can see the progress."*

---

## File Structure

```
client/src/pages/bingo-city/
├── BingoCityWelcome.tsx    ← Stage 1: Welcome page (front door)
├── BingoCityBrowse.tsx     ← Stage 2: Browse all initiative cards
├── BingoCityCard.tsx       ← Stage 3: Card detail (the main experience)
├── components/
│   ├── BuildingVisual.tsx  ← Full building with rooftop + floors
│   ├── BingoGrid.tsx       ← 5x5 interactive grid (25 cells)
│   ├── RooftopTeam.tsx     ← Emoji avatars in 3-zone layout
│   ├── FloorStack.tsx      ← Mini/full 5-floor stack
│   ├── HardHatTour.tsx     ← 5-room backstage tour dialog
│   └── StatsStrip.tsx      ← Stats bar (buildings, squares, roles)
└── data/
    └── mockData.ts         ← All mock data + tRPC-style hooks
```

---

## What Each File Does

### Pages

| File | Route | Purpose |
|------|-------|---------|
| `BingoCityWelcome.tsx` | `/bingo-city` | Front door. Hero building visual, "Just Show Me" + "Pick a Card" buttons, stats strip, "Mission Control →" link. |
| `BingoCityBrowse.tsx` | `/bingo-city/browse` | Grid of initiative cards. Each shows title, description, mini floor stack, progress bar, owner name. |
| `BingoCityCard.tsx` | `/bingo-city/card/:id` | The main experience. Card title/stats, 5-storey building, 5x5 bingo grid, rooftop society, scale tease, backstage tour. |

### Components

| Component | Used By | What It Does |
|-----------|---------|--------------|
| `BuildingVisual.tsx` | Welcome (hero), Card Detail (interactive) | CSS-drawn 5-storey building with rooftop avatars. Two variants: `hero` (welcome page) and `detail` (interactive with floor clicking). |
| `BingoGrid.tsx` | Card Detail | 5x5 grid of 25 squares. Status colors (gray/blue/green/red). Center square (#13) highlighted. Floor row highlighting when a floor is clicked. |
| `RooftopTeam.tsx` | BuildingVisual, Card Detail | Emoji avatars with roles. `compact` variant (3 key avatars) and `full` variant (3-zone layout: Professional Team, Angel, Voice of Concern). |
| `FloorStack.tsx` | BuildingVisual, Browse cards | Stacked colored bars for 5 floors. `mini` (browse cards) and `full` (interactive with progress counts). |
| `HardHatTour.tsx` | Card Detail | shadcn Dialog with 5-room walkthrough. Uses CDN images from the existing visual assets. |
| `StatsStrip.tsx` | Welcome | Horizontal strip showing: buildings count, bingo squares, avatar roles, floors per building. |

### Data

| File | What It Contains |
|------|-----------------|
| `mockData.ts` | All types, floor definitions, rooftop avatars, 25 Ruby Red Maven squares, 6 mock cards, status config, tour rooms, CDN image URLs, and mock tRPC-style hooks. |

---

## tRPC Endpoints Expected

When Jeeves integrates, replace the mock hooks in `mockData.ts` with real tRPC calls:

```typescript
// CURRENT (mock):
import { useBingoCards, useBingoCard, useBingoSquares } from "./data/mockData";

// REPLACE WITH:
const { data: cards } = trpc.bingoCards.list.useQuery();
const { data: card } = trpc.bingoCards.getById.useQuery({ id });
const { data: squares } = trpc.bingoSquares.getByCardId.useQuery({ cardId: id });
```

| Hook | tRPC Endpoint | Returns |
|------|--------------|---------|
| `useBingoCards()` | `trpc.bingoCards.list.useQuery()` | `BingoCard[]` — all initiative cards |
| `useBingoCard(id)` | `trpc.bingoCards.getById.useQuery({ id })` | `BingoCard` — single card with stats |
| `useBingoSquares(cardId)` | `trpc.bingoSquares.getByCardId.useQuery({ cardId })` | `BingoSquare[]` — 25 squares for a card |
| `useRooftopAvatars()` | `trpc.rooftopAvatars.list.useQuery()` | `RooftopAvatar[]` — avatar definitions |

---

## shadcn/ui Components Used

| Component | Import Path | Used In |
|-----------|------------|---------|
| `Button` | `@/components/ui/button` | Welcome, Browse, Card Detail, HardHatTour |
| `Card`, `CardContent` | `@/components/ui/card` | Welcome, Browse, Card Detail |
| `Badge` | `@/components/ui/badge` | Browse, Card Detail, BingoGrid, RooftopTeam |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger` | `@/components/ui/dialog` | HardHatTour |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.x | UI framework |
| `react-dom` | ^19.x | DOM rendering |
| `typescript` | ^5.6 | Type safety |
| `tailwindcss` | ^4.x | Styling (Tailwind CSS 4) |
| `wouter` | ^3.x | Client-side routing |
| `lucide-react` | ^0.453 | Icons (ArrowLeft, ArrowRight, Building2, ChevronLeft, ChevronRight, HardHat, Sparkles) |
| `@radix-ui/react-dialog` | ^1.x | Dialog primitive (via shadcn) |
| `class-variance-authority` | ^0.7 | Component variants (via shadcn) |
| `clsx` | ^2.x | Class merging |
| `tailwind-merge` | ^3.x | Tailwind class deduplication |

---

## Routing (for App.tsx)

```tsx
import { Route, Switch } from "wouter";
import BingoCityWelcome from "./pages/bingo-city/BingoCityWelcome";
import BingoCityBrowse from "./pages/bingo-city/BingoCityBrowse";
import BingoCityCard from "./pages/bingo-city/BingoCityCard";

// Inside your Router:
<Route path="/bingo-city" component={BingoCityWelcome} />
<Route path="/bingo-city/browse" component={BingoCityBrowse} />
<Route path="/bingo-city/card/:id" component={BingoCityCard} />
```

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary accent | `#ff8833` | Warm orange — buttons, highlights, links |
| Background | `#0a0a14` → `#0c0c1a` | Deep dark gradient |
| F1 Infrastructure | `#1e40af` (Blue) | Floor 1 color |
| F2 Data | `#15803d` (Green) | Floor 2 color |
| F3 Operations | `#d97706` (Orange) | Floor 3 color |
| F4 Community | `#dc2626` (Red) | Floor 4 color |
| F5 Governance | `#ca8a04` (Gold) | Floor 5 color |
| Labels | `font-mono uppercase tracking-widest` | All section labels |
| Borders | `rgba(255,255,255,0.06)` | Very subtle |

---

## Images

The 5 PNG images are included in `public/images/` and also hosted on CDN. The CDN URLs are referenced in `mockData.ts` under `IMAGES` and in `TOUR_ROOMS`.

| Image | Description | CDN URL in mockData |
|-------|-------------|---------------------|
| `bingo_rooftop_pixar.png` | Pixar-style rooftop with AI avatars | `IMAGES.rooftopPixar` |
| `bingo_rooftop_annotated_v2.png` | Complete architecture reference | `IMAGES.annotatedV2` |
| `bingo_city_infographic.png` | Strategic vision infographic | `IMAGES.infographic` |
| `bingo_rooftop_visual.png` | Rooftop visual illustration | `IMAGES.rooftopVisual` |
| `bingo_rooftop_annotated.png` | Rooftop Society three-zone topology | `IMAGES.rooftopAnnotated` |

---

## Integration Steps for Jeeves

1. Copy the `client/src/pages/bingo-city/` directory into the existing project
2. Add the three routes to `App.tsx` (see Routing section above)
3. Replace mock hooks in `mockData.ts` with real tRPC calls
4. Ensure shadcn/ui components (`Button`, `Card`, `Badge`, `Dialog`) are installed
5. Verify Tailwind CSS 4 config includes the design tokens from `index.css`
6. Copy the 5 images to your preferred asset location (CDN URLs already work)

---

## The North Star

When Ruby Red lands on this page, she understands in 5 seconds:
- "This is a team of AI helpers organized into a bingo card"
- "Each square is something they're building for me"
- "I can see the progress"
- "There are real people and AI agents working on this"

If she can't understand that immediately, the design has failed.

---

*SIC HB1000 Solve Team — March 2026*
