import { describe, expect, it } from 'vitest';
import { advanceStreet, calculateEquity, getWinnerIds, startSingleMatch } from './gameEngine';
import { type Card, type GameState, type Suit } from './types';

function c(rank: Card['rank'], suit: Suit): Card {
  return { rank, suit };
}

describe('gameEngine', () => {
  it('deals two cards to each player and advances through streets', () => {
    let state = startSingleMatch(4, () => 0);

    expect(state.players).toHaveLength(4);
    expect(state.players.every((player) => player.holeCards.length === 2)).toBe(true);
    expect(state.communityCards).toHaveLength(0);

    state = advanceStreet(state);
    expect(state.street).toBe('flop');
    expect(state.communityCards).toHaveLength(3);

    state = advanceStreet(state);
    expect(state.street).toBe('turn');
    expect(state.communityCards).toHaveLength(4);

    state = advanceStreet(state);
    expect(state.street).toBe('river');
    expect(state.communityCards).toHaveLength(5);

    state = advanceStreet(state);
    expect(state.street).toBe('finished');
  });

  it('returns multiple winners for a chopped board', () => {
    const state: GameState = {
      street: 'finished',
      deck: [],
      communityCards: [
        c(14, 'spades'),
        c(13, 'spades'),
        c(12, 'spades'),
        c(11, 'spades'),
        c(10, 'spades'),
      ],
      players: [
        { id: 1, name: 'Player 1', holeCards: [c(2, 'clubs'), c(3, 'diamonds')] },
        { id: 2, name: 'Player 2', holeCards: [c(4, 'clubs'), c(5, 'diamonds')] },
      ],
    };

    expect(getWinnerIds(state)).toEqual([1, 2]);
  });

  it('calculates equities in a valid percentage range', () => {
    const state = startSingleMatch(3, () => 0.25);
    const equities = calculateEquity(state, 50, () => 0.5);
    const total = equities.reduce((sum, item) => sum + item.equity, 0);

    expect(equities).toHaveLength(3);
    expect(equities.every((item) => item.equity >= 0 && item.equity <= 100)).toBe(true);
    expect(total).toBeCloseTo(100, 5);
  });
});
