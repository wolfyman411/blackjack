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