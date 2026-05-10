import { describe, expect, it } from 'vitest';
import { cardKey, createDeck } from './cards';

describe('cards', () => {
  it('creates a 52 card deck without duplicates', () => {
    const deck = createDeck();
    const keys = new Set(deck.map(cardKey));

    expect(deck).toHaveLength(52);
    expect(keys.size).toBe(52);
  });
});
