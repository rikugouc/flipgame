export const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

export type Suit = (typeof suits)[number];
export type Rank = (typeof ranks)[number];

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type Player = {
  id: number;
  name: string;
  holeCards: Card[];
};

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'finished';

export type HandCategory =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export type HandEvaluation = {
  category: HandCategory;
  categoryRank: number;
  tiebreakers: number[];
  cards: Card[];
};

export type GameState = {
  players: Player[];
  deck: Card[];
  communityCards: Card[];
  street: Street;
};

export type EquityResult = {
  playerId: number;
  equity: number;
};

export type Rng = () => number;
