import express from 'express';
import { newDeck, getCards } from '../game/deckClient.ts';
const app = express()

export const gamesRouter = express.Router();

// POST METHODS
// Create a new deck, draw 2 cards for both player and dealer
gamesRouter.post('/games', function(req, res) {
    res.send('Hello Geeks')
})

// Draws one card for the player, ends on a bust
gamesRouter.post('/games/:id/hit', function(req, res) {
    res.send('Hello Geeks')
})

// Reveals dealer's card, plays for the dealer, then handles endstate
gamesRouter.post('/games/:id/stand', function(req, res) {
    res.send('Hello Geeks')
})


// GET METHODS
// Returns the current state of the game
gamesRouter.get('/games/:id', function(req, res) {
    res.send('Hello Geeks')
})

// TEST METHODS
// Creates a deck, shuffles, and returns the id
gamesRouter.post('/decks', function(req, res) {
    res.send(newDeck())
})

// Returns all the cards currently in the draw pile of a deck
gamesRouter.get('/decks/:id', function(req, res) {
    const id = req.params.id
    res.send(getCards(id))
})