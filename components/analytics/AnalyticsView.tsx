"use client";

import type { TeamKey, PlayerWithMeta, LogEntry } from "@/types";
import type { Team } from "@/types";
import { ROLE_COLORS, SPIKERS } from "@/types";
import {
  calcTeamStats, calcPogScore, getSetDistribution,
} from "@/lib/game-logic";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

interface AnalyticsViewProps {
  teams: Record<TeamKey, Team>;
  allPlayers: PlayerWithMeta[];
  log: LogEntry[];
}

export default function AnalyticsView({ teams, allPlayers, log }: AnalyticsViewProps) {
  return (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Team comparison */}
      <TeamComparisonCard teams={teams} />

      {/* PoG Bar chart */}
      <PogBarChart allPlayers={allPlayers} />

      {/* Set distribution pie - home */}
      <SetDistributionCard team={teams.home} teamKey="home" />

      {/* Set distribution pie - away */}
      <SetDistributionCard team={teams.away} teamKey="away" />

      {/* Top performers */}
      <TopPerformersCard allPlayers={allPlayers} />

      {/* Recent log */}
      <RecentActionsCard log={log} teams={teams} />
    </div>
  );
}

function TeamComparisonCard({ teams }: { teams: Record<TeamKey, Team> }) {
  const homeStats = calcTeamStats(teams.home);
  const awayStats = calcTeamStats(teams.away);

  const metrics = [
    { label: "Kills",  home: homeStats.kills,    away: awayStats.kills },
    { label: "Blocks", home: homeStats.blocks,   away: awayStats.blocks },
    { label: "Aces",   home: homeStats.aces,     away: awayStats.aces },
    { label: "Errors", home: homeStats.attackErrors + homeStats.serviceErrors,
                       away: awayStats.attackErrors + awayStats.serviceErrors },
    { label: "Digs",   home: homeStats.excDigs,  away: awayStats.excDigs },
  ];

  return (
    <div className="card p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4">
        📊 Team Comparison
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={metrics} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#0f1629", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8", fontWeight: 700 }}
          />
          <Legend
            formatter={(value) => value === "home" ? teams.home.name : teams.away.name}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar dataKey="home" fill={teams.home.color} radius={[4, 4, 0, 0]} />
          <Bar dataKey="away" fill={teams.away.color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PogBarChart({ allPlayers }: { allPlayers: PlayerWithMeta[] }) {
  const top8 = allPlayers.slice(0, 8).map((p) => ({
    name: `#${p.number} ${p.name}`,
    score: p.pogScore,
    color: p.teamColor,
  }));

  return (
    <div className="card p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4">
        🏆 PoG Scores — Top 8
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={top8} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
          <Tooltip
            contentStyle={{ background: "#0f1629", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {top8.map((entry, i) => (
              <Cell key={i} fill={i === 0 ? "#fbbf24" : entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["#f97316", "#a855f7", "#3b82f6", "#10b981", "#06b6d4"];

function SetDistributionCard({
  team, teamKey,
}: {
  team: Team;
  teamKey: TeamKey;
}) {
  const data = getSetDistribution(team).filter((d) => d.value > 0);
  const isEmpty = data.length === 0 || data.every((d) => d.value === 0);

  return (
    <div className="card p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-1">
        🎯 {team.name} — Set Distribution
      </div>
      <div className="text-[9px] text-slate-700 mb-3 font-bold">
        (Approximated from attack attempts)
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-[180px] text-slate-600 text-xs font-bold">
          No attack data yet
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0f1629", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-1.5">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <div className="text-[11px] text-slate-300 font-bold flex-1 truncate">{d.name}</div>
                <div className="text-[11px] font-black" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>
                  {d.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopPerformersCard({ allPlayers }: { allPlayers: PlayerWithMeta[] }) {
  const sorted = {
    kills:  [...allPlayers].sort((a, b) => b.stats.kills - a.stats.kills)[0],
    blocks: [...allPlayers].sort((a, b) => b.stats.blocks - a.stats.blocks)[0],
    aces:   [...allPlayers].sort((a, b) => b.stats.aces - a.stats.aces)[0],
    setter: [...allPlayers].filter((p) => p.role === "S").sort((a, b) => b.stats.assists - a.stats.assists)[0],
    libero: [...allPlayers].filter((p) => p.role === "L").sort((a, b) => b.stats.excDigs - a.stats.excDigs)[0],
  };

  const rows = [
    { label: "Kill Leader",    p: sorted.kills,  val: (p: PlayerWithMeta) => `${p.stats.kills} kills`,   color: "#22c55e" },
    { label: "Block Leader",   p: sorted.blocks, val: (p: PlayerWithMeta) => `${p.stats.blocks} blocks`, color: "#3b82f6" },
    { label: "Ace Leader",     p: sorted.aces,   val: (p: PlayerWithMeta) => `${p.stats.aces} aces`,     color: "#a855f7" },
    { label: "Best Setter",    p: sorted.setter, val: (p: PlayerWithMeta) => `${p.stats.assists} assists`,color: "#10b981" },
    { label: "Best Libero",    p: sorted.libero, val: (p: PlayerWithMeta) => `${p.stats.excDigs} digs`,  color: "#f59e0b" },
    { label: "PoG Leader",     p: allPlayers[0], val: (p: PlayerWithMeta) => `${p.pogScore.toFixed(1)} pts`, color: "#fbbf24" },
  ];

  return (
    <div className="card p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-3">
        ⭐ Top Performers
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          if (!row.p) return null;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between py-2 border-b border-court-border"
            >
              <span className="text-[11px] text-slate-500 font-bold w-24">{row.label}</span>
              <span className="text-[12px] font-bold text-slate-200 flex-1 text-center">
                #{row.p.number} {row.p.name}
              </span>
              <span className="text-[12px] font-black" style={{ color: row.color }}>
                {row.val(row.p)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActionsCard({
  log, teams,
}: {
  log: LogEntry[];
  teams: Record<TeamKey, Team>;
}) {
  return (
    <div className="card p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-3">
        🕐 Recent Actions
      </div>
      <div className="space-y-1 max-h-[260px] overflow-y-auto">
        {log.slice(0, 25).map((e) => {
          const color = teams[e.teamKey].color;
          return (
            <div
              key={e.id}
              className="flex items-center gap-2 py-1.5 border-b border-[#0f1629] text-[11px]"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-slate-600 w-6">S{e.set}</span>
              <span className="font-black" style={{ color }}>
                #{e.playerNumber} {e.playerName}
              </span>
              <span className="text-slate-400 flex-1">
                {e.action.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-slate-600 shrink-0">
                {e.homeScore}–{e.awayScore}
              </span>
            </div>
          );
        })}
        {log.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-6 font-bold">
            No actions recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
