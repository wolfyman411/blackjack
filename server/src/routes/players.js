import express from 'express';
import { ApiError } from '../errorHandling.ts';
import { createPlayer, getPlayerId, updateBankRoll, getPlayerUsername } from '../db/playerRepo.ts';

export function playerRouter() {
    const router = express.Router();

    //POST METHODS
    // Create a player with a bankroll
    router.post('/', async function(req, res) {
        const username = req.body?.username;
        const password = req.body?.password;

        const player = await createPlayer(username,password)

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
            throw ApiError(404, 'INVALID_PLAYER', 'No player with that id exists');
        }

        var bankroll = currentPlayer.bankroll
        if (forced_bankroll !== undefined) {
            bankroll = forced_bankroll
        }

        if (bankroll !== 0) {
            throw ApiError(409,'INVALID_ACTION', `Player bankroll does not equal 0, is currently: ${bankroll}`);
        }

        updateBankRoll(id,0,1000,true)
        
        res.status(201).json({
            message: `Bankroll refreshed`
        })
    })

    // Validate login
    router.post('/login', async function(req, res) {

        const username = req.body?.username;
        const password = req.body?.password;

        const currentPlayer = await getPlayerUsername(username,password)
        
        if (!currentPlayer) {
            throw ApiError(404,'INVALID_PLAYER', 'No player with that id exists');
        }

        if (!currentPlayer.bankroll) {
            return res.status(401).json({
                player: currentPlayer
            })
        }

        res.status(200).json({
            player: currentPlayer
        })
    })

    //GET METHODS
    // Return the player bankroll
    router.get('/:id', async function(req, res) {
        const id = req.params.id
        const currentPlayer = await getPlayerId(id)
        
        if (!currentPlayer) {
            throw ApiError(404,'INVALID_PLAYER', 'No player with that id exists');
        }

        res.status(200).json({
            bankroll: `${currentPlayer.bankroll}`
        })
    })

    return router
}