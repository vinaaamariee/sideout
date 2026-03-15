"use client";

import { useThemeStore } from "@/store/useThemeStore";

type ViewTab = "live" | "stats" | "analytics" | "about";

interface HeaderProps {
    view: ViewTab;
    onViewChange: (v: ViewTab) => void;
}

export default function Header({ view, onViewChange }: HeaderProps) {
    const { theme, toggleTheme } = useThemeStore();

    const tabs: { id: ViewTab; label: string; icon: string }[] = [
        { id: "live", label: "Live", icon: "⚡" },
        { id: "stats", label: "Stats", icon: "📊" },
        { id: "analytics", label: "Analytics", icon: "📈" },
        { id: "about", label: "About", icon: "ℹ️" },
    ];

    return (
        <header className="sticky top-0 z-50 no-print transition-colors duration-300"
            style={{ background: "var(--surface-primary)", borderBottom: "1px solid var(--court-border)" }}>
            <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500
                                    flex items-center justify-center text-base shadow-lg shadow-sky-500/20">
                        🏐
                    </div>
                    <span className="text-lg font-black tracking-widest"
                        style={{ color: "var(--text-primary)" }}>
                        SIDE<span className="text-sky-400">OUT</span>
                    </span>
                </div>

                <div className="flex-1" />

                {/* Nav Tabs */}
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onViewChange(tab.id)}
                            className="tab-btn"
                            style={{
                                background: view === tab.id ? "#0ea5e9" : "transparent",
                                color: view === tab.id ? "#fff" : "var(--text-muted)",
                            }}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ml-2"
                    style={{
                        background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        color: theme === "dark" ? "#fbbf24" : "#6366f1",
                    }}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                    <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
                </button>
            </div>
        </header>
    );
}
