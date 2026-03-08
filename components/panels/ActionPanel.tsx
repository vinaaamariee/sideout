"use client";

import type { Player, TeamKey, ActionType, PlayerRole } from "@/types";
import { ROLE_COLORS, ROLE_LABELS, SPIKERS } from "@/types";
import { calcPogScore, calcHittingPct, calcReceptionEfficiency } from "@/lib/game-logic";

interface ActionPanelProps {
  player: Player;
  teamKey: TeamKey;
  onAction: (teamKey: TeamKey, playerId: string, action: ActionType) => void;
}

interface ActionButton {
  label: string;
  action: ActionType;
  color: string;
  isPoint?: boolean;
}

interface ActionGroup {
  label: string;
  icon: string;
  color: string;
  show: boolean;
  buttons: ActionButton[];
}

export default function ActionPanel({ player, teamKey, onAction }: ActionPanelProps) {
  const { role } = player;
  const roleColor = ROLE_COLORS[role];
  const pogScore = calcPogScore(player.stats);

  const isSpiker = SPIKERS.includes(role);
  const isSetter = role === "S";
  const isLibero = role === "L";

  const groups: ActionGroup[] = [
    {
      label: "Attack",
      icon: "⚡",
      color: "#f97316",
      show: isSpiker,
      buttons: [
        { label: "Kill ✓", action: "kill", color: "#22c55e", isPoint: true },
        { label: "Error ✗", action: "attackError", color: "#ef4444", isPoint: true },
        { label: "Attempt", action: "attempt", color: "#64748b" },
      ],
    },
    {
      label: "Block",
      icon: "🛡",
      color: "#3b82f6",
      show: isSpiker,
      buttons: [
        { label: "Block ✓", action: "block", color: "#3b82f6", isPoint: true },
      ],
    },
    {
      label: "Setting",
      icon: "🎯",
      color: "#10b981",
      show: isSetter,
      buttons: [
        { label: "Assist", action: "assist", color: "#10b981" },
        { label: "Exc. Set", action: "excSet", color: "#6ee7b7" },
      ],
    },
    {
      label: "Defense",
      icon: "🦺",
      color: "#f59e0b",
      show: isLibero,
      buttons: [
        { label: "Exc. Dig", action: "excDig", color: "#f59e0b" },
        { label: "Rec ✓✓", action: "recPerfect", color: "#22c55e" },
        { label: "Rec ✓", action: "recGood", color: "#84cc16" },
        { label: "Rec ✗", action: "recError", color: "#ef4444" },
      ],
    },
    {
      label: "Service",
      icon: "🏐",
      color: "#a855f7",
      show: true,
      buttons: [
        { label: "Ace ✓", action: "ace", color: "#a855f7", isPoint: true },
        { label: "Svc. Err", action: "serviceError", color: "#ef4444", isPoint: true },
      ],
    },
    {
      label: "Reception",
      icon: "🤲",
      color: "#06b6d4",
      show: !isLibero, // Libero has separate defense group
      buttons: [
        { label: "Rec ✓✓", action: "recPerfect", color: "#22c55e" },
        { label: "Rec ✓", action: "recGood", color: "#84cc16" },
        { label: "Rec ✗", action: "recError", color: "#ef4444" },
      ],
    },
  ];

  return (
    <div
      className="card p-4"
      style={{ borderColor: `${roleColor}30` }}
    >
      {/* Player header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2"
            style={{ background: `${roleColor}18`, borderColor: roleColor, color: roleColor }}
          >
            #{player.number}
          </div>
          <div>
            <div className="text-lg font-black text-white leading-none">{player.name}</div>
            <div className="text-xs font-bold mt-1" style={{ color: roleColor }}>
              {ROLE_LABELS[role]}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold tracking-wider">PoG SCORE</div>
          <div className="text-3xl font-black text-amber-400 leading-none">
            {pogScore.toFixed(1)}
          </div>
          <div className="flex gap-2 mt-1 text-[10px] font-bold justify-end">
            {isSpiker && (
              <span className="text-slate-400">
                Hit: <span className="text-green-400">{calcHittingPct(player.stats)}</span>
              </span>
            )}
            <span className="text-slate-400">
              Rec: <span className="text-sky-400">{calcReceptionEfficiency(player.stats)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stat mini-bar */}
      <div className="grid grid-cols-5 gap-1.5 mb-4 text-center">
        {[
          { v: player.stats.kills,    l: "K",   c: "#22c55e" },
          { v: player.stats.blocks,   l: "BLK", c: "#3b82f6" },
          { v: player.stats.aces,     l: "ACE", c: "#a855f7" },
          { v: player.stats.assists,  l: "AST", c: "#10b981" },
          { v: player.stats.excDigs,  l: "DIG", c: "#f59e0b" },
        ].map((s) => (
          <div key={s.l} className="bg-slate-800/50 rounded-lg py-1.5">
            <div className="text-base font-black" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] text-slate-500 font-bold">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Action groups */}
      <div className="flex flex-col gap-3">
        {groups.filter((g) => g.show).map((group) => (
          <div key={group.label}>
            <div
              className="text-[10px] font-black tracking-widest uppercase mb-2"
              style={{ color: group.color }}
            >
              {group.icon} {group.label}
            </div>
            <div className="flex gap-2 flex-wrap">
              {group.buttons.map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => onAction(teamKey, player.id, btn.action)}
                  className="btn-action flex-1 min-w-[70px] py-2.5 text-xs rounded-xl"
                  style={{
                    background: `${btn.color}18`,
                    color: btn.color,
                    border: `1px solid ${btn.color}35`,
                  }}
                >
                  {btn.label}
                  {btn.isPoint && (
                    <span className="ml-1 text-[9px] opacity-50">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[9px] text-slate-700 text-center font-bold tracking-wider">
        ● = POINT ACTION
      </div>
    </div>
  );
}
