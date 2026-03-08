// ─── ROLES ───────────────────────────────────────────────────────────────────
export type PlayerRole = "OH" | "OPP" | "MB" | "S" | "L";
export type TeamKey = "home" | "away";
export type ActionType =
  | "kill" | "attackError" | "attempt"
  | "block"
  | "ace" | "serviceError"
  | "assist" | "excSet"
  | "excDig"
  | "recPerfect" | "recGood" | "recError";

// ─── STATS ───────────────────────────────────────────────────────────────────
export interface PlayerStats {
  kills: number;
  attackErrors: number;
  totalAttempts: number;
  blocks: number;
  aces: number;
  serviceErrors: number;
  assists: number;
  excSets: number;
  excDigs: number;
  receptions: {
    perfect: number;
    good: number;
    error: number;
  };
}

export function emptyStats(): PlayerStats {
  return {
    kills: 0, attackErrors: 0, totalAttempts: 0,
    blocks: 0, aces: 0, serviceErrors: 0,
    assists: 0, excSets: 0, excDigs: 0,
    receptions: { perfect: 0, good: 0, error: 0 },
  };
}

// ─── PLAYER ──────────────────────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  stats: PlayerStats;
}

// ─── TEAM ────────────────────────────────────────────────────────────────────
export interface Team {
  name: string;
  color: string;
  players: Player[];
  rotation: string[];    // player IDs for positions 0-5 (pos 1-6)
  serving: boolean;
  sets: number[];        // wins per set index
  currentScore: number;
}

// ─── LOG ENTRY ───────────────────────────────────────────────────────────────
export interface LogEntry {
  id: string;
  timestamp: string;
  teamKey: TeamKey;
  teamName: string;
  playerId: string;
  playerName: string;
  playerNumber: number;
  action: ActionType;
  set: number;
  homeScore: number;
  awayScore: number;
}

// ─── GAME STATE ──────────────────────────────────────────────────────────────
export interface GameState {
  matchId: string;
  teams: Record<TeamKey, Team>;
  currentSet: number;
  log: LogEntry[];
  liberoSwap: Record<TeamKey, string | null>;
  gameOver: boolean;
  startedAt: string;
}

// ─── SUPABASE DB TYPES ───────────────────────────────────────────────────────
export interface MatchLogRow {
  id: string;
  match_id: string;
  player_id: string;
  player_name: string;
  player_number: number;
  team_key: TeamKey;
  action_type: ActionType;
  position: number | null;
  set_number: number;
  home_score: number;
  away_score: number;
  timestamp: string;
  created_at: string;
}

export interface MatchRow {
  id: string;
  home_team_name: string;
  away_team_name: string;
  home_sets: number;
  away_sets: number;
  status: "active" | "complete";
  started_at: string;
  ended_at: string | null;
  game_state: GameState;
  created_at: string;
}

// ─── COMPUTED ────────────────────────────────────────────────────────────────
export interface PlayerWithMeta extends Player {
  teamKey: TeamKey;
  teamName: string;
  teamColor: string;
  pogScore: number;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const ROLE_COLORS: Record<PlayerRole, string> = {
  OH: "#f97316", OPP: "#a855f7", MB: "#3b82f6", S: "#10b981", L: "#f59e0b",
};

export const ROLE_LABELS: Record<PlayerRole, string> = {
  OH: "Outside Hitter", OPP: "Opposite Hitter",
  MB: "Middle Blocker", S: "Setter", L: "Libero",
};

export const POG_WEIGHTS = {
  kills: 1.0, blocks: 1.5, aces: 1.2,
  assists: 0.5, excDigs: 1.0, errors: -1.0,
} as const;

export const ACTION_LABELS: Record<ActionType, string> = {
  kill: "Kill", attackError: "Attack Error", attempt: "Attempt",
  block: "Block", ace: "Ace", serviceError: "Service Error",
  assist: "Assist", excSet: "Excellent Set",
  excDig: "Excellent Dig",
  recPerfect: "Perfect Reception", recGood: "Good Reception", recError: "Reception Error",
};

export const SPIKERS: PlayerRole[] = ["OH", "OPP", "MB"];
export const BACK_ROW_POSITIONS = [0, 4, 5]; // indices for positions 1, 5, 6
