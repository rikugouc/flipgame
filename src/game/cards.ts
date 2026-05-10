import { type Card, ranks, type Rng, suits } from './types';

export function createDeck(): Card[] {
  return suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
}

export function cardKey(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

export function shuffleDeck(deck: Card[], rng: Rng = Math.random): Card[] {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function rankLabel(rank: number): string {
  if (rank === 14) return 'A';
  if (rank === 13) return 'K';
  if (rank === 12) return 'Q';
  if (rank === 11) return 'J';
  if (rank === 10) return 'T';
  return String(rank);
}

export function suitLabel(suit: Card['suit']): string {
  const labels: Record<Card['suit'], string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  return labels[suit];
}

export function cardLabel(card: Card): string {
  return `${rankLabel(card.rank)}${suitLabel(card.suit)}`;
}
