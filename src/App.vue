https://deckofcardsapi.com/

<script setup lang="ts">
  import axios from 'axios';
import { ref,watchEffect } from 'vue'
  const card = ref('')
  const deckId = ref('')

  watchEffect(() => {
    getDeck()
  })

  function getDeck() {
    axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then((response) => {
        deckId.value = response.data.deck_id
      })
      .catch((error) => {
        console.error(error)
      })
  }

  function getCard() {
    axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/?count=1`)
      .then((response) => {
        card.value = response.data.cards[0].value + ' of ' + response.data.cards[0].suit
      })
      .catch((error) => {
        console.error(error)
      })
  }
  
</script>

<template>
  <button @click="getCard">Draw a random card.</button>
  <p>Card: {{ card }}</p>
</template>

<style scoped>
</style>
