import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "coaching_staff" | "referee" | "player" | "spectator" | null;

// Hardcoded PINs – change these as needed
const CREDENTIALS: Record<"coaching_staff" | "referee", string> = {
    coaching_staff: "coach123",
    referee: "ref123",
};

interface AuthStore {
    role: UserRole;
    login: (role: "coaching_staff" | "referee", password: string) => boolean;
    enterAsGuest: (role: "player" | "spectator") => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            role: null,

            login: (role, password) => {
                if (CREDENTIALS[role] === password) {
                    set({ role });
                    return true;
                }
                return false;
            },

            enterAsGuest: (role) => set({ role }),

            logout: () => set({ role: null }),
        }),
        {
            name: "volleytrack-auth",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/** Returns true if the current role may record stats / manage the match */
export const canEditMatch = (role: UserRole) =>
    role === "coaching_staff" || role === "referee";
