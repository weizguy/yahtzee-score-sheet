export type ScoreCategory =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "threeOfAKind" | "fourOfAKind" | "fullHouse"
  | "smallStraight" | "largeStraight" | "yahtzee" | "chance";

export interface GameScores {
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  threeOfAKind: number | null;
  fourOfAKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  yahtzee: number | null;
  chance: number | null;
  bonusYahtzees: number;
}

export interface SessionGame {
  index: number;
  scores: GameScores;
}

export interface SessionState {
  games: SessionGame[];
  started: boolean;
}

export const GAME_MULTIPLIERS = [1, 2, 3, 1, 2, 3];

export const CATEGORY_MAX: Partial<Record<ScoreCategory, number>> = {
  ones: 5,
  twos: 10,
  threes: 15,
  fours: 20,
  fives: 25,
  sixes: 30,
  threeOfAKind: 30,
  fourOfAKind: 30,
  chance: 30,
};
export const GAME_COUNT = 6;

export const UPPER_CATEGORIES: ScoreCategory[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
];

export const LOWER_CATEGORIES: ScoreCategory[] = [
  "threeOfAKind", "fourOfAKind", "fullHouse",
  "smallStraight", "largeStraight", "yahtzee", "chance",
];

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  ones: "Aces",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  threeOfAKind: "3 of a Kind",
  fourOfAKind: "4 of a Kind",
  fullHouse: "Full House",
  smallStraight: "Small Straight",
  largeStraight: "Large Straight",
  yahtzee: "YAHTZEE",
  chance: "Chance",
};

export const CATEGORY_HOW_TO: Record<ScoreCategory, string> = {
  ones: "Add Only Aces",
  twos: "Add Only Twos",
  threes: "Add Only Threes",
  fours: "Add Only Fours",
  fives: "Add Only Fives",
  sixes: "Add Only Sixes",
  threeOfAKind: "Add Total of All Dice",
  fourOfAKind: "Add Total of All Dice",
  fullHouse: "Score 30",
  smallStraight: "Score 40",
  largeStraight: "Score 50",
  yahtzee: "Score 75",
  chance: "Score Total of All 5 Dice",
};

export const QUICK_VALUES: Record<ScoreCategory, number[]> = {
  ones: [0, 1, 2, 3, 4, 5],
  twos: [0, 2, 4, 6, 8, 10],
  threes: [0, 3, 6, 9, 12, 15],
  fours: [0, 4, 8, 12, 16, 20],
  fives: [0, 5, 10, 15, 20, 25],
  sixes: [0, 6, 12, 18, 24, 30],
  threeOfAKind: [],
  fourOfAKind: [],
  fullHouse: [0, 30],
  smallStraight: [0, 40],
  largeStraight: [0, 50],
  yahtzee: [0, 75],
  chance: [],
};

export function emptyGameScores(): GameScores {
  return {
    ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
    threeOfAKind: null, fourOfAKind: null, fullHouse: null,
    smallStraight: null, largeStraight: null, yahtzee: null, chance: null,
    bonusYahtzees: 0,
  };
}

export function createSession(): SessionState {
  return {
    games: Array.from({ length: GAME_COUNT }, (_, i) => ({ index: i, scores: emptyGameScores() })),
    started: false,
  };
}

export function getUpperSubtotal(scores: GameScores): number {
  return UPPER_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function getUpperBonus(scores: GameScores): number {
  return getUpperSubtotal(scores) >= 63 ? 50 : 0;
}

export function getUpperTotal(scores: GameScores): number {
  return getUpperSubtotal(scores) + getUpperBonus(scores);
}

export function getLowerTotal(scores: GameScores): number {
  return LOWER_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0)
    + scores.bonusYahtzees * 100;
}

export function getRawTotal(scores: GameScores): number {
  return getUpperTotal(scores) + getLowerTotal(scores);
}

export function getMultipliedTotal(gameIndex: number, scores: GameScores): number {
  return getRawTotal(scores) * GAME_MULTIPLIERS[gameIndex];
}

export function getSessionGrandTotal(games: SessionGame[]): number {
  return games.reduce((sum, g) => sum + getMultipliedTotal(g.index, g.scores), 0);
}

export function isGameComplete(scores: GameScores): boolean {
  return [...UPPER_CATEGORIES, ...LOWER_CATEGORIES].every((cat) => scores[cat] !== null);
}

export function isSessionComplete(games: SessionGame[]): boolean {
  return games.every((g) => isGameComplete(g.scores));
}

export function needsCustomInput(cat: ScoreCategory): boolean {
  return ["threeOfAKind", "fourOfAKind", "chance"].includes(cat);
}
