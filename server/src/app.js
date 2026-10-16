import express from 'express';
import cors from 'cors';
import { drawCard } from './game/deckClient.ts';
import {gamesRouter} from './routes/games.js'
import {playerRouter} from './routes/players.js'

export function createApp(drawCardFn = drawCard) {
  const app = express()
  app.use(cors());
  app.use(express.json())
  app.use('/api/games', gamesRouter(drawCardFn))
  app.use('/api/players',playerRouter())
  app.use((err,req,res,next) => {
    const status = err.status ?? 500;
    const code = err.code ?? 'INTERNAL_ERROR';
    const message = status === 500 ? 'Something went wrong' : err.message;
    res.status(status).json({ error: { code, message } });
  })
  return app
}

export const app = createApp()