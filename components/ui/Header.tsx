"use client";

type ViewTab = "live" | "stats" | "analytics";

interface HeaderProps {
  view: ViewTab;
  onViewChange: (v: ViewTab) => void;
}

export default function Header({ view, onViewChange }: HeaderProps) {
  const tabs: { id: ViewTab; label: string; icon: string }[] = [
    { id: "live",      label: "Live",      icon: "⚡" },
    { id: "stats",     label: "Stats",     icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <header className="bg-[#0f1629] border-b border-court-border sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500
                          flex items-center justify-center text-base shadow-lg shadow-sky-500/20">
            🏐
          </div>
          <span className="text-lg font-black tracking-widest text-white">
            VOLLEY<span className="text-sky-400">TRACK</span>
            <span className="text-slate-500 text-sm font-bold ml-1">PRO</span>
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
                color: view === tab.id ? "#fff" : "#64748b",
              }}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
