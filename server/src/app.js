import express from 'express';
import { drawCard } from './game/deckClient.ts';
import {gamesRouter} from './routes/games.js'

export function createApp(drawCardFn = drawCard) {
  const app = express();
  app.use(express.json());
  app.use('/api', gamesRouter(drawCardFn));
  return app;
}

export const app = createApp();