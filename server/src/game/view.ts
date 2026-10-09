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