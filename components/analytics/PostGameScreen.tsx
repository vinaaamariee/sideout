"use client";

import type { GameState, PlayerWithMeta } from "@/types";
import { ROLE_COLORS, ROLE_LABELS } from "@/types";
import { calcPogScore, calcHittingPct, calcReceptionEfficiency } from "@/lib/game-logic";
import { exportMatchPDF, exportMatchCSV } from "@/lib/export";
import { useThemeStore } from "@/store/useThemeStore";
import { useState } from "react";

interface PostGameScreenProps {
    game: GameState;
    allPlayers: PlayerWithMeta[];
    onReset: () => void;
}

export default function PostGameScreen({ game, allPlayers, onReset }: PostGameScreenProps) {
    const [exporting, setExporting] = useState(false);
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
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

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-themed font-display transition-colors duration-300">
            {/* Header */}
            <div className="py-4 px-6 flex items-center gap-3 no-print"
                style={{
                    background: "var(--surface-primary)",
                    borderBottom: "1px solid var(--court-border)",
                }}>
                <span className="text-2xl">🏐</span>
                <span className="text-xl font-black tracking-widest" style={{ color: "var(--text-primary)" }}>
                    SIDE<span className="text-sky-400">OUT</span>
                </span>
                <span className="ml-4 text-sm font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>
                    FINAL REPORT
                </span>
                <div className="flex-1" />
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                        background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        color: theme === "dark" ? "#fbbf24" : "#6366f1",
                    }}
                >
                    <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
                </button>
            </div>

            {/* Print-only header */}
            <div className="print-header hidden">
                <div>
                    <strong style={{ fontSize: "18pt" }}>SIDEOUT — Match Report</strong><br />
                    <span style={{ fontSize: "9pt", color: "#666" }}>
                        Date: {new Date(game.startedAt).toLocaleDateString()} | Sets: {game.currentSet + 1}
                    </span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11pt", fontWeight: "bold" }}>
                        {teams.home.name} {homeSets} – {awaySets} {teams.away.name}
                    </span>
                </div>
            </div>

            <div className="max-w-[960px] mx-auto p-6 space-y-6">
                {/* Match result banner */}
                <div className="text-center">
                    <div className="text-5xl mb-2 no-print">🏆</div>
                    <div className="text-4xl font-black tracking-widest" style={{ color: "var(--text-primary)" }}>
                        MATCH COMPLETE
                    </div>
                    <div className="text-xl mt-1" style={{ color: "var(--text-secondary)" }}>
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
                            <div className="text-6xl font-black" style={{ color: "var(--text-primary)" }}>
                                {homeSets} <span style={{ color: "var(--text-muted)" }}>–</span> {awaySets}
                            </div>
                            <div className="text-xs font-bold tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
                                SETS
                            </div>
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
                        style={{ background: theme === "dark" ? "rgba(120,53,15,0.12)" : "rgba(251,191,36,0.08)" }}
                    >
                        <div className="text-xs font-black tracking-[0.3em] text-amber-500 mb-3 uppercase">
                            👑 Player of the Game
                        </div>
                        <div className="text-4xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
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
                                    style={{
                                        background: `${s.c}12`,
                                        border: `1px solid ${s.c}25`,
                                    }}
                                >
                                    <div className="text-2xl font-black" style={{ color: s.c }}>{s.v}</div>
                                    <div className="text-[10px] font-black tracking-wider" style={{ color: "var(--text-muted)" }}>{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full standings table */}
                <div className="card overflow-hidden">
                    <div className="px-4 py-3 text-[10px] font-black tracking-[0.2em] uppercase border-b"
                        style={{ color: "var(--text-muted)", borderColor: "var(--court-border)" }}>
                        Final Player Standings
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--court-border)" }}>
                                    {["Rank", "#", "Player", "Team", "Role", "K", "BLK", "ACE", "AST", "DIG", "Err", "Hit%", "PoG"].map((h) => (
                                        <th key={h} className="px-3 py-2 text-center text-[10px] font-black tracking-wider uppercase"
                                            style={{ color: "var(--text-muted)" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allPlayers.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        style={{
                                            borderBottom: "1px solid var(--court-border)",
                                            background: i === 0 ? (theme === "dark" ? "#78350f12" : "rgba(251,191,36,0.06)") : undefined,
                                        }}
                                    >
                                        <td className="px-3 py-2 text-center font-black" style={{ color: i === 0 ? "#fbbf24" : "var(--text-muted)" }}>
                                            {i === 0 ? "👑" : i + 1}
                                        </td>
                                        <td className="px-3 py-2 text-center font-black" style={{ color: ROLE_COLORS[p.role] }}>
                                            #{p.number}
                                        </td>
                                        <td className="px-3 py-2 font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</td>
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
                                        <td className="px-3 py-2 text-center" style={{ color: "var(--text-secondary)" }}>{calcHittingPct(p.stats)}</td>
                                        <td className="px-3 py-2 text-center font-black" style={{ color: i === 0 ? "#fbbf24" : "var(--text-primary)" }}>
                                            {p.pogScore.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Export + Print + Reset buttons */}
                <div className="flex gap-4 justify-center pb-6 flex-wrap no-print">
                    <button
                        onClick={() => exportMatchCSV(game)}
                        className="btn-action px-6 py-3 text-sm font-black tracking-widest"
                        style={{
                            background: theme === "dark" ? "#1e293b" : "#f1f5f9",
                            color: "#0ea5e9",
                            border: "1px solid rgba(14,165,233,0.25)",
                            borderRadius: 10,
                        }}
                    >
                        📥 EXPORT CSV
                    </button>
                    <button
                        onClick={handlePDF}
                        disabled={exporting}
                        className="btn-action px-6 py-3 text-sm font-black tracking-widest"
                        style={{
                            background: theme === "dark" ? "#1e293b" : "#f1f5f9",
                            color: "#f97316",
                            border: "1px solid rgba(249,115,22,0.25)",
                            borderRadius: 10,
                        }}
                    >
                        {exporting ? "⏳ GENERATING..." : "📄 EXPORT PDF"}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="btn-action px-6 py-3 text-sm font-black tracking-widest"
                        style={{
                            background: theme === "dark" ? "#1e293b" : "#f1f5f9",
                            color: "#10b981",
                            border: "1px solid rgba(16,185,129,0.25)",
                            borderRadius: 10,
                        }}
                    >
                        🖨️ PRINT STATS
                    </button>
                    <button
                        onClick={onReset}
                        className="btn-action px-6 py-3 text-sm font-black tracking-widest text-white"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            borderRadius: 10,
                        }}
                    >
                        🏐 NEW MATCH
                    </button>
                </div>
            </div>

            {/* Print-only footer */}
            <div className="print-footer hidden">
                Generated by SideOut • {new Date().toLocaleString()}
            </div>
        </div>
    );
}
