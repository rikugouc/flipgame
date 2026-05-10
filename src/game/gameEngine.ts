import { createDeck, shuffleDeck } from './cards';
import { compareHands, evaluateBestHand } from './handEvaluator';
import { type Card, type EquityResult, type GameState, type HandEvaluation, type Rng } from './types';

const streetDraws: Record<GameState['street'], number> = {
  preflop: 3,
  flop: 1,
  turn: 1,
  river: 0,
  finished: 0,
};

export function startSingleMatch(playerCount: number, rng: Rng = Math.random): GameState {
  if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 6) {
    throw new Error('Player count must be between 2 and 6.');
  }

  const deck = shuffleDeck(createDeck(), rng);
  const players = Array.from({ length: playerCount }, (_, index) => {
    const firstCard = deck[index * 2];
    const secondCard = deck[index * 2 + 1];

    if (!firstCard || !secondCard) {
      throw new Error('Deck did not contain enough cards to deal.');
    }

    return {
      id: index + 1,
      name: `Player ${index + 1}`,
      holeCards: [firstCard, secondCard],
    };
  });

  return {
    players,
    deck: deck.slice(playerCount * 2),
    communityCards: [],
    street: 'preflop',
  };
}

export function advanceStreet(state: GameState): GameState {
  if (state.street === 'finished') return state;

  if (state.street === 'river') {
    return { ...state, street: 'finished' };
  }

  const drawCount = streetDraws[state.street];
  const nextCommunityCards = [...state.communityCards, ...state.deck.slice(0, drawCount)];
  const nextDeck = state.deck.slice(drawCount);
  const nextStreet = state.street === 'preflop' ? 'flop' : state.street === 'flop' ? 'turn' : 'river';

  return {
    ...state,
    deck: nextDeck,
    communityCards: nextCommunityCards,
    street: nextStreet,
  };
}

export function getPlayerEvaluations(state: GameState): Map<number, HandEvaluation> {
  if (state.communityCards.length < 5) {
    return new Map();
  }

  return new Map(
    state.players.map((player) => [
      player.id,
      evaluateBestHand([...player.holeCards, ...state.communityCards]),
    ]),
  );
}

export function getWinnerIds(state: GameState): number[] {
  const evaluations = getPlayerEvaluations(state);
  let best: HandEvaluation | null = null;
  let winnerIds: number[] = [];

  for (const player of state.players) {
    const evaluation = evaluations.get(player.id);
    if (!evaluation) continue;

    if (!best || compareHands(evaluation, best) > 0) {
      best = evaluation;
      winnerIds = [player.id];
    } else if (compareHands(evaluation, best) === 0) {
      winnerIds.push(player.id);
    }
  }

  return winnerIds;
}

export function calculateEquity(
  state: GameState,
  simulations = 800,
  rng: Rng = Math.random,
): EquityResult[] {
  const scores = new Map(state.players.map((player) => [player.id, 0]));
  const missingCommunityCards = 5 - state.communityCards.length;

  for (let simulation = 0; simulation < simulations; simulation += 1) {
    const shuffledRemainder = shuffleDeck(state.deck, rng);
    const simulatedCommunityCards = [
      ...state.communityCards,
      ...shuffledRemainder.slice(0, missingCommunityCards),
    ];
    const winners = getSimulatedWinnerIds(state.players, simulatedCommunityCards);
    const share = 1 / winners.length;

    for (const winnerId of winners) {
      scores.set(winnerId, (scores.get(winnerId) ?? 0) + share);
    }
  }

  return state.players.map((player) => ({
    playerId: player.id,
    equity: ((scores.get(player.id) ?? 0) / simulations) * 100,
  }));
}

function getSimulatedWinnerIds(
  players: GameState['players'],
  communityCards: Card[],
): number[] {
  let best: HandEvaluation | null = null;
  let winnerIds: number[] = [];

  for (const player of players) {
    const evaluation = evaluateBestHand([...player.holeCards, ...communityCards]);

    if (!best || compareHands(evaluation, best) > 0) {
      best = evaluation;
      winnerIds = [player.id];
    } else if (compareHands(evaluation, best) === 0) {
      winnerIds.push(player.id);
    }
  }

  return winnerIds;
}
