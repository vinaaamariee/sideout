"use client";

import { useThemeStore } from "@/store/useThemeStore";

export default function WelcomeScreen({
    onOfficialClick,
    onViewerClick,
}: {
    onOfficialClick: () => void;
    onViewerClick: () => void;
}) {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <div className="min-h-screen bg-themed flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
                <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
                    style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
            </div>

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center
                         transition-all duration-300 hover:scale-110 z-10"
                style={{
                    background: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    color: theme === "dark" ? "#fbbf24" : "#6366f1",
                }}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
                <span className="text-xl">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>

            {/* Main content */}
            <div className="relative z-10 text-center max-w-lg animate-fade-in">
                {/* Volleyball icon */}
                <div className="animate-float mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl
                                shadow-2xl"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            boxShadow: "0 0 60px rgba(14, 165, 233, 0.3)",
                        }}
                    >
                        🏐
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-black tracking-[0.15em] mb-3"
                    style={{ color: "var(--text-primary)" }}>
                    SIDE<span className="text-sky-400">OUT</span>
                </h1>
                <p className="text-lg font-bold tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                    Live e-Scoresheet & Analytics
                </p>
                <p className="text-sm leading-relaxed mb-10 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                    Real-time volleyball scoring, player statistics tracking, and post-match analytics — 
                    all in one place.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col gap-4 w-full max-w-xs mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <button
                        onClick={onOfficialClick}
                        className="group relative px-8 py-4 rounded-2xl font-black text-base tracking-widest text-white
                                 transition-all duration-300 hover:scale-[1.03] active:scale-95 overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            boxShadow: "0 8px 32px rgba(14, 165, 233, 0.3)",
                        }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <span className="text-xl">📋</span>
                            OFFICIATING OFFICIAL
                        </span>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                        onClick={onViewerClick}
                        className="group px-8 py-4 rounded-2xl font-black text-base tracking-widest
                                 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                        style={{
                            background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                            border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                            color: "var(--text-secondary)",
                        }}
                    >
                        <span className="flex items-center justify-center gap-3">
                            <span className="text-xl">👁️</span>
                            VIEW LIVE SCORES
                        </span>
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-xs mt-8 tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Officials sign up to get full access • Viewers jump straight to scores
                </p>
            </div>
        </div>
    );
}
