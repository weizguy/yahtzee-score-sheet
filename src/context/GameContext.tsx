"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  SessionState, ScoreCategory, GameScores,
  createSession,
} from "@/lib/yahtzee";

type Action =
  | { type: "START" }
  | { type: "SCORE"; gameIndex: number; category: ScoreCategory; value: number }
  | { type: "ADD_BONUS_YAHTZEE"; gameIndex: number }
  | { type: "RESET" };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "START":
      return { ...createSession(), started: true };

    case "SCORE": {
      const games = state.games.map((g) =>
        g.index === action.gameIndex
          ? { ...g, scores: { ...g.scores, [action.category]: action.value } as GameScores }
          : g
      );
      return { ...state, games };
    }

    case "ADD_BONUS_YAHTZEE": {
      const games = state.games.map((g) =>
        g.index === action.gameIndex
          ? { ...g, scores: { ...g.scores, bonusYahtzees: g.scores.bonusYahtzees + 1 } }
          : g
      );
      return { ...state, games };
    }

    case "RESET":
      return { ...createSession(), started: false };

    default:
      return state;
  }
}

interface GameContextValue {
  state: SessionState;
  start: () => void;
  scoreCategory: (gameIndex: number, category: ScoreCategory, value: number) => void;
  addBonusYahtzee: (gameIndex: number) => void;
  reset: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...createSession(), started: false });

  return (
    <GameContext.Provider value={{
      state,
      start: () => dispatch({ type: "START" }),
      scoreCategory: (gameIndex, category, value) =>
        dispatch({ type: "SCORE", gameIndex, category, value }),
      addBonusYahtzee: (gameIndex) => dispatch({ type: "ADD_BONUS_YAHTZEE", gameIndex }),
      reset: () => dispatch({ type: "RESET" }),
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
