"use client";

import type { LogEntry, TeamKey } from "@/types";
import type { Team } from "@/types";
import { ACTION_LABELS } from "@/types";

interface MatchLogProps {
  log: LogEntry[];
  teams: Record<TeamKey, Team>;
  canUndo: boolean;
  onUndo: () => void;
}

export default function MatchLog({ log, teams, canUndo, onUndo }: MatchLogProps) {
  return (
    <div className="card p-4 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
          📋 Match Log
        </div>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="btn-action px-3 py-1.5 text-[11px] rounded-lg font-black tracking-wider"
          style={{
            background: canUndo ? "#ef444420" : "#1e293b",
            color: canUndo ? "#ef4444" : "#334155",
            border: `1px solid ${canUndo ? "#ef444440" : "#1e293b"}`,
          }}
        >
          ↩ UNDO
        </button>
      </div>

      <div className="overflow-y-auto max-h-[320px] flex-1">
        {log.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-6 font-bold">
            No actions yet.<br />Select a player and record stats.
          </div>
        ) : (
          log.map((entry) => {
            const teamColor = teams[entry.teamKey].color;
            return (
              <div
                key={entry.id}
                className="log-entry"
                style={{
                  background: `${teamColor}10`,
                  borderLeftColor: teamColor,
                }}
              >
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-slate-600 text-[10px]">
                    S{entry.set}
                  </span>
                  <span
                    className="font-black text-[11px]"
                    style={{ color: teamColor }}
                  >
                    #{entry.playerNumber} {entry.playerName}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {ACTION_LABELS[entry.action]}
                  </span>
                  <span className="ml-auto text-slate-600 text-[10px]">
                    {entry.homeScore}–{entry.awayScore}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
