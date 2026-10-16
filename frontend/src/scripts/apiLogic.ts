import axios from 'axios';
import type { Gamestate, Player } from './types';

const URL = "http://127.0.0.1:3000/api"

export async function getPlayer() {
    console.log("Getting new player...")
    const response = await axios.post(`${URL}/players`)

    console.log(response.data.player)

    const player:Player = {
        id:response.data.player.id,
        bankroll:response.data.player.bankroll
    }
    return player
}

export async function getDeck() {
    console.log("Getting new deck...")
    try {
        const response = await axios.get(`${URL}/new/games/`)
        return response.data.deck_id
    }
    catch (error) {
        console.error(error)
    }
}

export async function setupGame(playerId:string,bet:number) {
    console.log("Starting new game...")
    const response = await axios.post(`${URL}/games`, {
        playerId:playerId,
        bet:bet
    })
    const gameState:Gamestate = {
        id:response.data.game.id,
        playerHand:response.data.game.playerHand,
        dealerHand:response.data.game.dealerHand,
        gameResult:response.data.game.gameResult,
        playerId:response.data.game.playerId,
        bet:response.data.game.bet,
    }
    return gameState
}

export async function updateGameState(id:string) {
    console.log("Getting game...")
    const response = await axios.get(`${URL}/games/${id}`)
    const gameState:Gamestate = {
        id:response.data.game.id,
        playerHand:response.data.game.playerHand,
        dealerHand:response.data.game.dealerHand,
        gameResult:response.data.game.gameResult,
        playerId:response.data.game.playerId,
        bet:response.data.game.bet,
    }
    return gameState
}

export function shuffleDeck(id:string) {
    axios.get(`${URL}/${id}/shuffle/`)
    .catch((error) => {
        console.error(error)
    })
}

export async function drawCards(id:string) {
    const response = await axios.get(`${URL}/${id}/hit`)
    return response.data.cards
}

export async function hit(id:string) {
    const response = await axios.post(`${URL}/${id}/hit`)
    return response.data.result
}

export async function standCall(id:string) {
    const response = await axios.post(`${URL}/${id}/stand`)
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