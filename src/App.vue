https://deckofcardsapi.com/

<script setup lang="ts">
  import axios from 'axios';
import { ref } from 'vue'
  const deckId = ref('')
  const dealersHand = ref<Card[]>([])
  const playersHand = ref<Card[]>([])

  interface Card {
    value: string;
    suit: string;
    image: string;
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
          image: response.data.cards[0].image
        }
        playersHand.value.push(newCard)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  async function stand() {
    console.log("Checking end status...")
    // After the player stands we check dealer logic
    var dealerTotal = calculateTotal(dealersHand.value)
    var playerTotal = calculateTotal(playersHand.value)
    // Draw until the dealer has 17 or more
    while (dealerTotal <= 17) {
      try {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/?count=1`)
        var newCard: Card = {
          value: response.data.cards[0].value,
          suit: response.data.cards[0].suit,
          image: response.data.cards[0].image
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
      alert("Dealer busts! You win!")
    }
    // If the player busts, the dealer wins
    else if (playerTotal > 21) {
      alert("You bust! Dealer wins!")
    }
    // If the dealer is higher than the player, the dealer wins
    else if (dealerTotal > playerTotal) {
      alert("Dealer wins!")
    }
    // If the player is higher than the dealer, the player wins
    else if (playerTotal > dealerTotal) {
      alert("You win!")
    }
    // Otherwise it's a tie
    else {
      alert("It's a tie!")
    }
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
  <div>
    <h2>The Dealer</h2>
    <h3>Dealer's Cards:</h3>
    <div>
      <img v-for="card in dealersHand" :key="card.image" :src="card.image" :alt="`${card.value} of ${card.suit}`" />
    </div>
    <h4>Dealer Total: {{ calculateTotal(dealersHand) }}</h4>
  </div>

  <div>
    <h2>The Player</h2>
    <h3>Player's Cards:</h3>
    <div>
      <img v-for="card in playersHand" :key="card.image" :src="card.image" :alt="`${card.value} of ${card.suit}`" />
    </div>
    <h4>Player Total: {{ calculateTotal(playersHand) }}</h4>
  </div>

  <div>
    <button @click="startGame">Start Game</button>
    <button @click="getCard">Get Card</button>
    <button @click="stand">Stand</button>
  </div>
</template>

<style scoped>
</style>
