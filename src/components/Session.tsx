"use client";

import { useState, useRef, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import {
  ScoreCategory,
  UPPER_CATEGORIES, LOWER_CATEGORIES,
  CATEGORY_LABELS, CATEGORY_HOW_TO,
  GAME_MULTIPLIERS, GAME_COUNT, CATEGORY_MAX,
  getUpperSubtotal, getUpperBonus, getUpperTotal,
  getLowerTotal, getRawTotal, getMultipliedTotal,
  getSessionGrandTotal, isGameComplete,
} from "@/lib/yahtzee";

const COL_COLORS = [
  "bg-blue-50", "bg-green-50", "bg-yellow-50",
  "bg-blue-50", "bg-green-50", "bg-yellow-50",
];
const COL_HEADER = [
  "bg-blue-100 text-blue-800", "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800", "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800",
];

// Categories where score is fixed — show ✓/✗ instead of a text input
const FIXED_SCORE_CATEGORIES: Partial<Record<ScoreCategory, number>> = {
  fullHouse: 30,
  smallStraight: 40,
  largeStraight: 50,
  yahtzee: 75,
};

function CheckCell({
  gameIndex, category, value, colColor, fixedScore, onCommit,
}: {
  gameIndex: number;
  category: ScoreCategory;
  value: number | null;
  colColor: string;
  fixedScore: number;
  onCommit: (gameIndex: number, category: ScoreCategory, value: number) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (value !== null && !editing) {
    return (
      <td
        onClick={() => setEditing(true)}
        className={`border border-gray-300 text-center w-16 h-8 font-bold text-sm cursor-pointer
          ${value > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-500"}`}>
        {value > 0 ? value : 0}
      </td>
    );
  }

  return (
    <td className={`border border-gray-300 w-16 h-8 p-0 ${colColor}`}>
      <div className="flex h-full">
        <button
          onClick={() => { onCommit(gameIndex, category, fixedScore); setEditing(false); }}
          className="flex-1 flex items-center justify-center text-base text-emerald-600 hover:bg-emerald-100 transition-colors border-r border-gray-200"
          title={`Score ${fixedScore}`}
        >✓</button>
        <button
          onClick={() => { onCommit(gameIndex, category, 0); setEditing(false); }}
          className="flex-1 flex items-center justify-center text-base text-red-400 hover:bg-red-50 transition-colors"
          title="Score 0"
        >✗</button>
      </div>
    </td>
  );
}

function InlineCell({
  gameIndex, category, value, colColor,
  onCommit,
}: {
  gameIndex: number;
  category: ScoreCategory;
  value: number | null;
  colColor: string;
  onCommit: (gameIndex: number, category: ScoreCategory, value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const max = CATEGORY_MAX[category];
    let n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 0) {
      if (max !== undefined) n = Math.min(n, max);
      onCommit(gameIndex, category, n);
    }
    setEditing(false);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") { setEditing(false); setDraft(""); }
  };

  if (editing) {
    return (
      <td className={`border border-gray-300 w-16 h-8 p-0 ${colColor}`}>
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={CATEGORY_MAX[category] ?? undefined}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="w-full h-full text-center text-sm font-semibold bg-white border-2 border-indigo-500 rounded outline-none"
        />
      </td>
    );
  }

  return (
    <td
      onClick={() => { setEditing(true); setDraft(value !== null ? String(value) : ""); }}
      className={`border border-gray-300 text-center text-sm w-16 h-8 font-medium transition-colors select-none cursor-pointer
        ${colColor}
        ${value !== null ? "text-gray-900 hover:bg-white hover:ring-1 hover:ring-inset hover:ring-indigo-300" : "hover:bg-white hover:ring-1 hover:ring-inset hover:ring-indigo-300 text-gray-300"}
      `}
    >
      {value !== null ? value : ""}
    </td>
  );
}

function ScoreCell({ gameIndex, category, value, colColor, onCommit }: {
  gameIndex: number;
  category: ScoreCategory;
  value: number | null;
  colColor: string;
  onCommit: (gameIndex: number, category: ScoreCategory, value: number) => void;
}) {
  const fixedScore = FIXED_SCORE_CATEGORIES[category];
  if (fixedScore !== undefined) {
    return <CheckCell gameIndex={gameIndex} category={category} value={value} colColor={colColor} fixedScore={fixedScore} onCommit={onCommit} />;
  }
  return <InlineCell gameIndex={gameIndex} category={category} value={value} colColor={colColor} onCommit={onCommit} />;
}

export default function Session() {
  const { state, scoreCategory, addBonusYahtzee, removeBonusYahtzee, reset } = useGame();
  const { games } = state;
  const grandTotal = getSessionGrandTotal(games);

  const totalCell = (val: number, gameIndex: number, highlight = false) => (
    <td
      key={gameIndex}
      className={`border border-gray-300 text-center text-sm w-16 h-8 font-semibold
        ${highlight ? "bg-indigo-100 text-indigo-800" : COL_COLORS[gameIndex] + " text-gray-800"}`}
    >
      {val || ""}
    </td>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-2">
      {/* Title bar */}
      <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-black tracking-tight" style={{
            background: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Yahtzee</h1>
          <span className="text-sm text-gray-500 font-medium">Single Player Session</span>
        </div>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg bg-white transition-colors">
          New Session
        </button>
      </div>

      {/* Scorecard */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-400 overflow-x-auto shadow-md">
        <table className="border-collapse w-full" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-800 text-white text-left px-3 py-2 text-sm font-bold w-36">
                UPPER SECTION
              </th>
              <th className="border border-gray-300 bg-gray-700 text-white text-center px-1 py-2 text-xs w-24">
                HOW TO SCORE
              </th>
              {Array.from({ length: GAME_COUNT }, (_, i) => (
                <th key={i} className={`border border-gray-300 text-center py-2 text-xs font-bold w-16 ${COL_HEADER[i]}`}>
                  GAME #{i + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {UPPER_CATEGORIES.map((cat) => (
              <tr key={cat}>
                <td className="border border-gray-300 px-3 py-1 text-sm font-medium text-gray-800 bg-white">{CATEGORY_LABELS[cat]}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs text-gray-500 text-center bg-gray-50">{CATEGORY_HOW_TO[cat]}</td>
                {games.map((g, i) => (
                  <ScoreCell key={i} gameIndex={i} category={cat} value={g.scores[cat]} colColor={COL_COLORS[i]} onCommit={scoreCategory} />
                ))}
              </tr>
            ))}

            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 uppercase">Total Score</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-400 text-center">→</td>
              {games.map((g, i) => totalCell(getUpperSubtotal(g.scores), i))}
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white">
                BONUS <span className="font-normal text-gray-500">If score is 63 or more</span>
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs font-bold text-center bg-yellow-50 text-yellow-800">SCORE 50</td>
              {games.map((g, i) => {
                const bonus = getUpperBonus(g.scores);
                return (
                  <td key={i} className={`border border-gray-300 text-center text-sm font-bold w-16
                    ${bonus > 0 ? "text-emerald-700 bg-emerald-50" : COL_COLORS[i] + " text-gray-300"}`}>
                    {bonus > 0 ? "50" : ""}
                  </td>
                );
              })}
            </tr>

            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 uppercase">
                Total <span className="font-normal">Of Upper Section</span>
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-400 text-center">→</td>
              {games.map((g, i) => totalCell(getUpperTotal(g.scores), i))}
            </tr>

            <tr>
              <td colSpan={2 + GAME_COUNT} className="border border-gray-300 bg-gray-800 text-white px-3 py-2 text-sm font-bold">
                LOWER SECTION
              </td>
            </tr>

            {LOWER_CATEGORIES.map((cat) => (
              <tr key={cat}>
                <td className="border border-gray-300 px-3 py-1 text-sm font-medium text-gray-800 bg-white">{CATEGORY_LABELS[cat]}</td>
                <td className="border border-gray-300 px-2 py-1 text-xs text-gray-500 text-center bg-gray-50">{CATEGORY_HOW_TO[cat]}</td>
                {games.map((g, i) => (
                  <ScoreCell key={i} gameIndex={i} category={cat} value={g.scores[cat]} colColor={COL_COLORS[i]} onCommit={scoreCategory} />
                ))}
              </tr>
            ))}

            <tr>
              <td className="border border-gray-300 px-3 py-1 text-sm font-medium text-gray-800 bg-white">
                Bonus Yahtzees <span className="text-xs text-gray-400">(×100 ea)</span>
              </td>
              <td className="border border-gray-300 px-2 py-1 text-xs text-gray-500 text-center bg-gray-50">100 per bonus</td>
              {games.map((g, i) => (
                <td key={i} className={`border border-gray-300 text-center text-sm w-16 ${COL_COLORS[i]}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => removeBonusYahtzee(i)}
                      disabled={!g.scores.bonusYahtzees}
                      className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-300 transition-colors leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                    >−</button>
                    <span className="font-semibold text-gray-700 text-xs">{g.scores.bonusYahtzees || ""}</span>
                    <button
                      onClick={() => addBonusYahtzee(i)}
                      className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-300 transition-colors leading-none"
                    >+</button>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 uppercase">
                Total <span className="font-normal">Of Lower Section</span>
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-400 text-center">→</td>
              {games.map((g, i) => totalCell(getLowerTotal(g.scores), i))}
            </tr>

            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 uppercase">
                Total <span className="font-normal">Of Upper Section</span>
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-400 text-center">→</td>
              {games.map((g, i) => totalCell(getUpperTotal(g.scores), i))}
            </tr>

            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700">
                SUM of <span className="font-normal">Upper and Lower</span>
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-400 text-center">→</td>
              {games.map((g, i) => totalCell(getRawTotal(g.scores), i))}
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-800 bg-indigo-50">1× 2× 3× TOTALS</td>
              <td className="border border-gray-300 px-2 py-2 text-xs text-gray-400 text-center bg-indigo-50">→</td>
              {games.map((g, i) => {
                const mult = GAME_MULTIPLIERS[i];
                const val = getMultipliedTotal(i, g.scores);
                return (
                  <td key={i} className={`border border-gray-300 text-center text-sm w-16 font-bold
                    ${mult === 3 ? "bg-red-50 text-red-700" : mult === 2 ? "bg-indigo-50 text-indigo-700" : COL_COLORS[i] + " text-gray-800"}`}>
                    {val || ""}
                    {mult > 1 && val > 0 && <div className="text-[9px] font-normal opacity-60">×{mult}</div>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td colSpan={2} className="border-2 border-gray-400 bg-gray-800 text-white px-3 py-3 text-sm font-black uppercase tracking-wide">
                Grand Total
              </td>
              <td colSpan={GAME_COUNT} className="border-2 border-gray-400 bg-indigo-600 text-white text-center text-2xl font-black">
                {grandTotal || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {games.every((g) => isGameComplete(g.scores)) && (
        <div className="max-w-4xl mx-auto mt-4 bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-semibold text-gray-900">Session complete! Final score: <span className="text-indigo-600">{grandTotal}</span></p>
          <button onClick={reset} className="mt-3 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
