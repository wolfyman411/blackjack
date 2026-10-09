import express from 'express';
import { newDeck, getCards, drawCard } from '../game/deckClient.ts';
import { activeGames } from '../store/memoryStore.ts';
import { printGameState } from '../game/view.ts';
import { calculateTotal, checkWinState, dealerShouldDraw } from '../game/engine.ts';
const app = express()

export const gamesRouter = express.Router();

// POST METHODS
// Create a new deck, draw 2 cards for both player and dealer
gamesRouter.post('/games', function(req, res) {
    // First get the deck
    const deck_id = newDeck()

    // Then create a gamestate and add it to the memory store
    const newGame = {
        id: Date.now().toString(),
        deck_id: deck_id,
        playerHand:[],
        dealerHand:[],
        playerTurn:true
    }
    activeGames.set(newGame.id,newGame)

    // Finally draw the cards, adding the first 2 to the player and the last 2 to the dealer
    var drawnCards = drawCard(deck_id,4)
    newGame.playerHand = [drawnCards[0],drawnCards[1]]
    newGame.dealerHand = [drawnCards[2],drawnCards[3]]

    res.status(201).send(`Game created: ${newGame.id}\n${printGameState(newGame.id,false)}`)
})

// Draws one card for the player, ends on a bust
gamesRouter.post('/games/:id/hit', function(req, res) {
    // Get the gamestate
    const id = req.params.id
    const currentGame = activeGames.get(id)

    if (!currentGame) {
        return res.status(404).send('No game with that id exists');
    }

    // If the game has already ended, alert
    if (currentGame.gameResult?.gameMessage) {
        return res.status(409).send('Game already ended');
    }

    // Draw one card
    var drawnCards = drawCard(currentGame.deck_id,1)
    currentGame.playerHand.push(drawnCards[0])

    // Check if bust
    var playerTotal = calculateTotal(currentGame.playerHand)
    if (playerTotal > 21) {
        // Get the game result
        currentGame.gameResult = checkWinState(calculateTotal(currentGame.dealerHand),playerTotal,1)
        res.send(currentGame.gameResult.gameMessage)
    }
})

// Reveals dealer's card, plays for the dealer, then handles endstate
gamesRouter.post('/games/:id/stand', function(req, res) {
    // Get the gamestate
    const id = req.params.id
    const currentGame = activeGames.get(id)

    if (!currentGame) {
        return res.status(404).send('No game with that id exists');
    }

    // If the game has already ended, alert
    if (currentGame.gameResult?.gameMessage) {
        return res.status(409).send('Game already ended');
    }

    // Draw for the dealer
    while (dealerShouldDraw(calculateTotal(currentGame.dealerHand))) {
        var drawnCards = drawCard(currentGame.deck_id,1)
        currentGame.dealerHand.push(drawnCards[0])
    }

    // Check game end
    var playerTotal = calculateTotal(currentGame.playerHand)
    var dealerTotal = calculateTotal(currentGame.dealerHand)
    
    // Get the game result
    currentGame.gameResult = checkWinState(dealerTotal,playerTotal,1)
    res.send(currentGame.gameResult.gameMessage)
})


// GET METHODS
// Returns the current state of the game
gamesRouter.get('/games/:id', function(req, res) {
    const id = req.params.id
    const currentGame = activeGames.get(id)

    if (!currentGame) {
        return res.status(404).send('No game with that id exists');
    }

    // Only show dealer hand if the game has ended
    var showHand = false
    if (currentGame.gameResult?.gameMessage) {
        showHand = true
    }

    res.send(printGameState(id,showHand))
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