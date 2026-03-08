"use client";

import type { TeamKey, PlayerWithMeta } from "@/types";
import type { Team } from "@/types";
import { ROLE_COLORS } from "@/types";
import { calcPogScore, calcHittingPct, calcReceptionEfficiency } from "@/lib/game-logic";

interface StatsViewProps {
  teams: Record<TeamKey, Team>;
  allPlayers: PlayerWithMeta[];
}

const COLS = [
  { key: "#",     label: "#" },
  { key: "name",  label: "Player" },
  { key: "role",  label: "Role" },
  { key: "kills", label: "K",   tip: "Kills" },
  { key: "err",   label: "E",   tip: "Errors" },
  { key: "ta",    label: "TA",  tip: "Total Attempts" },
  { key: "hit",   label: "Hit%",tip: "Hitting %" },
  { key: "blk",   label: "BLK", tip: "Blocks" },
  { key: "ace",   label: "ACE", tip: "Aces" },
  { key: "ast",   label: "AST", tip: "Assists" },
  { key: "dig",   label: "DIG", tip: "Excellent Digs" },
  { key: "rec+",  label: "R+",  tip: "Perfect+Good Rec" },
  { key: "rec-",  label: "R-",  tip: "Reception Errors" },
  { key: "recE",  label: "Rec%",tip: "Reception Efficiency" },
  { key: "pog",   label: "PoG", tip: "Player of Game Score" },
];

export default function StatsView({ teams, allPlayers }: StatsViewProps) {
  return (
    <div className="col-span-full space-y-6">
      {(["home", "away"] as TeamKey[]).map((tk) => {
        const team = teams[tk];
        return (
          <div key={tk} className="card overflow-hidden">
            <div
              className="px-4 py-3 font-black text-sm tracking-widest"
              style={{ color: team.color, borderBottom: "1px solid #1e293b" }}
            >
              {team.name} — PLAYER STATISTICS
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-court-border">
                    {COLS.map((c) => (
                      <th
                        key={c.key}
                        title={c.tip}
                        className="px-3 py-2 text-center font-black tracking-wider text-slate-500 uppercase text-[10px]"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((p) => {
                    const recPlus = p.stats.receptions.perfect + p.stats.receptions.good;
                    const pog = calcPogScore(p.stats);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[#0f1629] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-3 py-2 text-center font-black" style={{ color: ROLE_COLORS[p.role] }}>
                          #{p.number}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-200">{p.name}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-black"
                            style={{ color: ROLE_COLORS[p.role], background: `${ROLE_COLORS[p.role]}18` }}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center font-black text-green-400">{p.stats.kills}</td>
                        <td className="px-3 py-2 text-center text-red-400">{p.stats.attackErrors}</td>
                        <td className="px-3 py-2 text-center text-slate-400">{p.stats.totalAttempts}</td>
                        <td className="px-3 py-2 text-center font-bold text-slate-200">{calcHittingPct(p.stats)}</td>
                        <td className="px-3 py-2 text-center font-bold text-blue-400">{p.stats.blocks}</td>
                        <td className="px-3 py-2 text-center font-bold text-purple-400">{p.stats.aces}</td>
                        <td className="px-3 py-2 text-center text-emerald-400">{p.stats.assists}</td>
                        <td className="px-3 py-2 text-center text-amber-400">{p.stats.excDigs}</td>
                        <td className="px-3 py-2 text-center text-green-400">{recPlus}</td>
                        <td className="px-3 py-2 text-center text-red-400">{p.stats.receptions.error}</td>
                        <td className="px-3 py-2 text-center text-sky-400">{calcReceptionEfficiency(p.stats)}</td>
                        <td className="px-3 py-2 text-center font-black text-amber-400">{pog.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
