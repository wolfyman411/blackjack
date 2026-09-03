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
  </div>
</template>

<style scoped>
</style>
