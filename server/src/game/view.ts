import { activeGames } from "../store/memoryStore.ts";
import type { Card } from "./deckClient.ts";
import { calculateTotal } from "./engine.ts";

export interface gameState {
    id:string,
    deck_id:string,
    playerHand:Card[],
    dealerHand:Card[],
    playerTurn:boolean,
    gameResult:{}
}

export function printGameState(id:string) {

    // Get gamestate
    const currentState = activeGames.get(id)
    if (!currentState) {
        return null
    }

    var returnString = ""

    // Go through cards
    returnString += "Player's Hand: " + printHand(currentState.playerHand)
    returnString += "\n"
    returnString += "Dealer's Hand: " + printHand(currentState.dealerHand)

    return returnString
}

function printHand(cards:Card[]) {
    var returnString = ""
    for (const card of cards) {
        returnString += `${printCardName(card)}, `
    }
    // Add total
    returnString += `${calculateTotal(cards)}`
    return returnString
}

function printCardName(card:Card) {
    return `${card.value} OF ${card.suit}`
}