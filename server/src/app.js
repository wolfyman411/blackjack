import express from 'express';
import {gamesRouter} from './routes/games.js'

export const app = express()

app.use(express.json())

app.use('/api',gamesRouter)

app.listen(3000, () => {
  console.log("Listening on http://127.0.0.1:3000")
})