import type {
  Player, PlayerStats, PlayerWithMeta, Team, TeamKey,
  ActionType, GameState,
} from "@/types";
import { POG_WEIGHTS, SPIKERS, emptyStats } from "@/types";

// ─── CALCULATIONS ─────────────────────────────────────────────────────────────
export function calcPogScore(stats: PlayerStats): number {
  return parseFloat((
    stats.kills * POG_WEIGHTS.kills +
    stats.blocks * POG_WEIGHTS.blocks +
    stats.aces * POG_WEIGHTS.aces +
    stats.assists * POG_WEIGHTS.assists +
    stats.excDigs * POG_WEIGHTS.excDigs -
    (stats.attackErrors + stats.serviceErrors) * Math.abs(POG_WEIGHTS.errors)
  ).toFixed(2));
}

export function calcHittingPct(stats: PlayerStats): string {
  if (stats.totalAttempts === 0) return "—";
  const pct = ((stats.kills - stats.attackErrors) / stats.totalAttempts) * 100;
  return `${pct.toFixed(1)}%`;
}

export function calcHittingPctRaw(stats: PlayerStats): number | null {
  if (stats.totalAttempts === 0) return null;
  return (stats.kills - stats.attackErrors) / stats.totalAttempts;
}

export function calcReceptionEfficiency(stats: PlayerStats): string {
  const total = stats.receptions.perfect + stats.receptions.good + stats.receptions.error;
  if (total === 0) return "—";
  const eff = ((stats.receptions.perfect + stats.receptions.good) / total) * 100;
  return `${eff.toFixed(1)}%`;
}

export function calcTeamStats(team: Team) {
  return team.players.reduce(
    (acc, p) => ({
      kills: acc.kills + p.stats.kills,
      attackErrors: acc.attackErrors + p.stats.attackErrors,
      totalAttempts: acc.totalAttempts + p.stats.totalAttempts,
      blocks: acc.blocks + p.stats.blocks,
      aces: acc.aces + p.stats.aces,
      serviceErrors: acc.serviceErrors + p.stats.serviceErrors,
      assists: acc.assists + p.stats.assists,
      excDigs: acc.excDigs + p.stats.excDigs,
      recPerfect: acc.recPerfect + p.stats.receptions.perfect,
      recGood: acc.recGood + p.stats.receptions.good,
      recError: acc.recError + p.stats.receptions.error,
    }),
    { kills: 0, attackErrors: 0, totalAttempts: 0, blocks: 0, aces: 0, serviceErrors: 0, assists: 0, excDigs: 0, recPerfect: 0, recGood: 0, recError: 0 }
  );
}

// ─── PLAYER ENRICHMENT ────────────────────────────────────────────────────────
export function enrichPlayers(
  teams: Record<TeamKey, Team>
): PlayerWithMeta[] {
  return (["home", "away"] as TeamKey[]).flatMap((tk) =>
    teams[tk].players.map((p) => ({
      ...p,
      teamKey: tk,
      teamName: teams[tk].name,
      teamColor: teams[tk].color,
      pogScore: calcPogScore(p.stats),
    }))
  ).sort((a, b) => b.pogScore - a.pogScore);
}

// ─── STAT APPLICATION ─────────────────────────────────────────────────────────
export function applyStatToPlayer(
  player: Player,
  action: ActionType
): Player {
  const stats = { ...player.stats, receptions: { ...player.stats.receptions } };

  switch (action) {
    case "kill": stats.kills++; stats.totalAttempts++; break;
    case "attackError": stats.attackErrors++; stats.totalAttempts++; break;
    case "attempt": stats.totalAttempts++; break;
    case "block": stats.blocks++; break;
    case "ace": stats.aces++; break;
    case "serviceError": stats.serviceErrors++; break;
    case "assist": stats.assists++; break;
    case "excSet": stats.excSets++; break;
    case "excDig": stats.excDigs++; break;
    case "recPerfect": stats.receptions.perfect++; break;
    case "recGood": stats.receptions.good++; break;
    case "recError": stats.receptions.error++; break;
  }

  return { ...player, stats };
}

// ─── IS POINT ACTION ─────────────────────────────────────────────────────────
export const POINT_ACTIONS: ActionType[] = ["kill", "block", "ace", "attackError", "serviceError"];
export const OPPONENT_POINT_ACTIONS: ActionType[] = ["attackError", "serviceError"];

export function isPointAction(action: ActionType): boolean {
  return POINT_ACTIONS.includes(action);
}

export function scoringTeam(teamKey: TeamKey, action: ActionType): TeamKey {
  return OPPONENT_POINT_ACTIONS.includes(action)
    ? (teamKey === "home" ? "away" : "home")
    : teamKey;
}

// ─── ROTATION ────────────────────────────────────────────────────────────────
/**
 * Rotate clockwise: pos 1→2→3→4→5→6→1
 * Array index: [0,1,2,3,4,5] = [pos1, pos2, pos3, pos4, pos5, pos6]
 * Clockwise rotation: last element moves to front
 */
export function rotateTeam(rotation: string[]): string[] {
  const r = [...rotation];
  const last = r.pop()!;
  r.unshift(last);
  return r;
}

// ─── SET CHECK ───────────────────────────────────────────────────────────────
export function checkSetWin(
  homeScore: number,
  awayScore: number,
  setIndex: number
): TeamKey | null {
  const limit = setIndex === 4 ? 15 : 25;
  if (homeScore >= limit && homeScore - awayScore >= 2) return "home";
  if (awayScore >= limit && awayScore - homeScore >= 2) return "away";
  return null;
}

// ─── DEFAULT TEAM BUILDERS ───────────────────────────────────────────────────
export function buildDefaultHomeTeam(): Team {
  return {
    name: "HOME",
    color: "#0ea5e9",
    players: [],
    rotation: [],
    serving: true,
    sets: [0, 0, 0, 0, 0],
    currentScore: 0,
  };
}

export function buildDefaultAwayTeam(): Team {
  return {
    name: "AWAY",
    color: "#f43f5e",
    players: [],
    rotation: [],
    serving: false,
    sets: [0, 0, 0, 0, 0],
    currentScore: 0,
  };
}

// ─── SET DISTRIBUTION (for pie chart) ────────────────────────────────────────
export function getSetDistribution(team: Team) {
  const setter = team.players.find((p) => p.role === "S");
  const attackers = team.players.filter((p) => SPIKERS.includes(p.role));
  // Approximate set distribution by kill count (proxy for sets received)
  const total = attackers.reduce((a, p) => a + p.stats.kills + p.stats.totalAttempts, 0);
  return attackers.map((p) => ({
    name: `#${p.number} ${p.name}`,
    role: p.role,
    value: p.stats.kills + p.stats.totalAttempts,
    percentage: total > 0
      ? Math.round(((p.stats.kills + p.stats.totalAttempts) / total) * 100)
      : 0,
  }));
}
