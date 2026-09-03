https://deckofcardsapi.com/

<script setup lang="ts">
  import axios from 'axios';
import { ref } from 'vue'
  const deckId = ref('')
  const endGame = ref(false)
  const gameMessage = ref('Start the game by pressing the "Start Game" button.')
  const dealersHand = ref<Card[]>([])
  const playersHand = ref<Card[]>([])

  interface Card {
    value: string;
    suit: string;
    image: string;
    hidden: boolean;
  }

  function getDeck() {
    console.log("Getting new deck...")
    axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then((response) => {
        deckId.value = response.data.deck_id
      })
      .catch((error) => {
        console.error(error)
      })
  }
  getDeck()

  function startGame() {
    endGame.value = false
    gameMessage.value = "Press Get Card to draw a card or Stand to end your turn."
    console.log("Starting new game...")
    // First shuffle the deck
    axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/shuffle/`)
      .catch((error) => {
        console.error(error)
      })

    // Next draw two cards for the dealer and the player
    axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/?count=4`)
      .then((response) => {
        const cards = response.data.cards
        cards[1].hidden = true;
        dealersHand.value = [cards[0], cards[1]]
        playersHand.value = [cards[2], cards[3]]
      })
      .catch((error) => {
        console.error(error)
      })
    console.log("Game started.")
  }

  function getCard() {
    axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/?count=1`)
      .then((response) => {
        var newCard: Card = {
          value: response.data.cards[0].value,
          suit: response.data.cards[0].suit,
          image: response.data.cards[0].image,
          hidden: false
        }
        playersHand.value.push(newCard)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  async function stand() {
    endGame.value = true
    console.log("Checking end status...")
    // After the player stands we check dealer logic
    var dealerTotal = calculateTotal(dealersHand.value)
    var playerTotal = calculateTotal(playersHand.value)
    // Reveal the dealer's hidden card
    if (dealersHand.value[1]) {
      dealersHand.value[1].hidden = false
    }

    // Draw until the dealer has 17 or more
    while (dealerTotal <= 17) {
      try {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/?count=1`)
        var newCard: Card = {
          value: response.data.cards[0].value,
          suit: response.data.cards[0].suit,
          image: response.data.cards[0].image,
          hidden: false
        }
        dealersHand.value.push(newCard)
        console.log("Dealer drew a card.")
        dealerTotal = calculateTotal(dealersHand.value)
      }
      catch(error) {
        console.error(error)
        return
      }
    }

    // Now check the hands

    // If the dealer busts, the player wins
    if (dealerTotal > 21) {
      gameMessage.value = "Dealer busts! You win!"
    }
    // If the player busts, the dealer wins
    else if (playerTotal > 21) {
      gameMessage.value = "You bust! Dealer wins!"
    }
    // If the dealer is higher than the player, the dealer wins
    else if (dealerTotal > playerTotal) {
      gameMessage.value = "Dealer wins!"
    }
    // If the player is higher than the dealer, the player wins
    else if (playerTotal > dealerTotal) {
      gameMessage.value = "You win!"
    }
    // Otherwise it's a tie
    else {
      gameMessage.value = "It's a tie!"
    }
    gameMessage.value += " Press 'Start Game' to play again."
  }

  function calculateTotal(hand: Card[]) : number {
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
  
</script>

<template>
  <h1>Blackjack</h1>
  <h2 class="gameMessage">{{ gameMessage }}</h2>
  <div class="players-wrapper">
    <div class="player--wrapper">
      <div>
        <h2>The Dealer</h2>
        <h3>Dealer's Cards:</h3>
      </div>
      <div class="card--wrapper">
        <img class="card" v-for="card in dealersHand" :key="card.image" :src="`${card.hidden ? 'https://deckofcardsapi.com/static/img/back.png' : card.image}`" :alt="`${card.value} of ${card.suit}`" />
      </div>
      <h4>
        Dealer Total: {{endGame ? calculateTotal(dealersHand) : calculateTotal(dealersHand.filter(card => !card.hidden))+" + ?" }}
      </h4>
    </div>

    <div class="player--wrapper">
      <div>
        <h2>The Player</h2>
        <h3>Player's Cards:</h3>
      </div>
      <div class="card--wrapper">
        <img class="card" v-for="card in playersHand" :key="card.image" :src="card.image" :alt="`${card.value} of ${card.suit}`" />
      </div>
      <h4>Player Total: {{ calculateTotal(playersHand) }}</h4>
    </div>
  </div>

  <div>
    <button @click="startGame">Start Game</button>
    <button @click="getCard">Get Card</button>
    <button @click="stand">Stand</button>
  </div>
</template>

<style scoped>
  h1 {
    padding: 20px;
    background-color: black;
  }

  h2 {
    padding: 10px;
  }

  .gameMessage {
    background-color: rgb(187, 0, 0);
  }

  .players-wrapper {
    display: flex;
    height: 75vh;
    flex-direction: column;
    justify-content: space-between;
  }

  .player--wrapper {
    background-color: rgba(0, 0, 0, 0.9);
    padding: 20px;
    margin: 10px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .player--wrapper h2 {
    background-color: rgba(0, 0, 0, 0.9);
    margin-bottom: 10px;
    border-radius: 25px;
    border: 5px solid rgb(187, 0, 0);
  }

  button {
    padding: 20px 10px;
    background-color: black;
    color: white;
    border: white solid 5px;
    border-radius: 10px;
    margin: 10px;
    min-width: 200px;
    cursor: pointer;
    transition: border 0.3s ease, background-color 0.3s ease, color 0.3s ease;
    font-size: 20px;
    font-weight: bold;
  }

  button:hover {
    background-color: white;
    color: black;
    border: black solid 5px;
  }

  .card--wrapper {
    display: flex;
    justify-content: center;
    height: 20vh;
    gap: 24px;
    padding: 10px;
  }
</style>
