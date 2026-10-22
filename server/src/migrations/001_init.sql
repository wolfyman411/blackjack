CREATE TABLE players (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bankroll    integer NOT NULL DEFAULT 1000,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE games (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       uuid NOT NULL REFERENCES players(id),
  bet             integer NOT NULL,
  outcome         text NOT NULL CHECK (outcome IN ('player', 'dealer', 'push')),
  payout          integer NOT NULL,
  bankroll_after  integer NOT NULL,
  player_total    integer NOT NULL,
  dealer_total    integer NOT NULL,
  settled_at      timestamptz NOT NULL DEFAULT now()
);

-- games played, wins, losses and win rate for one player
SELECT count(*)                                              AS games_played,
       count(*) FILTER (WHERE outcome = 'player')            AS wins,
       count(*) FILTER (WHERE outcome = 'dealer')            AS losses,
       round(100.0 * count(*) FILTER (WHERE outcome = 'player') / nullif(count(*), 0), 1) AS win_rate_pct
FROM games WHERE player_id = $1;

-- current bankroll
SELECT bankroll FROM players WHERE id = $1;