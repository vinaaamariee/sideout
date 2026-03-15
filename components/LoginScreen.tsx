"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";

type AuthMode = "login" | "signup";

export default function LoginScreen({ onBack }: { onBack: () => void }) {
    const { signup, login } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const [mode, setMode] = useState<AuthMode>("signup");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name.trim() || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (mode === "signup") {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            if (password.length < 4) {
                setError("Password must be at least 4 characters.");
                return;
            }
            const result = signup(name, password);
            if (!result.ok) setError(result.error || "Signup failed.");
        } else {
            const result = login(name, password);
            if (!result.ok) setError(result.error || "Login failed.");
        }
    }

    return (
        <div className="min-h-screen bg-themed flex flex-col items-center justify-center p-6 relative transition-colors duration-300">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
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
            >
                <span className="text-xl">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>

            <div className="relative z-10 w-full max-w-sm animate-fade-in">
                {/* Back button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-sm mb-6 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                >
                    <span>‹</span> Back to Welcome
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            boxShadow: "0 0 40px rgba(14, 165, 233, 0.2)",
                        }}
                    >
                        📋
                    </div>
                    <h2 className="text-2xl font-black tracking-widest" style={{ color: "var(--text-primary)" }}>
                        OFFICIATING OFFICIAL
                    </h2>
                    <p className="text-xs mt-1 tracking-wider" style={{ color: "var(--text-muted)" }}>
                        {mode === "signup"
                            ? "Create your account to get full access"
                            : "Log in with your credentials"}
                    </p>
                </div>

                {/* Mode toggle */}
                <div className="flex rounded-xl overflow-hidden mb-6"
                    style={{
                        background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    }}
                >
                    {(["signup", "login"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setError(""); }}
                            className="flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-200"
                            style={{
                                background: mode === m
                                    ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                                    : "transparent",
                                color: mode === m ? "#fff" : "var(--text-muted)",
                            }}
                        >
                            {m === "signup" ? "SIGN UP" : "LOG IN"}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-black tracking-widest uppercase block mb-1.5"
                            style={{ color: "var(--text-muted)" }}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            placeholder="Enter your name"
                            className="themed-input w-full"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black tracking-widest uppercase block mb-1.5"
                            style={{ color: "var(--text-muted)" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            placeholder="Enter password"
                            className="themed-input w-full"
                        />
                    </div>

                    {mode === "signup" && (
                        <div>
                            <label className="text-xs font-black tracking-widest uppercase block mb-1.5"
                                style={{ color: "var(--text-muted)" }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                placeholder="Confirm password"
                                className="themed-input w-full"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-xs text-center font-bold">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="py-3 rounded-xl font-black tracking-widest text-white text-sm
                                 transition-all duration-200 hover:brightness-110 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            boxShadow: "0 4px 16px rgba(14, 165, 233, 0.25)",
                        }}
                    >
                        {mode === "signup" ? "CREATE ACCOUNT" : "LOG IN"}
                    </button>
                </form>

                <p className="text-center text-xs mt-4 tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {mode === "signup"
                        ? "Already have an account? "
                        : "Don't have an account? "}
                    <button
                        onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
                        className="text-sky-400 font-bold hover:text-sky-300 transition-colors"
                    >
                        {mode === "signup" ? "Log in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
