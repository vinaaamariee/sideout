"use client";

import type { GameState, PlayerWithMeta } from "@/types";
import { ROLE_COLORS, ROLE_LABELS } from "@/types";
import { calcPogScore, calcHittingPct, calcReceptionEfficiency } from "@/lib/game-logic";
import { exportMatchPDF, exportMatchCSV } from "@/lib/export";
import { useState } from "react";

interface PostGameScreenProps {
  game: GameState;
  allPlayers: PlayerWithMeta[];
  onReset: () => void;
}

export default function PostGameScreen({ game, allPlayers, onReset }: PostGameScreenProps) {
  const [exporting, setExporting] = useState(false);
  const { teams } = game;
  const homeSets = teams.home.sets.reduce((a, b) => a + b, 0);
  const awaySets = teams.away.sets.reduce((a, b) => a + b, 0);
  const winner = homeSets > awaySets ? teams.home : teams.away;
  const pogWinner = allPlayers[0];

  const handlePDF = async () => {
    setExporting(true);
    try {
      await exportMatchPDF(game, allPlayers);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-court-bg font-display">
      {/* Header */}
      <div className="bg-[#0f1629] border-b border-court-border py-4 px-6 flex items-center gap-3">
        <span className="text-2xl">🏐</span>
        <span className="text-xl font-black tracking-widest text-white">
          SIDE<span className="text-sky-400">OUT</span>
        </span>
        <span className="ml-4 text-sm text-slate-500 font-bold tracking-wider">FINAL REPORT</span>
      </div>

      <div className="max-w-[960px] mx-auto p-6 space-y-6">
        {/* Match result banner */}
        <div className="text-center">
          <div className="text-5xl mb-2">🏆</div>
          <div className="text-4xl font-black tracking-widest text-white">MATCH COMPLETE</div>
          <div className="text-xl text-slate-400 mt-1">
            <span className="font-black" style={{ color: winner.color }}>{winner.name}</span>
            {" wins "}{homeSets}–{awaySets}
          </div>
        </div>

        {/* Scoreline */}
        <div className="card p-6">
          <div className="grid grid-cols-3 items-center gap-8 text-center">
            <div>
              <div className="text-2xl font-black tracking-widest" style={{ color: teams.home.color }}>
                {teams.home.name}
              </div>
            </div>
            <div>
              <div
                className="text-6xl font-black"
                style={{ color: "#fff" }}
              >
                {homeSets} <span className="text-slate-600">–</span> {awaySets}
              </div>
              <div className="text-xs text-slate-500 font-bold tracking-wider mt-1">SETS</div>
            </div>
            <div>
              <div className="text-2xl font-black tracking-widest" style={{ color: teams.away.color }}>
                {teams.away.name}
              </div>
            </div>
          </div>
        </div>

        {/* Player of the Game */}
        {pogWinner && (
          <div
            className="rounded-xl p-6 border-2 border-amber-500/40 text-center"
            style={{ background: "linear-gradient(135deg, #78350f20, #451a0315)" }}
          >
            <div className="text-xs font-black tracking-[0.3em] text-amber-500 mb-3 uppercase">
              👑 Player of the Game
            </div>
            <div className="text-4xl font-black text-white mb-1">
              #{pogWinner.number} {pogWinner.name}
            </div>
            <div className="text-base font-bold mb-4" style={{ color: ROLE_COLORS[pogWinner.role] }}>
              {ROLE_LABELS[pogWinner.role]} — {pogWinner.teamName}
            </div>
            <div className="text-5xl font-black text-amber-400 mb-1">
              {pogWinner.pogScore.toFixed(1)}
            </div>
            <div className="text-xs text-amber-700 font-bold tracking-wider mb-5">PoG POINTS</div>

            <div className="flex gap-3 justify-center flex-wrap">
              {[
                { l: "KILLS",   v: pogWinner.stats.kills,    c: "#22c55e" },
                { l: "BLOCKS",  v: pogWinner.stats.blocks,   c: "#3b82f6" },
                { l: "ACES",    v: pogWinner.stats.aces,     c: "#a855f7" },
                { l: "ASSISTS", v: pogWinner.stats.assists,  c: "#10b981" },
                { l: "DIGS",    v: pogWinner.stats.excDigs,  c: "#f59e0b" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl px-5 py-3 text-center"
                  style={{ background: `${s.c}12`, border: `1px solid ${s.c}25` }}
                >
                  <div className="text-2xl font-black" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-[10px] text-slate-600 font-black tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full standings table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase border-b border-court-border">
            Final Player Standings
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-court-border">
                  {["Rank", "#", "Player", "Team", "Role", "K", "BLK", "ACE", "AST", "DIG", "Err", "Hit%", "PoG"].map((h) => (
                    <th key={h} className="px-3 py-2 text-center text-[10px] font-black tracking-wider text-slate-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPlayers.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#0f1629] transition-colors"
                    style={{ background: i === 0 ? "#78350f12" : undefined }}
                  >
                    <td className="px-3 py-2 text-center font-black" style={{ color: i === 0 ? "#fbbf24" : "#475569" }}>
                      {i === 0 ? "👑" : i + 1}
                    </td>
                    <td className="px-3 py-2 text-center font-black" style={{ color: ROLE_COLORS[p.role] }}>
                      #{p.number}
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-200">{p.name}</td>
                    <td className="px-3 py-2 text-center font-bold" style={{ color: p.teamColor }}>{p.teamName}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black"
                        style={{ color: ROLE_COLORS[p.role], background: `${ROLE_COLORS[p.role]}18` }}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-black text-green-400">{p.stats.kills}</td>
                    <td className="px-3 py-2 text-center text-blue-400">{p.stats.blocks}</td>
                    <td className="px-3 py-2 text-center text-purple-400">{p.stats.aces}</td>
                    <td className="px-3 py-2 text-center text-emerald-400">{p.stats.assists}</td>
                    <td className="px-3 py-2 text-center text-amber-400">{p.stats.excDigs}</td>
                    <td className="px-3 py-2 text-center text-red-400">
                      {p.stats.attackErrors + p.stats.serviceErrors}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-300">{calcHittingPct(p.stats)}</td>
                    <td className="px-3 py-2 text-center font-black" style={{ color: i === 0 ? "#fbbf24" : "#e2e8f0" }}>
                      {p.pogScore.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export + Reset buttons */}
        <div className="flex gap-4 justify-center pb-6">
          <button
            onClick={() => exportMatchCSV(game)}
            className="btn-action px-6 py-3 text-sm font-black tracking-widest"
            style={{ background: "#1e293b", color: "#0ea5e9", border: "1px solid #0ea5e940", borderRadius: 10 }}
          >
            📥 EXPORT CSV
          </button>
          <button
            onClick={handlePDF}
            disabled={exporting}
            className="btn-action px-6 py-3 text-sm font-black tracking-widest"
            style={{ background: "#1e293b", color: "#f97316", border: "1px solid #f9731640", borderRadius: 10 }}
          >
            {exporting ? "⏳ GENERATING..." : "📄 EXPORT PDF"}
          </button>
          <button
            onClick={onReset}
            className="btn-action px-6 py-3 text-sm font-black tracking-widest text-white"
            style={{ background: "#0ea5e9", borderRadius: 10 }}
          >
            🏐 NEW MATCH
          </button>
        </div>
      </div>
    </div>
  );
}
