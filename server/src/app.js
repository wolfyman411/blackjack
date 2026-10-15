import express from 'express';
import { drawCard } from './game/deckClient.ts';
import {gamesRouter} from './routes/games.js'
import {playerRouter} from './routes/players.js'

export function createApp(drawCardFn = drawCard) {
  const app = express()
  app.use(express.json())
  app.use('/api/games', gamesRouter(drawCardFn))
  app.use('/api/players',playerRouter())
  return app
}

export const app = createApp()