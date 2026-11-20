import axios, { type AxiosStatic } from 'axios';
import type { Card, Gamestate, Player } from './types';

const URL = import.meta.env.VITE_API_URL
const CARD_URL = URL.replace('/api','')

export async function getApiHealth() {
    try {
        const response = await axios.get(`${URL}/health`)
        if (response.data.ok) {
            return true
        }
        else {
            return false
        }
    }
    catch (e) {
        return false
    }
}

export async function getPlayer(username:string,password:string) {
    console.log("Getting new player...")

    var response:any = null

    // Check if this player already exists
    try {
        response = await axios.post(`${URL}/players/login`, {
            username:username,
            password:password
        })
        // If we just have a username then the password failed
        if (!response.data.player.bankroll) {
            console.log("Password invalid!")
            return null
        }
    }
    catch (e) {
        // Otherwise create a new player
        response = await axios.post(`${URL}/players`, {
            username:username,
            password:password
        })
    }

    const player:Player = {
        id:response.data.player.id,
        username:response.data.player.user_email,
        password:response.data.player.user_password,
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
    try {
        const response = await axios.post(`${URL}/games/${id}/stand`)
        return response.data.result
    }
    catch (e) {
        return e
    }
}

export async function reload(id:string) {
    const response = await axios.post(`${URL}/players/${id}/reload`)
}

export async function updatePlayer(previous_player:Player) {
    const response = await axios.get(`${URL}/players/${previous_player.id}`)

    previous_player.bankroll = response.data.bankroll
    return previous_player
}

// Not an API function, but used with API functions to ensure that images display correctly in the game
function fixCardImages(deck:Card[]) {
    for (var card of deck) {
        // Special case if the card is hidden
        card.image = CARD_URL + card.image
    }
    return deck
}