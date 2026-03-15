import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "official" | "viewer" | null;

interface RegisteredUser {
    name: string;
    password: string;
}

interface AuthStore {
    role: UserRole;
    userName: string | null;
    registeredUsers: RegisteredUser[];
    signup: (name: string, password: string) => { ok: boolean; error?: string };
    login: (name: string, password: string) => { ok: boolean; error?: string };
    enterAsViewer: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            role: null,
            userName: null,
            registeredUsers: [],

            signup: (name, password) => {
                const trimmed = name.trim();
                if (!trimmed || !password) {
                    return { ok: false, error: "Name and password are required." };
                }
                const existing = get().registeredUsers.find(
                    (u) => u.name.toLowerCase() === trimmed.toLowerCase()
                );
                if (existing) {
                    return { ok: false, error: "An account with this name already exists. Please log in." };
                }
                set((s) => ({
                    registeredUsers: [...s.registeredUsers, { name: trimmed, password }],
                    role: "official",
                    userName: trimmed,
                }));
                return { ok: true };
            },

            login: (name, password) => {
                const trimmed = name.trim();
                const user = get().registeredUsers.find(
                    (u) => u.name.toLowerCase() === trimmed.toLowerCase() && u.password === password
                );
                if (!user) {
                    return { ok: false, error: "Invalid credentials. Please try again." };
                }
                set({ role: "official", userName: user.name });
                return { ok: true };
            },

            enterAsViewer: () => set({ role: "viewer", userName: null }),

            logout: () => set({ role: null, userName: null }),
        }),
        {
            name: "sideout-auth",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/** Returns true if the current role may record stats / manage the match */
export const canEditMatch = (role: UserRole) => role === "official";
