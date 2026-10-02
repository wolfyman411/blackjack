export interface Card {
    value: string;
    suit: string;
    image: string;
    hidden: boolean;
}

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

export function checkWinState(dealerTotal:number, playerTotal:number, bet:number) {
    // If both are busted, it's a tie
    if (dealerTotal > 21 && playerTotal > 21) {
      return {
        "playerMessage":`Draw + ${bet} Money`,
        "dealerMessage":"Draw",
        "gameMessage":"Both bust! It's a tie!",
        "winState":2
      }
    }
    // If the dealer busts, the player wins
    else if (dealerTotal > 21) {
      return {
        "playerMessage":`Winner + ${2*bet} Money`,
        "dealerMessage":"Loser",
        "gameMessage":"Dealer busts! You win!",
        "winState":1
      }
    }
    // If the player busts, the dealer wins
    else if (playerTotal > 21) {
      return {
        "playerMessage":`Loser - ${bet} Money`,
        "dealerMessage":"Winner",
        "gameMessage":"You bust! Dealer wins!",
        "winState":0
      }
    }
    // If the dealer is higher than the player, the dealer wins
    else if (dealerTotal > playerTotal) {
      return {
        "playerMessage":`Loser - ${bet} Money`,
        "dealerMessage":"Winner",
        "gameMessage":"Dealer has higher total! Dealer wins!",
        "winState":0
      }
    }
    // If the player is higher than the dealer, the player wins
    else if (playerTotal > dealerTotal) {
      return {
        "playerMessage":`Winner + ${2*bet} Money`,
        "dealerMessage":"Loser",
        "gameMessage":"You have higher total! You win!",
        "winState":1
      }
    }
    // Otherwise it's a tie
    else {
      return {
        "playerMessage":`Draw + ${bet} Money`,
        "dealerMessage":"Draw",
        "gameMessage":"Both have the same total! It's a tie!",
        "winState":2
      }
    }
}

export function betCalculate(winState:number,bet:number) {
    if (winState === 1) return bet * 2
    else if (winState === 2) return bet
    return 0
}

export function dealerShouldDraw(total:number) {
    if (total < 17) return true
    else return false
}

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