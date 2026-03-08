# 🏐SIDEOUT

**Real-time Web-Based e-Scoresheet & Analytics System**

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Zustand**, and **Supabase**.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Live Scoring** | Rally scoring, 25-pt sets (win by 2), 15-pt 5th set |
| **Role-Specific Stats** | OH/OPP/MB: Attacks + Blocks · S: Assists + Exc Sets · L: Digs + Receptions |
| **PoG Algorithm** | `K×1.0 + BLK×1.5 + ACE×1.2 + AST×0.5 + DIG×1.0 − ERR×1.0` |
| **Court Grid** | Visual 6-position grid with rotation engine and Libero swap |
| **Match Log + Undo** | Full play-by-play with one-click undo (reverts DB + state) |
| **Analytics** | Recharts bar/pie charts, team comparison, set distribution |
| **PDF Export** | Full match report with jsPDF + autotable |
| **CSV Export** | Complete play-by-play log download |
| **Supabase Sync** | Every action logged to `match_logs` table in real-time |
| **Persist on Refresh** | Zustand `persist` middleware saves state to `localStorage` |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/volleytrack-pro
cd volleytrack-pro
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → **Run**
3. Go to **Settings → API** → copy your URL and anon key

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
volleytrack-pro/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Entry point (Server Component)
│   └── globals.css         # Tailwind + custom styles
│
├── components/
│   ├── MatchClient.tsx     # Main client orchestrator
│   ├── ui/
│   │   ├── Header.tsx      # Top nav with view tabs
│   │   └── Scoreboard.tsx  # Live score display
│   ├── court/
│   │   ├── CourtGrid.tsx   # 6-position visual court
│   │   └── PlayerChip.tsx  # Bench player chip
│   ├── panels/
│   │   ├── ActionPanel.tsx     # Role-specific stat buttons
│   │   ├── MatchLog.tsx        # Play-by-play + Undo
│   │   └── PogLeaderboard.tsx  # Real-time PoG sidebar
│   └── analytics/
│       ├── StatsView.tsx       # Full stats table
│       ├── AnalyticsView.tsx   # Recharts dashboards
│       └── PostGameScreen.tsx  # End-of-match + exports
│
├── store/
│   └── useGameStore.ts     # Zustand store (persist + immer)
│
├── lib/
│   ├── supabase.ts         # Supabase client + DB helpers
│   ├── game-logic.ts       # Pure game engine functions
│   └── export.ts           # PDF (jsPDF) + CSV export
│
├── types/
│   └── index.ts            # All TypeScript types + constants
│
└── supabase/
    └── schema.sql          # Complete DB schema + views + RLS
```

---

## 🎮 How to Score a Match

1. **Select team** (HOME / AWAY) using the top buttons
2. **Tap a player** on the court grid or bench to select them
3. **Tap an action button** in the Action Panel:
   - ⚡ **Attack** (Spikers only): Kill / Error / Attempt
   - 🛡 **Block** (Spikers): Block point
   - 🎯 **Setting** (Setter): Assist / Exc. Set
   - 🦺 **Defense** (Libero): Exc. Dig / Reception ✓✓ ✓ ✗
   - 🏐 **Service** (all): Ace / Service Error
   - 🤲 **Reception** (non-Libero): Perfect / Good / Error
4. **Point actions** (●) automatically update the scoreboard and trigger rotation if needed
5. Use **↩ UNDO** in the Match Log sidebar to revert the last action

---

## 🔄 Rotation Logic

- Players rotate **clockwise** on side-out: `Pos1 → Pos6 → Pos5 → Pos4 → Pos3 → Pos2 → Pos1`
- Array representation: last element moves to front
- **Libero swap**: tap **L↔** below any back-row position (1, 5, 6) to swap the Libero in/out without a substitution event

---

## 🗄️ Database Schema

### `matches`
| Column | Type | Description |
|---|---|---|
| `id` | text | Match UUID |
| `home_team_name` | text | |
| `away_team_name` | text | |
| `home_sets` / `away_sets` | int | Sets won |
| `status` | text | `active` or `complete` |
| `game_state` | jsonb | Full Zustand state snapshot |

### `match_logs`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Auto-generated |
| `match_id` | text | FK → matches |
| `player_id` | text | |
| `action_type` | text | `kill`, `block`, `ace`, etc. |
| `position` | int | Court position 1–6 at time of action |
| `set_number` | int | 1–5 |
| `home_score` / `away_score` | int | Score at time of action |
| `timestamp` | timestamptz | |

### Views
- **`match_player_stats`** — Aggregated stats + PoG score per player (server-side calculation)
- **`match_summary`** — Quick overview of all matches with winner + duration

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next@14` | App Router, Server Components |
| `zustand` + `immer` | State management with immer mutations |
| `@supabase/supabase-js` | Database client |
| `recharts` | Bar/Pie analytics charts |
| `jspdf` + `jspdf-autotable` | PDF match report export |
| `tailwindcss` | Utility-first styling |

---

## 🛠️ Customization

### Change Team Names
Edit `lib/game-logic.ts` → `buildDefaultHomeTeam()` / `buildDefaultAwayTeam()`, or call `useGameStore.initMatch("Team A", "Team B")`.

### Change PoG Weights
Edit `types/index.ts` → `POG_WEIGHTS` constant.

### Add Auth
Replace the open RLS policies in `schema.sql` with `auth.uid()` checks, then wrap the app in a Supabase auth provider.

---

## 📄 License

MIT — free for personal and commercial use.
