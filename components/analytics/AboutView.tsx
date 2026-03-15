"use client";

const FEATURES = [
    { icon: "⚡", title: "Live Stat Tracking", desc: "Record kills, blocks, aces, digs, receptions and more in real-time during a match." },
    { icon: "📊", title: "Player Statistics", desc: "Per-player and team-level stats with hitting percentage, reception efficiency, and more." },
    { icon: "📈", title: "Analytics & Charts", desc: "Visual breakdowns of attack distribution, score momentum, and set-by-set performance." },
    { icon: "🏆", title: "Player of the Game", desc: "Automatic POG scoring based on weighted performance metrics updated live." },
    { icon: "🔄", title: "Rotation Tracking", desc: "Visual court grid with libero swap support and automatic rotation on side-out." },
    { icon: "🔒", title: "Role-Based Access", desc: "Coaching staff and referees log in with a password; players and spectators get view-only access." },
];

const ROLES = [
    { icon: "📋", role: "Coaching Staff", password: "coach123", access: "Full access — record stats, manage players & match" },
    { icon: "🦺", role: "Referee", password: "ref123", access: "Full access — score-keeping & match control" },
    { icon: "🏐", role: "Player", password: "—", access: "View-only — live stats & leaderboard" },
    { icon: "👁️", role: "Spectator", password: "—", access: "View-only — follow the match live" },
];

export default function AboutView() {
    return (
        <div className="max-w-3xl mx-auto py-6 flex flex-col gap-8">

            {/* Hero */}
            <div className="card p-8 text-center">
                <div className="text-5xl mb-4">🏐</div>
                <h1 className="text-3xl font-black tracking-widest text-white mb-1">
                    SIDE<span className="text-sky-400">OUT</span>
                </h1>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                    A real-time volleyball statistics and analytics platform built for coaches,
                    referees, players, and fans.
                </p>
                <div className="mt-4 inline-block bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-1 text-sky-400 text-xs font-bold tracking-wider">
                    v1.0.0
                </div>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-3">Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="card p-5 flex gap-4 items-start">
                            <span className="text-2xl mt-0.5">{f.icon}</span>
                            <div>
                                <div className="font-black text-white text-sm tracking-wide">{f.title}</div>
                                <div className="text-slate-400 text-xs mt-1 leading-relaxed">{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role access table */}
            <div>
                <h2 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-3">Role Access</h2>
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left px-4 py-3 text-slate-500 font-bold text-xs tracking-wider">Role</th>
                                <th className="text-left px-4 py-3 text-slate-500 font-bold text-xs tracking-wider">Default Password</th>
                                <th className="text-left px-4 py-3 text-slate-500 font-bold text-xs tracking-wider">Access Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROLES.map((r, i) => (
                                <tr key={r.role} className={i < ROLES.length - 1 ? "border-b border-slate-800/60" : ""}>
                                    <td className="px-4 py-3 text-white font-bold">
                                        <span className="mr-2">{r.icon}</span>{r.role}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-sky-400 text-xs">
                                        {r.password}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{r.access}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-slate-600 text-xs mt-2 px-1">
                    Passwords can be changed in <code className="text-slate-500">store/useAuthStore.ts</code>.
                </p>
            </div>

            {/* Tech stack */}
            <div>
                <h2 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-3">Built With</h2>
                <div className="flex flex-wrap gap-2">
                    {["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Zustand", "Supabase", "Recharts"].map((t) => (
                        <span key={t} className="bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-300 font-bold">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}
