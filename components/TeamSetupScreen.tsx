"use client";

import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
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

    return (
        <div className="card p-5 flex flex-col gap-4">
            {/* Team name */}
            <div>
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase block mb-1">
                    {label} Team Name
                </label>
                <input
                    value={team.name}
                    onChange={(e) => updateTeamName(teamKey, e.target.value)}
                    placeholder={label.toUpperCase()}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white 
                     placeholder-slate-600 focus:outline-none focus:border-sky-500 text-sm font-bold"
                />
            </div>

            {/* Team color */}
            <div>
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase block mb-2">
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
                                borderColor: team.color === c ? "#fff" : "transparent",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Player list */}
            <div>
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase block mb-2">
                    Players ({team.players.length})
                </label>
                <div className="flex flex-col gap-1 mb-3">
                    {team.players.length === 0 && (
                        <div className="text-slate-600 text-xs text-center py-3">No players added yet</div>
                    )}
                    {team.players.map((p) => (
                        <div key={p.id} className="bg-slate-900/60 rounded-lg px-3 py-2">
                            {editingId === p.id && editDraft ? (
                                <div className="flex gap-2 items-center flex-wrap">
                                    <input
                                        value={editDraft.name}
                                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                                        placeholder="Name"
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-28 focus:outline-none focus:border-sky-500"
                                    />
                                    <input
                                        value={editDraft.number}
                                        onChange={(e) => setEditDraft({ ...editDraft, number: e.target.value })}
                                        placeholder="#"
                                        type="number"
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-14 focus:outline-none focus:border-sky-500"
                                    />
                                    <select
                                        value={editDraft.role}
                                        onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value as PlayerRole })}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-sky-500"
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>{r} – {ROLE_LABELS[r]}</option>
                                        ))}
                                    </select>
                                    <button onClick={saveEdit} className="text-green-400 text-xs font-bold hover:text-green-300">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-slate-500 text-xs hover:text-slate-300">Cancel</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: team.color + "33", color: team.color }}
                                    >
                                        {p.number}
                                    </span>
                                    <span className="text-white text-sm font-bold flex-1">{p.name}</span>
                                    <span className="text-slate-500 text-xs">{p.role}</span>
                                    <button
                                        onClick={() => startEdit(p)}
                                        className="text-slate-500 hover:text-sky-400 text-xs ml-1"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => removePlayer(teamKey, p.id)}
                                        className="text-slate-600 hover:text-red-400 text-xs"
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
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white 
                       placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs flex-1 min-w-[120px]"
                    />
                    <input
                        value={draft.number}
                        onChange={(e) => setDraft({ ...draft, number: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder="#"
                        type="number"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white 
                       placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs w-16"
                    />
                    <select
                        value={draft.role}
                        onChange={(e) => setDraft({ ...draft, role: e.target.value as PlayerRole })}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white 
                       focus:outline-none focus:border-sky-500 text-xs"
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
        </div>
    );
}

export default function TeamSetupScreen({ onStart }: { onStart: () => void }) {
    const homePlayers = useGameStore((s) => s.game.teams.home.players);
    const awayPlayers = useGameStore((s) => s.game.teams.away.players);
    const startMatch = useGameStore((s) => s.startMatch);

    const canStart = homePlayers.length >= 6 && awayPlayers.length >= 6;

    function handleStart() {
        startMatch();
        onStart();
    }

    return (
        <div className="min-h-screen bg-court-bg flex flex-col items-center p-6">
            {/* Header */}
            <div className="text-center mb-8 mt-4">
                <div className="text-4xl mb-2">🏐</div>
                <div className="text-2xl font-black tracking-widest text-white">
                    VOLLEY<span className="text-sky-400">TRACK</span> PRO
                </div>
                <div className="text-slate-500 text-sm mt-1 tracking-wider">Set up teams before the match</div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamPanel teamKey="home" label="Home" />
                <TeamPanel teamKey="away" label="Away" />
            </div>

            {/* Start button */}
            <div className="mt-8 text-center">
                {!canStart && (
                    <p className="text-slate-600 text-xs mb-3">
                        Each team needs at least 6 players to start the match.
                    </p>
                )}
                <button
                    onClick={handleStart}
                    disabled={!canStart}
                    className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 
                     text-white font-black tracking-widest px-10 py-4 rounded-2xl text-base 
                     transition-colors disabled:cursor-not-allowed"
                >
                    🏐 START MATCH
                </button>
            </div>
        </div>
    );
}
