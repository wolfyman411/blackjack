https://deckofcardsapi.com/

<script setup lang="ts">
  
  import speakerIcon from '@/assets/Speaker_Icon.svg'
  import speakerIconMute from '@/assets/Speaker_Icon_no.svg'


  import { ref } from 'vue'
  import { drawCards, getDeck, shuffleDeck } from './scripts/apiLogic';
  import { betCalculate, calculateTotal, canPlaceBet, checkWinState, dealerShouldDraw} from './scripts/gameLogic';
  import DealerHand from './components/DealerHand.vue';
  import PlayerHand from './components/PlayerHand.vue';
  import GameControls from './components/GameControls.vue';
  import type { Card } from './scripts/types.ts';
  import BetControls from './components/BetControls.vue';
  
  const deckId = ref('')
  const endGame = ref(true)
  const enableStart = ref(true)
  const gameMessage = ref('Start the game by pressing the "Start Game" button.')
  const dealersHand = ref<Card[]>([])
  const playersHand = ref<Card[]>([])
  const playerMessage = ref('')
  const dealerMessage = ref('')
  const cardFlipPlayer = ref<HTMLAudioElement | null>(null)
  const chipsAddPlayer = ref<HTMLAudioElement | null>(null)
  const playerMoney = ref(1000)
  const playerBet = ref(0)
  const disableBet = ref(false)
  const muteSounds = ref(false)

  async function init() {
    deckId.value = await getDeck()
  }

  init()

  async function startGame() {
    enableStart.value = false
    disableBet.value = true
    playerMessage.value = ''
    dealerMessage.value = ''
    endGame.value = false
    gameMessage.value = "Press Get Card to draw a card or Stand to end your turn."
    console.log("Starting new game...")
    // First shuffle the deck
    shuffleDeck(deckId.value)

    // Next draw two cards for the dealer and the player
    const cards = await drawCards(deckId.value, 4)
    cards[1].hidden = true
    dealersHand.value = [cards[0], cards[1]]
    playersHand.value = [cards[2], cards[3]]
    playCardFlipSound()
    console.log("Game started.")
  }

  async function getCard() {

    playCardFlipSound()

    const cards = await drawCards(deckId.value, 1)
    var newCard: Card = {
      value: cards[0].value,
      suit: cards[0].suit,
      image: cards[0].image,
      hidden: false
    }
    playersHand.value.push(newCard)

    // Check if we've busted, dealer doesn't draw
    if (calculateTotal(playersHand.value) > 21) {
      stand(false)
    }
  }

  async function stand(dealerDraw=true) {
    endGame.value = true
    console.log("Checking end status...")
    // After the player stands we check dealer logic
    var dealerTotal = calculateTotal(dealersHand.value)
    var playerTotal = calculateTotal(playersHand.value)

    // Reveal the hidden card.
    if (dealersHand.value[1]) {
      playCardFlipSound()
      dealersHand.value[1].flipping = true
      await new Promise(resolve => setTimeout(resolve, 250))
      dealersHand.value[1].hidden = false
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    // Draw until the dealer has 17 or more (don't draw if false)
    while (dealerShouldDraw(dealerTotal) && dealerDraw) {
      try {
        const cards = await drawCards(deckId.value,1)
        var newCard: Card = {
          value: cards[0].value,
          suit: cards[0].suit,
          image: cards[0].image,
          hidden: false
        }
        dealersHand.value.push(newCard)
        console.log("Dealer drew a card.")
        dealerTotal = calculateTotal(dealersHand.value)

        playCardFlipSound()

        await new Promise(resolve => setTimeout(resolve, 500)) // Wait before drawing again
      }
      catch(error) {
        console.error(error)
        return
      }
    }

    // Now check the hands
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait before drawing again
    const gameState = checkWinState(dealerTotal,playerTotal,playerBet.value)
    playerMessage.value = gameState.playerMessage
    dealerMessage.value = gameState.dealerMessage
    gameMessage.value = gameState.gameMessage
    betLogic(gameState.winState)
    disableBet.value = false
    playChipSound()
    gameMessage.value += " Press 'Start Game' to play again."
    enableStart.value = true
  }

  function betLogic(winState:number) {
    updateMoney(betCalculate(winState,playerBet.value))
    playerBet.value = 0
  }

  function playCardFlipSound() {

    if (muteSounds.value) {
      return
    }

    cardFlipPlayer.value?.play()
  }

  function playChipSound() {

    if (muteSounds.value) {
      return
    }

    if (chipsAddPlayer.value) {
      chipsAddPlayer.value.pause()
      chipsAddPlayer.value.currentTime = 0
      chipsAddPlayer.value.playbackRate = Math.random() * (1.5 - 0.9) + 0.9
      chipsAddPlayer.value.play()
    }
  }

  function updateBet(amount:number) {

    if (!canPlaceBet(playerMoney.value,playerBet.value,amount)) {
      return
    }

    playChipSound()

    updateMoney(-amount)
    playerBet.value += amount
  }

  function updateMoney(amount:number) {
    playerMoney.value += amount
  }
  
</script>

<template>
  <h1>Blackjack</h1>
  <h2 class="gameMessage">{{ gameMessage }}</h2>
  <div class="players-wrapper">
    <DealerHand :dealersHand="dealersHand" :dealerMessage="dealerMessage" :endGame="endGame"/>
    <PlayerHand :playersHand="playersHand" :playerMessage="playerMessage"/>
  </div>

  <div class="game-controls">
    <BetControls 
      :playerMoney="playerMoney" 
      :playerBet="playerBet" 
      :disableBet="disableBet" 
      :playerMessage="playerMessage" 
      @updateBet="updateBet"
      @updateMoney="updateMoney"
    />
    <GameControls 
      :enableStart="enableStart" 
      :endGame="endGame" 
      @stand="stand"
      @startGame="startGame"
      @getCard="getCard"
    />
    <div>
      <img @click="muteSounds = !muteSounds" :src="muteSounds ? speakerIconMute : speakerIcon" alt="Speaker icon" class="speaker-icon"/>
    </div>
  </div>

  <audio ref="cardFlipPlayer">
    <source src="./assets/sounds/card_flip.mp3" type="audio/mpeg">
  </audio>
  <audio ref="chipsAddPlayer">
    <source src="./assets/sounds/chips_add.mp3" type="audio/mpeg">
  </audio>
</template>
