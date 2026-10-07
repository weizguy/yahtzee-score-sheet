# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4

**State:** Single `GameContext` (`src/context/GameContext.tsx`) using `useReducer`. All game state lives here — `useGame()` hook exposes state and dispatch helpers. Actions: `START`, `SCORE`, `ADD_BONUS_YAHTZEE`, `RESET`.

**Game logic & types:** `src/lib/yahtzee.ts` — scoring categories, multipliers, totals, and helper functions. This is the source of truth for how scoring works.

**Routing:** Single route (`src/app/page.tsx`) that conditionally renders `<Setup>` or `<Session>` based on `state.started`.

**Component flow:**
- `Setup` → user starts game → dispatches `START`
- `Session` → main 6-game scorecard table; cells dispatch `SCORE`
- `ScoreEntry` → modal for custom score input (currently unused in the main UI)

**Styling:** Tailwind 4 with inline config — no `tailwind.config.*` file. Color themes cycle across the 6 game columns (blue/green/yellow × 2).

**Path alias:** `@/*` maps to `src/*`.

**No persistence** — all state is in-memory; refreshing resets the session.
