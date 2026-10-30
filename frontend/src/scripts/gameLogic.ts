import type { Card } from "./types";

export function canPlaceBet(bankroll:number, currentBet:number, amount:number) {
    if (amount < 0) {
        if (currentBet < -amount || currentBet === 0) {
            return false
        }
    }
    else if (amount === 0) {
        return false
    }
    else {
        if (bankroll < amount || bankroll === 0) {
            return false
        }
    }
    return true
}

// This is purely for calculating the dealer total at the end !!!IT SHOULD NOT BE USED FOR ANYTHING ELSE!!!
export function calculateTotal(hand: Card[]) : number {
    let total = 0;
    let aces = 0;
    for (const card of hand) {
        if (card.value === 'JACK' || card.value === 'QUEEN' || card.value === 'KING') {
        total += 10;
        } else if (card.value === 'ACE') {
        aces++;
        } else {
        total += parseInt(card.value);
        }
    }
    // Adjust for aces
    while (aces > 0) {
        if (total + 11 <= 21) {
        total += 11
        } else {
        total += 1
        }
        aces--;
    }
    return total;
}