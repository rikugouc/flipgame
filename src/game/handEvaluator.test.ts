import { describe, expect, it } from 'vitest';
import { compareHands, evaluateBestHand } from './handEvaluator';
import { type Card, type Suit } from './types';

function c(rank: Card['rank'], suit: Suit): Card {
  return { rank, suit };
}

describe('handEvaluator', () => {
  it('ranks hand categories correctly', () => {
    const pair = evaluateBestHand([
      c(14, 'spades'),
      c(14, 'hearts'),
      c(9, 'clubs'),
      c(7, 'diamonds'),
      c(3, 'spades'),
    ]);
    const flush = evaluateBestHand([
      c(14, 'spades'),
      c(11, 'spades'),
      c(9, 'spades'),
      c(7, 'spades'),
      c(3, 'spades'),
    ]);

    expect(compareHands(flush, pair)).toBeGreaterThan(0);
  });

  it('recognizes an ace-low straight as a five-high straight', () => {
    const hand = evaluateBestHand([
      c(14, 'spades'),
      c(5, 'hearts'),
      c(4, 'clubs'),
      c(3, 'diamonds'),
      c(2, 'spades'),
    ]);

    expect(hand.category).toBe('Straight');
    expect(hand.tiebreakers).toEqual([5]);
  });

  it('uses kickers to break tied pairs', () => {
    const aceKickerPair = evaluateBestHand([
      c(10, 'spades'),
      c(10, 'hearts'),
      c(14, 'clubs'),
      c(8, 'diamonds'),
      c(2, 'spades'),
    ]);
    const kingKickerPair = evaluateBestHand([
      c(10, 'clubs'),
      c(10, 'diamonds'),
      c(13, 'hearts'),
      c(8, 'clubs'),
      c(2, 'diamonds'),
    ]);

    expect(compareHands(aceKickerPair, kingKickerPair)).toBeGreaterThan(0);
  });
});
