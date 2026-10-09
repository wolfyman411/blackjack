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

export function printGameState(id:string,showDealer:boolean) {

    // Get gamestate
    const currentState = activeGames.get(id)
    if (!currentState) {
        return null
    }

    var returnString = ""

    // Go through cards
    returnString += "Player's Hand: " + printHand(currentState.playerHand)
    returnString += "\n"
    // If we don't want to show the dealer's full hand, instead only show the first
    if (showDealer) {
        returnString += "Dealer's Hand: " + printHand(currentState.dealerHand)
    }
    else {
        returnString += "Dealer's Hand: " + printCardName(currentState.dealerHand[0]) + ", ???, " + calculateTotal(currentState.dealerHand.slice(0,1)) + " + ?"
    }

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