"use client";

import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useSeasonStore, type SavedTeam } from "@/store/useSeasonStore";
import { useThemeStore } from "@/store/useThemeStore";
import type { TeamKey, PlayerRole } from "@/types";
import { ROLE_LABELS } from "@/types";

const ROLES: PlayerRole[] = ["OH", "OPP", "MB", "S", "L"];

const TEAM_COLORS = [
    "#0ea5e9", "#f43f5e", "#10b981", "#f97316",
    "#a855f7", "#eab308", "#ec4899", "#14b8a6",
];

interface PlayerDraft {
    id: string;
    name: string;
    number: string;
    role: PlayerRole;
}

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function TeamPanel({
    teamKey,
    label,
}: {
    teamKey: TeamKey;
    label: string;
}) {
    const team = useGameStore((s) => s.game.teams[teamKey]);
    const updateTeamName = useGameStore((s) => s.updateTeamName);
    const updateTeamColor = useGameStore((s) => s.updateTeamColor);
    const addPlayer = useGameStore((s) => s.addPlayer);
    const removePlayer = useGameStore((s) => s.removePlayer);
    const updatePlayer = useGameStore((s) => s.updatePlayer);

    const savedTeams = useSeasonStore((s) => s.teams);
    const addSavedTeam = useSeasonStore((s) => s.addTeam);

    const theme = useThemeStore((s) => s.theme);

    const [draft, setDraft] = useState<PlayerDraft>({
        id: uid(), name: "", number: "", role: "OH",
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<PlayerDraft | null>(null);

    function handleAdd() {
        const num = parseInt(draft.number);
        if (!draft.name.trim() || isNaN(num)) return;
        addPlayer(teamKey, draft.name.trim(), num, draft.role);
        setDraft({ id: uid(), name: "", number: "", role: "OH" });
    }

    function startEdit(p: { id: string; name: string; number: number; role: PlayerRole }) {
        setEditingId(p.id);
        setEditDraft({ id: p.id, name: p.name, number: String(p.number), role: p.role });
    }

    function saveEdit() {
        if (!editDraft) return;
        const num = parseInt(editDraft.number);
        if (!editDraft.name.trim() || isNaN(num)) return;
        updatePlayer(teamKey, editDraft.id, editDraft.name.trim(), num, editDraft.role);
        setEditingId(null);
        setEditDraft(null);
    }

    function loadSavedTeam(id: string) {
        const saved = savedTeams.find((t) => t.id === id);
        if (!saved) return;
        updateTeamName(teamKey, saved.name);
        updateTeamColor(teamKey, saved.color);
        // Clear existing players and add saved ones
        team.players.forEach((p) => removePlayer(teamKey, p.id));
        saved.players.forEach((p) => {
            addPlayer(teamKey, p.name, p.number, p.role);
        });
    }

    function handleSaveRoster() {
        if (team.players.length === 0) return;
        addSavedTeam({
            id: uid(),
            name: team.name || label,
            color: team.color,
            players: team.players.map((p) => ({
                name: p.name,
                number: p.number,
                role: p.role,
            })),
        });
    }

    const inputClass = "themed-input w-full font-bold";
    const smallInputClass = "themed-input text-xs";

    return (
        <div className="card p-5 flex flex-col gap-4">
            {/* Load saved team */}
            {savedTeams.length > 0 && (
                <div>
                    <label className="text-xs font-black tracking-widest uppercase block mb-1.5"
                        style={{ color: "var(--text-muted)" }}>
                        Load Saved Roster
                    </label>
                    <select
                        onChange={(e) => { if (e.target.value) loadSavedTeam(e.target.value); }}
                        defaultValue=""
                        className="themed-input w-full text-xs cursor-pointer"
                    >
                        <option value="">— Select a saved team —</option>
                        {savedTeams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.players.length} players)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Team name */}
            <div>
                <label className="text-xs font-black tracking-widest uppercase block mb-1"
                    style={{ color: "var(--text-muted)" }}>
                    {label} Team Name
                </label>
                <input
                    value={team.name}
                    onChange={(e) => updateTeamName(teamKey, e.target.value)}
                    placeholder={label.toUpperCase()}
                    className={inputClass}
                />
            </div>

            {/* Team color */}
            <div>
                <label className="text-xs font-black tracking-widest uppercase block mb-2"
                    style={{ color: "var(--text-muted)" }}>
                    Team Color
                </label>
                <div className="flex gap-2 flex-wrap">
                    {TEAM_COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => updateTeamColor(teamKey, c)}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                                background: c,
                                borderColor: team.color === c ? (theme === "dark" ? "#fff" : "#000") : "transparent",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Player list */}
            <div>
                <label className="text-xs font-black tracking-widest uppercase block mb-2"
                    style={{ color: "var(--text-muted)" }}>
                    Players ({team.players.length})
                </label>
                <div className="flex flex-col gap-1 mb-3">
                    {team.players.length === 0 && (
                        <div className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>
                            No players added yet
                        </div>
                    )}
                    {team.players.map((p) => (
                        <div key={p.id} className="rounded-lg px-3 py-2"
                            style={{ background: theme === "dark" ? "rgba(15,23,42,0.6)" : "rgba(0,0,0,0.03)" }}>
                            {editingId === p.id && editDraft ? (
                                <div className="flex gap-2 items-center flex-wrap">
                                    <input
                                        value={editDraft.name}
                                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                                        placeholder="Name"
                                        className={`${smallInputClass} w-28`}
                                    />
                                    <input
                                        value={editDraft.number}
                                        onChange={(e) => setEditDraft({ ...editDraft, number: e.target.value })}
                                        placeholder="#"
                                        type="number"
                                        className={`${smallInputClass} w-14`}
                                    />
                                    <select
                                        value={editDraft.role}
                                        onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value as PlayerRole })}
                                        className={`${smallInputClass}`}
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>{r} – {ROLE_LABELS[r]}</option>
                                        ))}
                                    </select>
                                    <button onClick={saveEdit} className="text-green-400 text-xs font-bold hover:text-green-300">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-xs hover:opacity-80" style={{ color: "var(--text-muted)" }}>Cancel</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: team.color + "33", color: team.color }}
                                    >
                                        {p.number}
                                    </span>
                                    <span className="text-sm font-bold flex-1" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{p.role}</span>
                                    <button
                                        onClick={() => startEdit(p)}
                                        className="text-xs ml-1 hover:text-sky-400 transition-colors"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => removePlayer(teamKey, p.id)}
                                        className="text-xs hover:text-red-400 transition-colors"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add player form */}
                <div className="flex gap-2 flex-wrap items-end">
                    <input
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder="Player name"
                        className={`${smallInputClass} flex-1 min-w-[120px]`}
                    />
                    <input
                        value={draft.number}
                        onChange={(e) => setDraft({ ...draft, number: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder="#"
                        type="number"
                        className={`${smallInputClass} w-16`}
                    />
                    <select
                        value={draft.role}
                        onChange={(e) => setDraft({ ...draft, role: e.target.value as PlayerRole })}
                        className={smallInputClass}
                    >
                        {ROLES.map((r) => (
                            <option key={r} value={r}>{r} – {ROLE_LABELS[r]}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAdd}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors"
                    >
                        + ADD
                    </button>
                </div>
            </div>

            {/* Save roster button */}
            {team.players.length > 0 && (
                <button
                    onClick={handleSaveRoster}
                    className="text-xs font-bold tracking-wider py-2 rounded-xl transition-all duration-200 hover:brightness-110"
                    style={{
                        background: theme === "dark" ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.08)",
                        color: "#0ea5e9",
                        border: "1px solid rgba(14,165,233,0.2)",
                    }}
                >
                    💾 SAVE ROSTER FOR FUTURE MATCHES
                </button>
            )}
        </div>
    );
}

export default function TeamSetupScreen({ onStart }: { onStart: () => void }) {
    const homePlayers = useGameStore((s) => s.game.teams.home.players);
    const awayPlayers = useGameStore((s) => s.game.teams.away.players);
    const startMatch = useGameStore((s) => s.startMatch);
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);

    const canStart = homePlayers.length >= 6 && awayPlayers.length >= 6;

    function handleStart() {
        startMatch();
        onStart();
    }

    return (
        <div className="min-h-screen bg-themed flex flex-col items-center p-6 transition-colors duration-300">
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center
                         transition-all duration-300 hover:scale-110 z-50"
                style={{
                    background: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    color: theme === "dark" ? "#fbbf24" : "#6366f1",
                }}
            >
                <span className="text-xl">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8 mt-4">
                <div className="text-4xl mb-2">🏐</div>
                <div className="text-2xl font-black tracking-widest" style={{ color: "var(--text-primary)" }}>
                    SIDE<span className="text-sky-400">OUT</span>
                </div>
                <div className="text-sm mt-1 tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Set up teams before the match
                </div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamPanel teamKey="home" label="Home" />
                <TeamPanel teamKey="away" label="Away" />
            </div>

            {/* Start button */}
            <div className="mt-8 text-center">
                {!canStart && (
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        Each team needs at least 6 players to start the match.
                    </p>
                )}
                <button
                    onClick={handleStart}
                    disabled={!canStart}
                    className="font-black tracking-widest px-10 py-4 rounded-2xl text-base 
                     transition-all duration-200 disabled:cursor-not-allowed active:scale-95"
                    style={{
                        background: canStart
                            ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                            : (theme === "dark" ? "#1e293b" : "#e2e8f0"),
                        color: canStart ? "#fff" : "var(--text-muted)",
                        boxShadow: canStart ? "0 8px 32px rgba(14,165,233,0.25)" : "none",
                    }}
                >
                    🏐 START MATCH
                </button>
            </div>
        </div>
    );
}
