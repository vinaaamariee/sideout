"use client";

import type { Team, TeamKey } from "@/types";

interface ScoreboardProps {
  teams: Record<TeamKey, Team>;
  currentSet: number;
}

export default function Scoreboard({ teams, currentSet }: ScoreboardProps) {
  const homeSets = teams.home.sets.reduce((a, b) => a + b, 0);
  const awaySets = teams.away.sets.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-gradient-to-b from-[#0f1629] to-court-bg border-b border-court-border">
      <div className="max-w-[1280px] mx-auto px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Home */}
          <TeamScoreBlock team={teams.home} score={teams.home.currentScore} side="left" />

          {/* Center */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">
              Set {currentSet + 1}
            </div>
            {/* Sets won indicator */}
            <div className="flex items-center gap-1.5 text-xl font-black text-slate-400">
              <span style={{ color: teams.home.color }}>{homeSets}</span>
              <span className="text-slate-600 text-base">–</span>
              <span style={{ color: teams.away.color }}>{awaySets}</span>
            </div>
            {/* Set history dots */}
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => {
                const homeWon = teams.home.sets[i] > 0;
                const awayWon = teams.away.sets[i] > 0;
                const isCurrent = i === currentSet;
                const isDone = homeWon || awayWon;
                return (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black"
                    style={{
                      background: isCurrent ? "#1e293b" : "transparent",
                      border: `1px solid ${isCurrent ? "#334155" : "#1e293b"}`,
                      color: homeWon ? teams.home.color : awayWon ? teams.away.color : "#475569",
                    }}
                  >
                    {isDone ? (homeWon ? "H" : "A") : isCurrent ? "●" : "○"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Away */}
          <TeamScoreBlock team={teams.away} score={teams.away.currentScore} side="right" />
        </div>
      </div>
    </div>
  );
}

function TeamScoreBlock({
  team, score, side,
}: {
  team: Team;
  score: number;
  side: "left" | "right";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${side === "right" ? "flex-row-reverse" : ""}`}
    >
      <div className={`flex-1 ${side === "right" ? "text-right" : ""}`}>
        <div
          className="text-sm font-black tracking-widest"
          style={{ color: team.color }}
        >
          {team.name}
        </div>
        {team.serving && (
          <div className="text-[10px] text-slate-500 font-bold tracking-wider">
            🏐 SERVING
          </div>
        )}
      </div>
      <div
        className="text-6xl font-black leading-none min-w-[72px] text-center"
        style={{ color: "#fff", textShadow: `0 0 30px ${team.color}40` }}
      >
        {score}
      </div>
    </div>
  );
}
