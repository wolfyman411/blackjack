export interface Card {
    value: string;
    suit: string;
    image: string;
    hidden: boolean;
    flipping?: boolean; //Special case for dealer's second card
}

export interface Gamestate {
    id:string,
    playerHand:Card[],
    dealerHand:Card[],
    gameResult:{
        playerMessage:string,
        dealerMessage:string,
        gameMessage:string,
        winState:number,
    },
    playerId:string,
    bet:number,
}

export interface Player {
    id:string,
    bankroll:number
}