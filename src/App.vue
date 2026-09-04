https://deckofcardsapi.com/

<script setup lang="ts">
  import axios from 'axios';
  import speakerIcon from '@/assets/Speaker_Icon.svg'
  import speakerIconMute from '@/assets/Speaker_Icon_no.svg'
  import { ref } from 'vue'
  const deckId = ref('')
  const endGame = ref(true)
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
    disableBet.value = true
    playerMessage.value = ''
    dealerMessage.value = ''
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
        playCardFlipSound()
      })
      .catch((error) => {
        console.error(error)
      })
    console.log("Game started.")
  }

  function getCard() {

    playCardFlipSound()

    axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/?count=1`)
      .then((response) => {
        var newCard: Card = {
          value: response.data.cards[0].value,
          suit: response.data.cards[0].suit,
          image: response.data.cards[0].image,
          hidden: false
        }
        playersHand.value.push(newCard)

        // Check if we've busted
        if (calculateTotal(playersHand.value) > 21) {
          stand()
        }
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

    // Reveal the hidden card.
    if (dealersHand.value[1]) {
      // Grab the HTML element for the hidden card and add the flip class to it
      const hiddenCardElement = document.querySelectorAll('.card--wrapper')[0]?.querySelectorAll('.card')[1]
      if (hiddenCardElement) {
        hiddenCardElement.classList.add('flip')
      }
      playCardFlipSound()
      await new Promise(resolve => setTimeout(resolve, 250))
      dealersHand.value[1].hidden = false
      await new Promise(resolve => setTimeout(resolve, 250))
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

    // If both are busted, it's a tie
    if (dealerTotal > 21 && playerTotal > 21) {
      playerMessage.value = `Draw + ${playerBet.value} Money`
      dealerMessage.value = "Draw"
      gameMessage.value = "Both bust! It's a tie!"
      betLogic(2)
    }
    // If the dealer busts, the player wins
    else if (dealerTotal > 21) {
      playerMessage.value = `Winner + ${2*playerBet.value} Money`
      dealerMessage.value = "Loser"
      gameMessage.value = "Dealer busts! You win!"
      betLogic(1)
    }
    // If the player busts, the dealer wins
    else if (playerTotal > 21) {
      playerMessage.value = `Loser - ${playerBet.value} Money`
      dealerMessage.value = "Winner"
      gameMessage.value = "You bust! Dealer wins!"
      betLogic(0)
    }
    // If the dealer is higher than the player, the dealer wins
    else if (dealerTotal > playerTotal) {
      playerMessage.value = `Loser - ${playerBet.value} Money`
      dealerMessage.value = "Winner"
      gameMessage.value = "Dealer has higher total! Dealer wins!"
      betLogic(0)
    }
    // If the player is higher than the dealer, the player wins
    else if (playerTotal > dealerTotal) {
      playerMessage.value = `Winner + ${2*playerBet.value} Money`
      dealerMessage.value = "Loser"
      gameMessage.value = "You have higher total! You win!"
      betLogic(1)
    }
    // Otherwise it's a tie
    else {
      playerMessage.value = `Draw + ${playerBet.value} Money`
      dealerMessage.value = "Draw"
      gameMessage.value = "Both have the same total! It's a tie!"
      betLogic(2)
    }
    disableBet.value = false
    playChipSound()
    gameMessage.value += " Press 'Start Game' to play again."
  }

  function betLogic(winState:number) {
    // Dealer wins, remove bet
    if (winState === 0) {
      playerBet.value = 0
    }
    // Player wins, add double the money of the bet
    if (winState === 1) {
      updateMoney(playerBet.value * 2)
      playerBet.value = 0
    }
    // Tie refunds money
    if (winState === 2) {
      updateMoney(playerBet.value)
      playerBet.value = 0
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

    if (playerMoney.value <= 0 && amount > 0) {
      return
    }

    playChipSound()

    if (playerBet.value > 0 && amount < 0) {
      updateMoney(-amount)
    }
    else if (amount > 0) {
      updateMoney(-amount)
    }
    playerBet.value += amount

    if (playerBet.value <= 0) {
      playerBet.value = 0
    }
  }

  function updateMoney(amount:number) {
    playerMoney.value += amount

    if (playerMoney.value <= 0) {
      playerMoney.value = 0
    }
  }
  
</script>

<template>
  <h1>Blackjack</h1>
  <h2 class="gameMessage">{{ gameMessage }}</h2>
  <div class="players-wrapper">
    <div class="player--wrapper">
      <div v-if="dealerMessage" class="result-text">
        {{ dealerMessage }}
      </div>
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
      <div v-if="playerMessage" class="result-text">
        {{ playerMessage }}
      </div>
      <div>
        <h2>The Player</h2>
        <h3>Player's Cards:</h3>
      </div>
      <div class="card--wrapper">
        <img class="card" v-for="card in playersHand" :key="card.image" :src="card.image" :alt="`${card.value} of ${card.suit}`" />
      </div>
      <div class="player-display">
        <h4>Player Total: {{ calculateTotal(playersHand) }}</h4>
      </div>
    </div>
  </div>

  <div class="game-controls">
    <div class="bet--wrapper">
      <h4>Player Money: {{playerMoney}} | Player Bet: {{playerBet}}</h4>
      <div class="bet-controls">
        <button @click="updateBet(50)" :disabled="disableBet">+50</button>
        <button @click="updateBet(-50)" :disabled="disableBet">-50</button>
        <button @click="updateMoney(1000)" :disabled="disableBet" v-if="playerMessage && playerMoney === 0 && playerBet === 0">Get a Loan</button>
      </div>
    </div>
    <div class="main-controls">
      <button @click="startGame" :disabled="!endGame">Start Game</button>
      <button @click="getCard" :disabled="endGame">Get Card</button>
      <button @click="stand" :disabled="endGame">Stand</button>
    </div>
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
    position: relative;
    overflow: hidden;
  }

  .result-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    font-weight: bold;
  }

  .player--wrapper h2 {
    background-color: rgba(0, 0, 0, 0.9);
    margin-bottom: 10px;
    border-radius: 25px;
    border: 5px solid rgb(187, 0, 0);
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 20px 10px;
    background-color: black;
    color: white;
    border: white solid 5px;
    border-radius: 10px;
    margin: 10px;
    min-width: 200px;
    cursor: pointer;
    transition: border 0.3s ease, background-color 0.3s ease, color 0.3s ease, filter 0.3s ease;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }

  button:hover {
    background-color: white;
    color: black;
    border: black solid 5px;
  }

  button:disabled {
    filter: opacity(0.5);
    cursor:default;
  }

  button:disabled:hover {
    background-color: black;
    color: white;
    border: white solid 5px;
  }

  .card--wrapper {
    display: flex;
    justify-content: center;
    height: 20vh;
    gap: 24px;
    padding: 10px;
  }

  .card {
    animation: cardIn 0.5s ease-in-out backwards;
  }

  .card.flip {
    animation: cardFlip 0.5s ease-in-out backwards;
  }

  .game-controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    text-align: center;
    padding: 10px;
    height: 10vh;
  }

  .game-controls > div:nth-child(2) {
    justify-self: center;
  }

  .game-controls > div:last-child {
    justify-self: end;
  }

  .money-display {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }

  .speaker-icon {
    filter:invert();
    height: 10vh;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .speaker-icon:hover {
    transform: scale(1.1);
  }

  .speaker-icon:active {
    transform: scale(1.0);
  }


  .bet-controls button {
    padding: 10px;
    min-width: 100px;
    margin-left: 0px;
  }

  .bet--wrapper {
    display: flex;
    align-items: start;
    justify-self: start;
    flex-direction: column;
  }

  @keyframes cardIn {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes cardFlip {
    0% {
      transform: scaleX(1);
    }
    50% {
      transform: scaleX(0);
    }
    100% {
      transform: scaleX(1);
    }
  }

  @media (max-width:1200px) {
    button {
      min-width:10vw;
      font-size: 2vw;
    }

    .game-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .game-controls > div:nth-child(2) {
      justify-self: end;
      margin-right: -10px;
    }

    .speaker-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      height: 5vh;
    }
  }

  @media (max-width:800px) {
    
    .game-controls {
      display: flex;
      flex-direction: column-reverse;
      width: 100vw;
      margin-top: 80px;
    }

    button {
      width: 100%;
    }

    .players-wrapper {
      height: 65vh;
    }

    .main-controls {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      padding-right: 10px;
    }

    .bet--wrapper {
      width: 100%;
      justify-content: center;
      align-items: center;
    }

    .bet-controls {
      display: flex;
      width: 100%;
    }

    .bet-controls button {
      margin: 10px;
    }

    .bet-controls button:nth-child(3) {
      margin-right: 16px;
    }

    .card--wrapper {
      justify-content: center;
      align-items: center;
      gap: 5px;
    }

    .card {
      height: 20vw;
      min-height: 100px;
    }

    .result-text {
      font-size: 20px;
    }

    .gameMessage {
      min-height: 10vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    @media (max-width:600px) {
      .game-controls {
        margin-top: 60px;
      }
    }

    @media (max-width:500px) {
      .game-controls {
        margin-top: 50px;
      }

      .bet-controls button {
        min-width:10vw;
        font-size: 2vw;
      }
    }
  }

</style>
