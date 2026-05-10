import { useMemo, useState } from 'react';
import { cardLabel, rankLabel, suitLabel } from './game/cards';
import {
  advanceStreet,
  calculateEquity,
  getPlayerEvaluations,
  getWinnerIds,
  startSingleMatch,
} from './game/gameEngine';
import { type Card, type GameState, type Street } from './game/types';

const streetLabels: Record<Street, string> = {
  preflop: 'Pre-flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  finished: 'Result',
};

const handLabels: Record<string, string> = {
  'High Card': 'ハイカード',
  Pair: 'ワンペア',
  'Two Pair': 'ツーペア',
  'Three of a Kind': 'スリーカード',
  Straight: 'ストレート',
  Flush: 'フラッシュ',
  'Full House': 'フルハウス',
  'Four of a Kind': 'フォーカード',
  'Straight Flush': 'ストレートフラッシュ',
  'Royal Flush': 'ロイヤルフラッシュ',
};

function App() {
  const [playerCount, setPlayerCount] = useState(4);
  const [state, setState] = useState<GameState>(() => startSingleMatch(4));

  const equities = useMemo(() => calculateEquity(state, 800), [state]);
  const evaluations = useMemo(() => getPlayerEvaluations(state), [state]);
  const winnerIds = useMemo(() => getWinnerIds(state), [state]);
  const canAdvance = state.street !== 'finished';

  function newGame(nextPlayerCount = playerCount) {
    setState(startSingleMatch(nextPlayerCount));
  }

  function handlePlayerCountChange(nextPlayerCount: number) {
    setPlayerCount(nextPlayerCount);
    newGame(nextPlayerCount);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Single Match
            </p>
            <h1 className="mt-1 text-3xl font-bold">All-in Poker Equity</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Players
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm"
                value={playerCount}
                onChange={(event) => handlePlayerCountChange(Number(event.target.value))}
              >
                {[2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="button" onClick={() => newGame()}>
              New Game
            </button>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Street</p>
                <h2 className="text-2xl font-semibold">{streetLabels[state.street]}</h2>
              </div>
              <button
                className="primary-button disabled:cursor-not-allowed disabled:bg-slate-300"
                type="button"
                disabled={!canAdvance}
                onClick={() => setState((current) => advanceStreet(current))}
              >
                {state.street === 'river' ? 'Show Result' : 'Next'}
              </button>
            </div>

            <div className="community-area">
              {Array.from({ length: 5 }, (_, index) => (
                <CardView key={index} card={state.communityCards[index]} muted={!state.communityCards[index]} />
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Monte Carlo</p>
            <p className="mt-1 text-3xl font-semibold">800</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              未公開カードを補完して、各プレイヤーの現在勝率を計算します。
            </p>
            {state.street === 'finished' && (
              <div className="mt-5 rounded-md bg-emerald-50 p-4 text-emerald-950">
                <p className="text-sm font-semibold">Winner</p>
                <p className="mt-1 text-lg font-bold">
                  {winnerIds.map((id) => `Player ${id}`).join(' / ')}
                </p>
              </div>
            )}
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.players.map((player) => {
            const equity = equities.find((item) => item.playerId === player.id)?.equity ?? 0;
            const evaluation = evaluations.get(player.id);
            const isWinner = winnerIds.includes(player.id) && state.street === 'finished';

            return (
              <article
                className={`player-panel ${isWinner ? 'border-emerald-500 bg-emerald-50' : ''}`}
                key={player.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {equity.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  {player.holeCards.map((card) => (
                    <CardView key={cardLabel(card)} card={card} />
                  ))}
                </div>

                <div className="mt-4 min-h-12 border-t border-slate-200 pt-3">
                  {evaluation ? (
                    <>
                      <p className="text-sm text-slate-500">Final hand</p>
                      <p className="font-semibold">{handLabels[evaluation.category]}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Riverで最終役を表示</p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function CardView({ card, muted = false }: { card?: Card; muted?: boolean }) {
  if (!card) {
    return <div className="playing-card border-dashed text-slate-300">{muted ? '?' : ''}</div>;
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className={`playing-card ${isRed ? 'text-rose-600' : 'text-slate-950'}`}>
      <span className="text-xl font-bold">{rankLabel(card.rank)}</span>
      <span className="text-2xl leading-none">{suitLabel(card.suit)}</span>
    </div>
  );
}

export default App;
