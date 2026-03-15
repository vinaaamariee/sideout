import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlayerRole } from "@/types";

export interface SavedPlayer {
    name: string;
    number: number;
    role: PlayerRole;
}

export interface SavedTeam {
    id: string;
    name: string;
    color: string;
    players: SavedPlayer[];
}

interface SeasonStore {
    teams: SavedTeam[];
    addTeam: (team: SavedTeam) => void;
    removeTeam: (id: string) => void;
    updateTeam: (id: string, team: Partial<Omit<SavedTeam, "id">>) => void;
}

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useSeasonStore = create<SeasonStore>()(
    persist(
        (set) => ({
            teams: [],

            addTeam: (team) =>
                set((s) => ({
                    teams: [...s.teams, { ...team, id: team.id || uid() }],
                })),

            removeTeam: (id) =>
                set((s) => ({
                    teams: s.teams.filter((t) => t.id !== id),
                })),

            updateTeam: (id, updates) =>
                set((s) => ({
                    teams: s.teams.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                })),
        }),
        {
            name: "sideout-season",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
