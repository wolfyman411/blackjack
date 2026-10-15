import type { Card } from "./deckClient.ts";

export interface Gamestate {
    id:string,
    deck_id:string,
    playerHand:Card[],
    dealerHand:Card[],
    playerTurn:boolean,
    gameResult:{},
    playerId:string|null,
    bet:number|null,
}