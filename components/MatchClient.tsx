"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore, canEditMatch } from "@/store/useAuthStore";
import { enrichPlayers } from "@/lib/game-logic";
import Header from "@/components/ui/Header";
import Scoreboard from "@/components/ui/Scoreboard";
import CourtGrid from "@/components/court/CourtGrid";
import ActionPanel from "@/components/panels/ActionPanel";
import MatchLog from "@/components/panels/MatchLog";
import PogLeaderboard from "@/components/panels/PogLeaderboard";
import StatsView from "@/components/analytics/StatsView";
import AnalyticsView from "@/components/analytics/AnalyticsView";
import PostGameScreen from "@/components/analytics/PostGameScreen";
import PlayerChip from "@/components/court/PlayerChip";

type ViewTab = "live" | "stats" | "analytics";

const ROLE_LABELS: Record<string, string> = {
  coaching_staff: "📋 Coaching Staff",
  referee: "🦺 Referee",
  player: "🏐 Player",
  spectator: "👁️ Spectator",
};

export default function MatchClient() {
  const [view, setView] = useState<ViewTab>("live");
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const editable = canEditMatch(role);

  const game = useGameStore((s) => s.game);
  const selectedTeam = useGameStore((s) => s.selectedTeam);
  const selectedPlayerId = useGameStore((s) => s.selectedPlayerId);
  const canUndo = useGameStore((s) => s._history.length > 0);

  const selectTeam = useGameStore((s) => s.selectTeam);
  const selectPlayer = useGameStore((s) => s.selectPlayer);
  const recordAction = useGameStore((s) => s.recordAction);
  const undo = useGameStore((s) => s.undo);
  const toggleLibero = useGameStore((s) => s.toggleLibero);
  const resetMatch = useGameStore((s) => s.resetMatch);

  const allPlayers = useMemo(() => enrichPlayers(game.teams), [game.teams]);
  const currentTeam = game.teams[selectedTeam];
  const selectedPlayer = selectedPlayerId
    ? currentTeam.players.find((p) => p.id === selectedPlayerId) ?? null
    : null;

  const benchPlayers = currentTeam.players.filter(
    (p) => !currentTeam.rotation.includes(p.id)
  );

  if (game.gameOver) {
    return (
      <PostGameScreen
        game={game}
        allPlayers={allPlayers}
        onReset={resetMatch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-court-bg flex flex-col">
      <Header view={view} onViewChange={setView} />

      {/* Role badge + logout */}
      <div className="flex items-center justify-end gap-3 px-4 py-1 bg-slate-900/60 border-b border-slate-800/50">
        <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">
          {role ? ROLE_LABELS[role] : ""}
        </span>
        <button
          onClick={logout}
          className="text-xs text-slate-600 hover:text-red-400 font-bold tracking-wider transition-colors"
        >
          LOGOUT
        </button>
      </div>

      <Scoreboard
        teams={game.teams}
        currentSet={game.currentSet}
      />

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4">
        {view === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            {/* Left: Scoring area */}
            <div className="flex flex-col gap-4">
              {/* Team selector – editing only for staff/referee */}
              <div className="flex gap-2">
                {(["home", "away"] as const).map((tk) => (
                  <button
                    key={tk}
                    onClick={() => {
                      if (!editable) return;
                      selectTeam(tk);
                      selectPlayer(null);
                    }}
                    disabled={!editable}
                    className="btn-action flex-1 py-3 text-base font-black tracking-widest text-white disabled:opacity-60 disabled:cursor-default"
                    style={{
                      background: selectedTeam === tk
                        ? game.teams[tk].color
                        : "#1e293b",
                      borderRadius: 10,
                    }}
                  >
                    {game.teams[tk].name}
                    {game.teams[tk].serving && (
                      <span className="ml-2 text-xs opacity-70">🏐 SERVING</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Court Grid */}
              <CourtGrid
                team={currentTeam}
                selectedPlayerId={editable ? selectedPlayerId : null}
                onSelectPlayer={(id) => {
                  if (!editable) return;
                  selectPlayer(selectedPlayerId === id ? null : id);
                }}
                onLiberoSwap={(idx) => {
                  if (!editable) return;
                  toggleLibero(selectedTeam, idx);
                }}
              />

              {/* Bench */}
              {benchPlayers.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 font-bold tracking-widest mb-2 uppercase">
                    Bench
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {benchPlayers.map((p) => (
                      <PlayerChip
                        key={p.id}
                        player={p}
                        selected={selectedPlayerId === p.id}
                        onClick={() => {
                          if (!editable) return;
                          selectPlayer(selectedPlayerId === p.id ? null : p.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Panel – only for coaching staff / referee */}
              {editable && selectedPlayer && (
                <ActionPanel
                  player={selectedPlayer}
                  teamKey={selectedTeam}
                  onAction={recordAction}
                />
              )}

              {editable && !selectedPlayer && (
                <div className="card p-8 text-center text-slate-600 text-sm font-bold tracking-wider">
                  ← SELECT A PLAYER TO RECORD STATS
                </div>
              )}

              {!editable && (
                <div className="card p-6 text-center text-slate-600 text-sm font-bold tracking-wider">
                  👁️ VIEW-ONLY MODE — Log in as Coaching Staff or Referee to record stats
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="flex flex-col gap-4">
              <PogLeaderboard allPlayers={allPlayers} teams={game.teams} />
              <MatchLog
                log={game.log}
                teams={game.teams}
                canUndo={editable && canUndo}
                onUndo={undo}
              />
            </div>
          </div>
        )}

        {view === "stats" && (
          <StatsView teams={game.teams} allPlayers={allPlayers} />
        )}

        {view === "analytics" && (
          <AnalyticsView teams={game.teams} allPlayers={allPlayers} log={game.log} />
        )}
      </main>
    </div>
  );
}
