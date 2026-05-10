import { type Card, type HandEvaluation } from './types';

const categoryRanks: Record<HandEvaluation['category'], number> = {
  'High Card': 1,
  Pair: 2,
  'Two Pair': 3,
  'Three of a Kind': 4,
  Straight: 5,
  Flush: 6,
  'Full House': 7,
  'Four of a Kind': 8,
  'Straight Flush': 9,
  'Royal Flush': 10,
};

export function evaluateBestHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('At least 5 cards are required to evaluate a hand.');
  }

  return combinations(cards, 5)
    .map(evaluateFiveCards)
    .sort(compareHands)
    .at(-1)!;
}

export function compareHands(a: HandEvaluation, b: HandEvaluation): number {
  if (a.categoryRank !== b.categoryRank) {
    return a.categoryRank - b.categoryRank;
  }

  const length = Math.max(a.tiebreakers.length, b.tiebreakers.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (a.tiebreakers[index] ?? 0) - (b.tiebreakers[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
}

function evaluateFiveCards(cards: Card[]): HandEvaluation {
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const rankCounts = countRanks(sorted);
  const groups = [...rankCounts.entries()]
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
  const isFlush = sorted.every((card) => card.suit === sorted[0].suit);
  const straightHigh = getStraightHigh(sorted.map((card) => card.rank));

  if (isFlush && straightHigh === 14) {
    return makeEvaluation('Royal Flush', [14], sorted);
  }

  if (isFlush && straightHigh !== null) {
    return makeEvaluation('Straight Flush', [straightHigh], sorted);
  }

  const four = groups.find((group) => group.count === 4);
  if (four) {
    const kicker = groups.find((group) => group.count === 1)!.rank;
    return makeEvaluation('Four of a Kind', [four.rank, kicker], sorted);
  }

  const three = groups.find((group) => group.count === 3);
  const pair = groups.find((group) => group.count === 2);
  if (three && pair) {
    return makeEvaluation('Full House', [three.rank, pair.rank], sorted);
  }

  if (isFlush) {
    return makeEvaluation(
      'Flush',
      sorted.map((card) => card.rank),
      sorted,
    );
  }

  if (straightHigh !== null) {
    return makeEvaluation('Straight', [straightHigh], sorted);
  }

  if (three) {
    const kickers = groups.filter((group) => group.count === 1).map((group) => group.rank);
    return makeEvaluation('Three of a Kind', [three.rank, ...kickers], sorted);
  }

  const pairs = groups.filter((group) => group.count === 2);
  if (pairs.length === 2) {
    const kicker = groups.find((group) => group.count === 1)!.rank;
    return makeEvaluation('Two Pair', [pairs[0].rank, pairs[1].rank, kicker], sorted);
  }

  if (pairs.length === 1) {
    const kickers = groups.filter((group) => group.count === 1).map((group) => group.rank);
    return makeEvaluation('Pair', [pairs[0].rank, ...kickers], sorted);
  }

  return makeEvaluation(
    'High Card',
    sorted.map((card) => card.rank),
    sorted,
  );
}

function makeEvaluation(
  category: HandEvaluation['category'],
  tiebreakers: number[],
  cards: Card[],
): HandEvaluation {
  return {
    category,
    categoryRank: categoryRanks[category],
    tiebreakers,
    cards,
  };
}

function countRanks(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  return counts;
}

function getStraightHigh(ranks: number[]): number | null {
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
  const wheelRanks = [14, 5, 4, 3, 2];

  if (wheelRanks.every((rank) => uniqueRanks.includes(rank))) {
    return 5;
  }

  for (let index = 0; index <= uniqueRanks.length - 5; index += 1) {
    const window = uniqueRanks.slice(index, index + 5);
    if (window[0] - window[4] === 4) {
      return window[0];
    }
  }

  return null;
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];

  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((combination) => [first, ...combination]);
  const withoutFirst = combinations(rest, size);

  return [...withFirst, ...withoutFirst];
}
