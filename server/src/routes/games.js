import express from 'express';
import { newDeck } from '../game/deckClient.ts';
import { activeGames, activePlayers } from '../store/memoryStore.ts';
import { betCalculate, calculateTotal, checkWinState, dealerShouldDraw } from '../game/engine.ts';
import { ApiError } from '../errorHandling.ts';
import { getPlayerId, updateBankRoll } from '../db/playerRepo.ts';
import { createGame } from '../db/gamesRepo.ts';

export function gamesRouter(drawCard) {
    const router = express.Router();

    // POST METHODS
    // Create a new deck, draw 2 cards for both player and dealer
    router.post('/', async function(req, res) {
        const playerId = req.body?.playerId;
        const bet = req.body?.bet;

        // First get the deck
        const deck_id = newDeck()

        // Then create a gamestate and add it to the memory store
        const newGame = {
            id: Date.now().toString(),
            deck_id: deck_id,
            playerHand:[],
            dealerHand:[],
            playerTotal:"",
            dealerTotal:"",
            playerTurn:true
        }

        // If we have a don't have a bet or player ignore this
        const currentPlayer = await getPlayerId(playerId)
        if (!currentPlayer) {
            throw ApiError('INVALID_PLAYER', 404, 'No player with that id exists');
        }

        // If bet is greater than our payroll it is invalid or if bet is negative it is invalid
        if (bet > currentPlayer.bankroll || bet < 0) {
            throw ApiError('INVALID_BET', 400, 'Invalid bet.');
        }

        // If we pass both conditions remove the bet from the player and add it to the game
        currentPlayer.bankroll -= bet
        newGame.playerId = currentPlayer.id
        newGame.bet = bet

        activeGames.set(newGame.id,newGame)

        // Finally draw the cards, adding the first 2 to the player and the last 2 to the dealer
        var drawnCards = drawCard(deck_id,4)
        newGame.playerHand = [drawnCards[0],drawnCards[1]]
        newGame.dealerHand = [drawnCards[2],drawnCards[3]]

        var dealerArray = [newGame.dealerHand[0]]

        newGame.playerTotal = calculateTotal(newGame.playerHand)
        newGame.dealerTotal = calculateTotal(dealerArray) + " + ?"

        var obfuscatedGame = {
            ...newGame,
            dealerHand: [...newGame.dealerHand]
        }
        // Obfuscate second dealer card
        var obfuscatedCard = {
            value:"???",
            suit:"???",
            image:"/static/cards/CARD_BACK.png"
        }
        obfuscatedGame.dealerHand[1] = obfuscatedCard

        res.status(201).json({
            message: `Game created: ${newGame.id}`,
            game: obfuscatedGame
        })
    })

    // Draws one card for the player, ends on a bust
    router.post('/:id/hit', async function(req, res) {
        // Get the gamestate
        const id = req.params.id
        const currentGame = activeGames.get(id)

        if (!currentGame) {
            throw ApiError('INVALID_GAME', 404, 'No game with that id exists.');
        }

        // If the game has already ended, alert
        if (currentGame.gameResult?.gameMessage) {
            throw ApiError('GAME_ENDED', 409, 'Game already ended.');
        }

        // Draw one card
        var drawnCards = drawCard(currentGame.deck_id,1)
        currentGame.playerHand.push(drawnCards[0])

        // Check if bust
        var playerTotal = calculateTotal(currentGame.playerHand)
        if (playerTotal > 21) {
            currentGame.gameResult = checkWinState(calculateTotal(currentGame.dealerHand),playerTotal,1)
            const currentPlayer = await getPlayerId(currentGame.playerId)

            var dealerTotal = calculateTotal(currentGame.playerHand)

            await createGame(currentPlayer.id,currentGame.bet,'dealer',0,currentPlayer.bankroll-currentGame.bet,playerTotal,dealerTotal)
            await updateBankRoll(currentPlayer.id,currentPlayer.bankroll-currentGame.bet)

            return res.status(200).json({
                message: `${currentGame.gameResult.gameMessage}`,
                result: drawnCards[0]
            })
        }
        res.status(200).json({
            message: `Card drawn`,
            result: drawnCards[0]
        })
    })

    // Reveals dealer's card, plays for the dealer, then handles endstate
    router.post('/:id/stand', async function(req, res) {
        // Get the gamestate
        const id = req.params.id
        const currentGame = activeGames.get(id)

        if (!currentGame) {
            throw ApiError('INVALID_GAME', 404, 'No game with that id exists.');
        }

        // If the game has already ended, alert
        if (currentGame.gameResult?.gameMessage) {
            throw ApiError('GAME_ENDED', 409, 'Game already ended.');
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

        const currentPlayer = await getPlayerId(currentGame.playerId)
        
        // Issue grabbing the player
        if (!currentPlayer) {
            throw ApiError('INVALID_PLAYER', 404, 'No player with that id exists');
        }

        var winnings = betCalculate(currentGame.gameResult.winState,currentGame.bet)
        var bankroll = currentPlayer.bankroll + winnings - currentGame.bet

        const dbGame = await createGame(currentPlayer.id,currentGame.bet,currentGame.gameResult.winState,winnings,bankroll,playerTotal,dealerTotal)
        await updateBankRoll(currentPlayer.id,bankroll)

        res.status(200).json({
            message: `${currentGame.gameResult.gameMessage}`,
            gameId: `${dbGame.id}`,
            result: currentGame.gameResult
        })
    })


    // GET METHODS
    // Returns the current state of the game
    router.get('/:id', function(req, res) {
        const id = req.params.id
        const currentGame = activeGames.get(id)

        if (!currentGame) {
            throw ApiError('INVALID_GAME', 404, 'No game with that id exists.');
        }

        var obfuscatedGame = {
            ...currentGame,
            dealerHand: [...currentGame.dealerHand]
        }

        // If the game hasn't ended, we still hide the cards
        if (!currentGame.gameResult?.gameMessage) {
            var obfuscatedCard = {
                value:"???",
                suit:"???",
                image:"/static/cards/CARD_BACK.png"
            }
            obfuscatedGame.dealerHand[1] = obfuscatedCard
        }

        res.status(200).json({
            game: obfuscatedGame
        })
    })

    return router
}

//http://127.0.0.1:3000/static/cards/back.png
//http://127.0.0.1:3000/static/cards/7_DIAMONDS.png