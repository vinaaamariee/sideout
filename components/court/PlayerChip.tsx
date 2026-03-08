"use client";

import type { Player } from "@/types";
import { ROLE_COLORS } from "@/types";

interface PlayerChipProps {
  player: Player;
  selected: boolean;
  onClick: () => void;
}

export default function PlayerChip({ player, selected, onClick }: PlayerChipProps) {
  const color = ROLE_COLORS[player.role];

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200
                 border-2 cursor-pointer hover:scale-105"
      style={{
        background: selected ? `${color}18` : "#0f1629",
        borderColor: selected ? color : "#1e293b",
      }}
    >
      <div className="text-base font-black" style={{ color }}>
        #{player.number}
      </div>
      <div className="text-left">
        <div className="text-xs font-bold text-slate-200 leading-none">{player.name}</div>
        <div className="text-[10px] font-black mt-0.5" style={{ color }}>
          {player.role}
        </div>
      </div>
    </button>
  );
}
