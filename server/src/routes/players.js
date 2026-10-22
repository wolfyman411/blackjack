import express from 'express';
import { activePlayers } from '../store/memoryStore.ts';
import { ApiError } from '../errorHandling.ts';
import { createPlayer, getPlayerId } from '../db/playerRepo.ts';

export function playerRouter() {
    const router = express.Router();

    //POST METHODS
    // Create a player with a bankroll
    router.post('/', async function(req, res) {

        const player = await createPlayer()

        res.status(201).json({
            message: `Player created: ${player.id}`,
            player
        })
    })

    // Refresh the bankroll back to 1000, only if bankroll is exactly 0
    router.post('/:id/reload', async function(req, res) {
        const id = req.params.id
        const currentPlayer = await getPlayerId(id)
        const forced_bankroll = req.body?.bankroll;
        
        if (!currentPlayer) {
            throw ApiError('INVALID_PLAYER', 404, 'No player with that id exists');
        }

        var bankroll = currentPlayer.bankroll
        if (forced_bankroll !== undefined) {
            bankroll = forced_bankroll
        }

        if (bankroll !== 0) {
            throw ApiError('INVALID_ACTION', 409, `Player bankroll does not equal 0, is currently: ${bankroll}`);
        }

        currentPlayer.bankroll = 1000
        
        res.status(201).json({
            message: `Bankroll refreshed`
        })
    })

    //GET METHODS
    // Return the player bankroll
    router.get('/:id', async function(req, res) {
        const id = req.params.id
        const currentPlayer = await getPlayerId(id)
        
        if (!currentPlayer) {
            throw ApiError('INVALID_PLAYER', 404, 'No player with that id exists');
        }

        res.status(200).json({
            bankroll: `${currentPlayer.bankroll}`
        })
    })

    return router
}