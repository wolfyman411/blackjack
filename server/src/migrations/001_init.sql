CREATE TABLE IF NOT EXISTS players (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bankroll    integer NOT NULL DEFAULT 1000,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
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