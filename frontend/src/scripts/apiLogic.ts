import axios from 'axios';
import type { Card, Gamestate, Player } from './types';

const URL = import.meta.env.VITE_API_URL
const CARD_URL = URL.replace('/api','')

export async function getPlayer() {
    console.log("Getting new player...")
    const response = await axios.post(`${URL}/players`)

    const player:Player = {
        id:response.data.player.id,
        bankroll:response.data.player.bankroll
    }
    return player
}

export async function setupGame(playerId:string,bet:number) {
    console.log("Starting new game...")
    const response = await axios.post(`${URL}/games`, {
        playerId:playerId,
        bet:bet
    })
    console.log(response.data.game.id)
    const gameState:Gamestate = {
        id:response.data.game.id,
        playerHand:response.data.game.playerHand,
        dealerHand:response.data.game.dealerHand,
        playerTotal:response.data.game.playerTotal,
        dealerTotal:response.data.game.dealerTotal,
        gameResult:response.data.game.gameResult,
        playerId:response.data.game.playerId,
        bet:response.data.game.bet,
    }
    gameState.playerHand = fixCardImages(gameState.playerHand)
    gameState.dealerHand = fixCardImages(gameState.dealerHand)
    return gameState
}

export async function updateGameState(id:string) {
    console.log("Getting game...")
    const response = await axios.get(`${URL}/games/${id}`)
    const gameState:Gamestate = {
        id:response.data.game.id,
        playerHand:response.data.game.playerHand,
        dealerHand:response.data.game.dealerHand,
        playerTotal:response.data.game.playerTotal,
        dealerTotal:response.data.game.dealerTotal,
        gameResult:response.data.game.gameResult,
        playerId:response.data.game.playerId,
        bet:response.data.game.bet,
    }
    gameState.playerHand = fixCardImages(gameState.playerHand)
    gameState.dealerHand = fixCardImages(gameState.dealerHand)
    return gameState
}

export async function hit(id:string) {
    const response = await axios.post(`${URL}/games/${id}/hit`)
    return response.data.result
}

export async function standCall(id:string) {
    const response = await axios.post(`${URL}/games/${id}/stand`)
    return response.data.result
}

export async function updatePlayer(id:string) {
    const response = await axios.get(`${URL}/players/${id}`)

    const player:Player = {
        id:response.data.player.id,
        bankroll:response.data.player.bankroll
    }
    return player
}

// Not an API function, but used with API functions to ensure that images display correctly in the game
function fixCardImages(deck:Card[]) {
    for (var card of deck) {
        // Special case if the card is hidden
        card.image = CARD_URL + card.image
    }
    return deck
}