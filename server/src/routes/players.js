import express from 'express';
import { activePlayers } from '../store/memoryStore.ts';
import { ApiError } from '../errorHandling.ts';

export function playerRouter() {
    const router = express.Router();

    //POST METHODS
    // Create a player with a bankroll
    router.post('/', function(req, res) {

        const newPlayer = {
            id: Date.now().toString(),
            bankroll: 1000
        }
        activePlayers.set(newPlayer.id,newPlayer)

        res.status(201).json({
            message: `Player created: ${newPlayer.id}`,
            player: newPlayer
        })
    })

    // Refresh the bankroll back to 1000, only if bankroll is exactly 0
    router.post('/:id/reload', function(req, res) {
        const id = req.params.id
        const currentPlayer = activePlayers.get(id)
        
        if (!currentPlayer) {
            throw ApiError('INVALID_PLAYER', 404, 'No player with that id exists');
        }
        else if (currentPlayer.bankroll !== 0) {
            throw ApiError('INVALID_ACTION', 409, `Player bankroll does not equal 0, is currently: ${currentPlayer.bankroll}`);
        }

        currentPlayer.bankroll = 1000
        
        res.status(201).json({
            message: `Bankroll refreshed`
        })
    })

    //GET METHODS
    // Return the player bankroll
    router.get('/:id', function(req, res) {
        const id = req.params.id
        const currentPlayer = activePlayers.get(id)
        
        if (!currentPlayer) {
            throw ApiError('INVALID_PLAYER', 404, 'No player with that id exists');
        }

        res.status(200).json({
            bankroll: `${currentPlayer.bankroll}`
        })
    })

    return router
}