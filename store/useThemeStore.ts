import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "dark" | "light";

interface ThemeStore {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: "dark",
            toggleTheme: () =>
                set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "sideout-theme",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
