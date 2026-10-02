import axios from 'axios';

const URL = "https://deckofcardsapi.com/api/deck"

export async function getDeck() {
    console.log("Getting new deck...")
    try {
        const response = await axios.get(`${URL}/new/shuffle/?deck_count=1`)
        return response.data.deck_id
    }
    catch (error) {
        console.error(error)
    }
}

export function shuffleDeck(id:string) {
    axios.get(`${URL}/${id}/shuffle/`)
    .catch((error) => {
        console.error(error)
    })
}

export async function drawCards(id:string,amount:number) {
    const response = await axios.get(`${URL}/${id}/draw/?count=${amount}`)
    return response.data.cards
}