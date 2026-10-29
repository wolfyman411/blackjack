<script setup lang="ts">
  
  import speakerIcon from '@/assets/Speaker_Icon.svg'
  import speakerIconMute from '@/assets/Speaker_Icon_no.svg'


  import { ref } from 'vue'
  import { drawCards, getDeck, getPlayer, setupGame, shuffleDeck, standCall, updateGameState, updatePlayer } from './scripts/apiLogic';
  import { betCalculate, calculateTotal, canPlaceBet, checkWinState, dealerShouldDraw} from './scripts/gameLogic';
  import DealerHand from './components/DealerHand.vue';
  import PlayerHand from './components/PlayerHand.vue';
  import GameControls from './components/GameControls.vue';
  import type { Card, Gamestate, Player } from './scripts/types.ts';
  import BetControls from './components/BetControls.vue';
  
  const game = ref(<Gamestate|null>(null))
  const player = ref(<Player|null>(null))

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
    player.value = await getPlayer()
  }

  init()

  async function startGame() {

    if (!player.value) {
      return
    }

    enableStart.value = false
    disableBet.value = true
    playerMessage.value = ''
    dealerMessage.value = ''
    endGame.value = false
    gameMessage.value = "Press Get Card to draw a card or Stand to end your turn."
    console.log("Starting new game...")
    // First start a game
    game.value = await setupGame(player.value.id,playerBet.value)

    // Next draw two cards for the dealer and the player
    dealersHand.value = game.value.dealerHand
    playersHand.value = game.value.playerHand
    playCardFlipSound()
    console.log("Game started.")
  }

  async function getCard() {

    playCardFlipSound()

    if (!game.value) {
      return
    }


    // Player draws 1 card
    await drawCards(game.value.id)
    game.value = await updateGameState(game.value.id)

    // Check if we've busted, dealer doesn't draw
    if (calculateTotal(playersHand.value) > 21) {
      stand(false)
    }
  }

  async function stand(dealerDraw=true) {

    if (!game.value) {
      return
    }

    endGame.value = true
    console.log("Checking end status...")
    // After the player stands we check dealer logic
    standCall(game.value.id)
    game.value = await updateGameState(game.value.id)

    // Reveal the hidden card.
    if (dealersHand.value[1]) {
      playCardFlipSound()
      dealersHand.value[1].flipping = true
      await new Promise(resolve => setTimeout(resolve, 250))
      dealersHand.value[1].hidden = false
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    // Draw until the dealer has 17 or more (don't draw if false)
    // while (dealerShouldDraw(dealerTotal) && dealerDraw) {
    //   try {
    //     const cards = await drawCards(deckId.value,1)
    //     var newCard: Card = {
    //       value: cards[0].value,
    //       suit: cards[0].suit,
    //       image: cards[0].image,
    //       hidden: false
    //     }
    //     dealersHand.value.push(newCard)
    //     console.log("Dealer drew a card.")
    //     dealerTotal = calculateTotal(dealersHand.value)

    //     playCardFlipSound()

    //     await new Promise(resolve => setTimeout(resolve, 500)) // Wait before drawing again
    //   }
    //   catch(error) {
    //     console.error(error)
    //     return
    //   }
    // }

    // Now check the hands
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait before drawing again
    playerMessage.value = game.value.gameResult.playerMessage
    dealerMessage.value = game.value.gameResult.dealerMessage
    gameMessage.value = game.value.gameResult.gameMessage
    betLogic()
    disableBet.value = false
    playChipSound()
    gameMessage.value += " Press 'Start Game' to play again."
    enableStart.value = true
  }

  async function betLogic() {
    if (!player.value) return
    player.value = await updatePlayer(player.value.id)
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
