"use client";

import { useState } from "react";
import { ScoreCategory, CATEGORY_LABELS, CATEGORY_HOW_TO, QUICK_VALUES } from "@/lib/yahtzee";

interface ScoreEntryProps {
  category: ScoreCategory;
  gameNumber: number;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export default function ScoreEntry({ category, gameNumber, onConfirm, onCancel }: ScoreEntryProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [manual, setManual] = useState("");

  const quickVals = QUICK_VALUES[category];
  const hasQuickPicks = quickVals.length > 0;

  // Manual input wins if filled, otherwise fall back to a quick-pick selection
  const getValue = (): number | null => {
    if (manual !== "") {
      const n = parseInt(manual, 10);
      return isNaN(n) ? null : n;
    }
    return selected;
  };

  const handleManualChange = (val: string) => {
    setManual(val);
    setSelected(null); // clear quick-pick when typing
  };

  const handleQuickPick = (v: number) => {
    setSelected(v);
    setManual(""); // clear manual when quick-pick chosen
  };

  const handleConfirm = () => {
    const v = getValue();
    if (v === null || isNaN(v)) return;
    onConfirm(v);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="mb-5">
          <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider mb-1">Game {gameNumber}</p>
          <h2 className="text-xl font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{CATEGORY_HOW_TO[category]}</p>
        </div>

        {/* Manual input — always shown */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Enter score</label>
          <input
            type="number"
            min={0}
            max={100}
            value={manual}
            onChange={(e) => handleManualChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-2xl font-semibold text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={selected !== null ? String(selected) : "0"}
            autoFocus
          />
        </div>

        {/* Quick picks — only for categories that have them */}
        {hasQuickPicks && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2">Or pick a common value</p>
            <div className="flex flex-wrap gap-2">
              {quickVals.map((v) => (
                <button
                  key={v}
                  onClick={() => handleQuickPick(v)}
                  className={`flex-1 min-w-[3rem] py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${selected === v && manual === "" ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={getValue() === null}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
