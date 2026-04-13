"use client";

import { useGame } from "@/context/GameContext";
import { GAME_MULTIPLIERS } from "@/lib/yahtzee";

export default function Setup() {
  const { start } = useGame();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-lg">🎲</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Yahtzee Scorer</h1>
          <p className="text-gray-500 text-sm mt-1">Single player · 6 games · score multipliers</p>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">Game multipliers</p>
          <div className="grid grid-cols-6 gap-2">
            {GAME_MULTIPLIERS.map((mult, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold
                  ${mult === 3 ? "bg-indigo-600 text-white" : mult === 2 ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                  ×{mult}
                </div>
                <span className="text-xs text-gray-400">G{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Games 2 & 5 score double. Games 3 & 6 score triple. All six scores are summed at the end.
          </p>
        </div>

        <button
          onClick={start}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}