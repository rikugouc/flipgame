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
  const revealedCards = state.communityCards.length;

  function newGame(nextPlayerCount = playerCount) {
    setState(startSingleMatch(nextPlayerCount));
  }

  function handlePlayerCountChange(nextPlayerCount: number) {
    setPlayerCount(nextPlayerCount);
    newGame(nextPlayerCount);
  }

  return (
    <main className="casino-shell min-h-screen text-stone-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="casino-topbar">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Single Match
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">All-in Poker Equity</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="casino-select-label">
              Players
              <select
                className="casino-select"
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

        <section className="casino-statusbar">
          <div className="status-item">
            <span>Street</span>
            <h2>{streetLabels[state.street]}</h2>
          </div>
          <div className="status-item">
            <span>Board</span>
            <strong>{revealedCards}/5</strong>
          </div>
          <div className="status-item">
            <span>Monte Carlo</span>
            <strong>800</strong>
          </div>
          {state.street === 'finished' && (
            <div className="winner-banner">
              <span>Winner</span>
              <strong>{winnerIds.map((id) => `Player ${id}`).join(' / ')}</strong>
            </div>
          )}
          <button
            className="primary-button disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={!canAdvance}
            onClick={() => setState((current) => advanceStreet(current))}
          >
            {state.street === 'river' ? 'Show Result' : 'Next'}
          </button>
        </section>

        <section className="poker-layout">
          <div className="table-stage">
            <div className="poker-table">
              <div className="table-felt">
                <div className="dealer-mark">BOARD</div>
                <div className="community-area">
                  {Array.from({ length: 5 }, (_, index) => (
                    <CardView
                      key={index}
                      card={state.communityCards[index]}
                      muted={!state.communityCards[index]}
                    />
                  ))}
                </div>
                <div className="table-caption">
                  未公開カードを補完して、各プレイヤーの現在勝率を計算します。
                </div>
              </div>
            </div>
          </div>

          <section className="seats-grid">
            {state.players.map((player) => {
              const equity = equities.find((item) => item.playerId === player.id)?.equity ?? 0;
              const evaluation = evaluations.get(player.id);
              const isWinner = winnerIds.includes(player.id) && state.street === 'finished';

              return (
                <article className={`player-seat ${isWinner ? 'winner-seat' : ''}`} key={player.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="seat-label">Seat {player.id}</p>
                      <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                    </div>
                    <span className="equity-chip">{equity.toFixed(1)}%</span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {player.holeCards.map((card) => (
                      <CardView key={cardLabel(card)} card={card} />
                    ))}
                  </div>

                  <div className="seat-footer">
                    {evaluation ? (
                      <>
                        <p>Final hand</p>
                        <strong>{handLabels[evaluation.category]}</strong>
                      </>
                    ) : (
                      <p>Riverで最終役を表示</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      </div>
    </main>
  );
}

function CardView({ card, muted = false }: { card?: Card; muted?: boolean }) {
  if (!card) {
    return <div className="playing-card empty-card">{muted ? '?' : ''}</div>;
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className={`playing-card ${isRed ? 'red-card' : 'black-card'}`}>
      <span className="card-rank">{rankLabel(card.rank)}</span>
      <span className="card-suit">{suitLabel(card.suit)}</span>
    </div>
  );
}

export default App;
