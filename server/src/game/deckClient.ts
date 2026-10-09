interface Deck {
    id:string;
    drawPile:Card[];
    discardPile:Card[];
}

export interface Card {
  value: string;
  suit: string;
  image: string;
}

var activeDecks = new Map<string,Deck>()

// Returns the id of the deck
export function newDeck() {
    const cardSuits = ["SPADES", "CLUBS", "HEARTS", "DIAMONDS"]
    const cardValues = ["2","3","4","5","6","7","8","9","10","JACK","QUEEN","KING","ACE"]

    let newDeck:Deck = {
        id: Date.now().toString(),
        drawPile:[],
        discardPile:[]
    }

    for (let suit of cardSuits) {
        for (let value of cardValues) {
            let newCard:Card = {
                value:value,
                suit:suit,
                image:`images/cards/${value}_${suit}`
            }
            newDeck.drawPile.push(newCard)
        }
    }

    activeDecks.set(newDeck.id,newDeck)
    shuffleDeck(newDeck.id)

    return newDeck.id
}

// Shuffles all the cards of a Deck
export function shuffleDeck(id:string) {
    // Get deck
    var deck = activeDecks.get(id)
    if (!deck) {
        return null
    }

    // Combine all cards from discard and drawpile
    var allCards = [...deck.discardPile, ...deck.drawPile]
    var shuffledCards = [...allCards]
    for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    deck.discardPile = []
    deck.drawPile = shuffledCards
}

// Draws cards from the top of the deck
export function drawCard(id:string, amount:number) {
    // Get deck
    var deck = activeDecks.get(id)
    if (!deck) {
        return null
    }

    var drawnCards:Card[] = []

    while (amount > 0) {
        if (deck.drawPile.length <= 0) {
            break
        }
        drawnCards.push(deck.drawPile[0])
        deck.discardPile.push(deck.drawPile[0])
        deck.drawPile.shift()
        amount -= 1
    }

    return drawnCards
}

// Get all cards from the current draw pile
export function getCards(id:string) {
    // Get deck
    var deck = activeDecks.get(id)
    if (!deck) {
        return null
    }

    return deck.drawPile
}