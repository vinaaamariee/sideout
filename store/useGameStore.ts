import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid"; // inline implementation below
import type { GameState, TeamKey, ActionType, LogEntry, PlayerRole } from "@/types";
import { emptyStats } from "@/types";
import {
  applyStatToPlayer, isPointAction, scoringTeam,
  rotateTeam, checkSetWin, buildDefaultHomeTeam, buildDefaultAwayTeam,
} from "@/lib/game-logic";
import {
  insertLogEntry, deleteLastLogEntry, updateMatch, createMatch,
} from "@/lib/supabase";

// ─── Inline nanoid replacement (no extra dep needed) ──────────────────────────
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── STORE SHAPE ─────────────────────────────────────────────────────────────
interface GameStore {
  // State
  game: GameState;
  selectedTeam: TeamKey;
  selectedPlayerId: string | null;
  isSyncing: boolean;

  // History for undo (not persisted)
  _history: GameState[];

  // Actions
  initMatch: (homeTeamName?: string, awayTeamName?: string) => void;
  selectTeam: (team: TeamKey) => void;
  selectPlayer: (playerId: string | null) => void;
  recordAction: (teamKey: TeamKey, playerId: string, action: ActionType) => void;
  undo: () => void;
  toggleLibero: (teamKey: TeamKey, positionIndex: number) => void;
  resetMatch: () => void;
  // Team / player setup
  updateTeamName: (teamKey: TeamKey, name: string) => void;
  updateTeamColor: (teamKey: TeamKey, color: string) => void;
  addPlayer: (teamKey: TeamKey, name: string, number: number, role: PlayerRole) => void;
  removePlayer: (teamKey: TeamKey, playerId: string) => void;
  updatePlayer: (teamKey: TeamKey, playerId: string, name: string, number: number, role: PlayerRole) => void;
  startMatch: () => void;
}

// ─── INITIAL GAME STATE ───────────────────────────────────────────────────────
function buildInitialGameState(): GameState {
  return {
    matchId: uid(),
    teams: {
      home: buildDefaultHomeTeam(),
      away: buildDefaultAwayTeam(),
    },
    currentSet: 0,
    log: [],
    liberoSwap: { home: null, away: null },
    gameOver: false,
    startedAt: new Date().toISOString(),
  };
}

// ─── STORE ────────────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      game: buildInitialGameState(),
      selectedTeam: "home",
      selectedPlayerId: null,
      isSyncing: false,
      _history: [],

      // ── Init / Reset ───────────────────────────────────────────────────────
      initMatch: (homeTeamName = "HOME", awayTeamName = "AWAY") => {
        const newState = buildInitialGameState();
        newState.teams.home.name = homeTeamName;
        newState.teams.away.name = awayTeamName;
        set((s) => {
          s.game = newState;
          s.selectedTeam = "home";
          s.selectedPlayerId = null;
          s._history = [];
        });
        // Persist to Supabase
        createMatch(newState.matchId, homeTeamName, awayTeamName, newState);
      },

      resetMatch: () => {
        const newState = buildInitialGameState();
        set((s) => {
          s.game = newState;
          s.selectedTeam = "home";
          s.selectedPlayerId = null;
          s._history = [];
        });
      },

      // ── Selection ─────────────────────────────────────────────────────────
      selectTeam: (team) => set((s) => {
        s.selectedTeam = team;
        s.selectedPlayerId = null;
      }),

      selectPlayer: (playerId) => set((s) => {
        s.selectedPlayerId = playerId;
      }),

      // ── Record Action (main game engine) ──────────────────────────────────
      recordAction: (teamKey, playerId, action) => {
        const prev = get().game;
        // Push to undo history (deep copy)
        const historySnapshot: GameState = JSON.parse(JSON.stringify(prev));

        set((s) => {
          s._history = [...s._history.slice(-49), historySnapshot];
        });

        set((s) => {
          const game = s.game;
          const team = game.teams[teamKey];
          const playerIdx = team.players.findIndex((p) => p.id === playerId);
          if (playerIdx === -1) return;

          // Apply stat to player
          team.players[playerIdx] = applyStatToPlayer(team.players[playerIdx], action);

          if (!isPointAction(action)) return;

          // Determine scoring team
          const winnerKey = scoringTeam(teamKey, action);
          const loserKey: TeamKey = winnerKey === "home" ? "away" : "home";
          const winningTeam = game.teams[winnerKey];
          const losingTeam = game.teams[loserKey];

          winningTeam.currentScore++;

          // Side-out: if winning team was NOT serving, rotate them and switch serve
          if (!winningTeam.serving) {
            winningTeam.rotation = rotateTeam(winningTeam.rotation);
            winningTeam.serving = true;
            losingTeam.serving = false;
          }

          // Build log entry
          const player = team.players[playerIdx];
          const entry: LogEntry = {
            id: uid(),
            timestamp: new Date().toISOString(),
            teamKey,
            teamName: team.name,
            playerId,
            playerName: player.name,
            playerNumber: player.number,
            action,
            set: game.currentSet + 1,
            homeScore: game.teams.home.currentScore,
            awayScore: game.teams.away.currentScore,
          };
          game.log = [entry, ...game.log];

          // Check set win
          const setWinner = checkSetWin(
            game.teams.home.currentScore,
            game.teams.away.currentScore,
            game.currentSet
          );

          if (setWinner) {
            game.teams[setWinner].sets[game.currentSet] = 1;
            const homeSetsWon = game.teams.home.sets.reduce((a, b) => a + b, 0);
            const awaySetsWon = game.teams.away.sets.reduce((a, b) => a + b, 0);
            game.teams.home.currentScore = 0;
            game.teams.away.currentScore = 0;

            if (homeSetsWon === 3 || awaySetsWon === 3) {
              game.gameOver = true;
            } else {
              game.currentSet++;
            }
          }
        });

        // Async: Sync to Supabase
        const current = get().game;
        const team = current.teams[teamKey];
        const player = team.players.find((p) => p.id === playerId);
        if (!player) return;

        const positionIndex = team.rotation.indexOf(playerId);

        insertLogEntry({
          match_id: current.matchId,
          player_id: playerId,
          player_name: player.name,
          player_number: player.number,
          team_key: teamKey,
          action_type: action,
          position: positionIndex >= 0 ? positionIndex + 1 : null,
          set_number: current.currentSet + 1,
          home_score: current.teams.home.currentScore,
          away_score: current.teams.away.currentScore,
          timestamp: new Date().toISOString(),
        });

        updateMatch(current.matchId, {
          game_state: current,
          home_sets: current.teams.home.sets.reduce((a, b) => a + b, 0),
          away_sets: current.teams.away.sets.reduce((a, b) => a + b, 0),
          status: current.gameOver ? "complete" : "active",
          ended_at: current.gameOver ? new Date().toISOString() : null,
        } as any);
      },

      // ── Undo ──────────────────────────────────────────────────────────────
      undo: () => {
        const history = get()._history;
        if (history.length === 0) return;

        const previous = history[history.length - 1];
        const matchId = get().game.matchId;

        set((s) => {
          s.game = previous;
          s._history = s._history.slice(0, -1);
        });

        // Delete last DB entry
        deleteLastLogEntry(matchId);
        updateMatch(matchId, { game_state: previous } as any);
      },

      // ── Libero Swap ───────────────────────────────────────────────────────
      toggleLibero: (teamKey, posIndex) => {
        const BACK_ROW = [0, 4, 5];
        if (!BACK_ROW.includes(posIndex)) return;

        set((s) => {
          const team = s.game.teams[teamKey];
          const libero = team.players.find((p) => p.role === "L");
          if (!libero) return;

          const currentId = team.rotation[posIndex];

          if (currentId === libero.id) {
            // Swap libero back out
            const savedId = s.game.liberoSwap[teamKey];
            if (savedId) {
              team.rotation[posIndex] = savedId;
              s.game.liberoSwap[teamKey] = null;
            }
          } else {
            // Swap libero in
            s.game.liberoSwap[teamKey] = currentId;
            team.rotation[posIndex] = libero.id;
          }
        });
      },

      // ── Team / Player Setup ───────────────────────────────────────────────
      updateTeamName: (teamKey, name) => set((s) => {
        s.game.teams[teamKey].name = name;
      }),

      updateTeamColor: (teamKey, color) => set((s) => {
        s.game.teams[teamKey].color = color;
      }),

      addPlayer: (teamKey, name, number, role) => set((s) => {
        const id = uid();
        s.game.teams[teamKey].players.push({ id, name, number, role, stats: emptyStats() });
        // Auto-add to rotation if fewer than 6 non-libero starters
        const team = s.game.teams[teamKey];
        if (role !== "L" && team.rotation.length < 6) {
          team.rotation.push(id);
        }
      }),

      removePlayer: (teamKey, playerId) => set((s) => {
        const team = s.game.teams[teamKey];
        team.players = team.players.filter((p) => p.id !== playerId);
        team.rotation = team.rotation.filter((id) => id !== playerId);
        if (s.game.liberoSwap[teamKey] === playerId) {
          s.game.liberoSwap[teamKey] = null;
        }
      }),

      updatePlayer: (teamKey, playerId, name, number, role) => set((s) => {
        const player = s.game.teams[teamKey].players.find((p) => p.id === playerId);
        if (!player) return;
        player.name = name;
        player.number = number;
        player.role = role;
      }),

      startMatch: () => {
        const state = get().game;
        createMatch(state.matchId, state.teams.home.name, state.teams.away.name, state);
      },
    })),
    {
      name: "volleytrack-game-state",
      storage: createJSONStorage(() => localStorage),
      // Only persist game state and selected team, not history (too large)
      partialize: (state) => ({
        game: state.game,
        selectedTeam: state.selectedTeam,
        selectedPlayerId: state.selectedPlayerId,
      }),
    }
  )
);

// ─── SELECTORS ────────────────────────────────────────────────────────────────
export const selectGame = (s: GameStore) => s.game;
export const selectTeams = (s: GameStore) => s.game.teams;
export const selectCurrentSet = (s: GameStore) => s.game.currentSet;
export const selectLog = (s: GameStore) => s.game.log;
export const selectGameOver = (s: GameStore) => s.game.gameOver;
export const selectSelectedTeam = (s: GameStore) => s.selectedTeam;
export const selectSelectedPlayerId = (s: GameStore) => s.selectedPlayerId;
export const selectCanUndo = (s: GameStore) => s._history.length > 0;
