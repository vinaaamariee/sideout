"use client";

import type { PlayerWithMeta, TeamKey } from "@/types";
import type { Team } from "@/types";
import { ROLE_COLORS } from "@/types";

interface PogLeaderboardProps {
  allPlayers: PlayerWithMeta[];
  teams: Record<TeamKey, Team>;
}

export default function PogLeaderboard({ allPlayers, teams }: PogLeaderboardProps) {
  const top6 = allPlayers.slice(0, 6);
  const maxScore = top6[0]?.pogScore || 1;

  return (
    <div className="card p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-3">
        🏆 PoG Leaderboard
      </div>

      {top6.length === 0 ? (
        <div className="text-center text-slate-600 text-xs py-4 font-bold">
          No stats recorded yet
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {top6.map((p, i) => (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black" style={{ color: i === 0 ? "#fbbf24" : "#475569" }}>
                    {i === 0 ? "👑" : `${i + 1}.`}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    #{p.number} {p.name}
                  </span>
                  <span
                    className="text-[9px] font-black px-1 py-0.5 rounded"
                    style={{ color: ROLE_COLORS[p.role], background: `${ROLE_COLORS[p.role]}15` }}
                  >
                    {p.role}
                  </span>
                </div>
                <span
                  className="text-sm font-black"
                  style={{ color: i === 0 ? "#fbbf24" : "#e2e8f0" }}
                >
                  {p.pogScore.toFixed(1)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((p.pogScore / maxScore) * 100, 2)}%`,
                    background: i === 0 ? "#fbbf24" : p.teamColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formula note */}
      <div className="mt-3 pt-2 border-t border-court-border text-[9px] text-slate-700 font-bold leading-relaxed">
        K×1.0 + BLK×1.5 + ACE×1.2 + AST×0.5 + DIG×1.0 − ERR×1.0
      </div>
    </div>
  );
}
