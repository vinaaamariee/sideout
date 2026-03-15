"use client";

import { useState } from "react";
import { useAuthStore, UserRole } from "@/store/useAuthStore";

type Step = "select" | "login";

const ROLE_INFO = {
    coaching_staff: {
        label: "Coaching Staff",
        icon: "📋",
        desc: "Full access: record stats, manage players & match",
        requiresLogin: true,
        color: "#0ea5e9",
    },
    referee: {
        label: "Referee",
        icon: "🦺",
        desc: "Score-keeping & match control access",
        requiresLogin: true,
        color: "#f97316",
    },
    player: {
        label: "Player",
        icon: "🏐",
        desc: "View-only: watch live stats & leaderboard",
        requiresLogin: false,
        color: "#10b981",
    },
    spectator: {
        label: "Spectator",
        icon: "👁️",
        desc: "View-only: follow the match live",
        requiresLogin: false,
        color: "#a855f7",
    },
} as const;

type SelectableRole = keyof typeof ROLE_INFO;

export default function LoginScreen() {
    const { login, enterAsGuest } = useAuthStore();
    const [step, setStep] = useState<Step>("select");
    const [selectedRole, setSelectedRole] = useState<SelectableRole | null>(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function handleRoleClick(role: SelectableRole) {
        const info = ROLE_INFO[role];
        if (!info.requiresLogin) {
            enterAsGuest(role as "player" | "spectator");
            return;
        }
        setSelectedRole(role);
        setPassword("");
        setError("");
        setStep("login");
    }

    function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedRole) return;
        const ok = login(selectedRole as "coaching_staff" | "referee", password);
        if (!ok) {
            setError("Incorrect password. Please try again.");
        }
    }

    return (
        <div className="min-h-screen bg-court-bg flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <div className="text-center mb-10">
                <div className="text-6xl mb-3">🏐</div>
                <div className="text-3xl font-black tracking-widest text-white">
                    SIDE<span className="text-sky-400">OUT</span>
                </div>
                <div className="text-slate-500 text-sm mt-2 tracking-wider">
                    Select your role to continue
                </div>
            </div>

            {step === "select" && (
                <div className="w-full max-w-md grid grid-cols-1 gap-4">
                    {(Object.keys(ROLE_INFO) as SelectableRole[]).map((role) => {
                        const info = ROLE_INFO[role];
                        return (
                            <button
                                key={role}
                                onClick={() => handleRoleClick(role)}
                                className="flex items-center gap-4 p-5 rounded-2xl border border-slate-700 bg-slate-800/80 
                           hover:border-sky-500 hover:bg-slate-700/80 transition-all text-left group"
                            >
                                <span className="text-3xl">{info.icon}</span>
                                <div className="flex-1">
                                    <div
                                        className="font-black text-base tracking-wide"
                                        style={{ color: info.color }}
                                    >
                                        {info.label}
                                        {info.requiresLogin && (
                                            <span className="ml-2 text-xs text-slate-500 font-normal">
                                                🔒 Login required
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-slate-400 text-xs mt-0.5">{info.desc}</div>
                                </div>
                                <span className="text-slate-600 group-hover:text-slate-400 text-xl">›</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {step === "login" && selectedRole && (
                <div className="w-full max-w-sm">
                    <button
                        onClick={() => setStep("select")}
                        className="text-slate-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
                    >
                        ‹ Back
                    </button>

                    <div className="card p-8">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">{ROLE_INFO[selectedRole].icon}</div>
                            <div
                                className="font-black text-xl tracking-wide"
                                style={{ color: ROLE_INFO[selectedRole].color }}
                            >
                                {ROLE_INFO[selectedRole].label}
                            </div>
                            <div className="text-slate-500 text-xs mt-1">Enter your password to continue</div>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           placeholder-slate-600 focus:outline-none focus:border-sky-500 text-sm"
                                autoFocus
                            />

                            {error && (
                                <div className="text-red-400 text-xs text-center">{error}</div>
                            )}

                            <button
                                type="submit"
                                className="btn-action py-3 font-black tracking-widest text-white rounded-xl"
                                style={{ background: ROLE_INFO[selectedRole].color }}
                            >
                                LOGIN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
