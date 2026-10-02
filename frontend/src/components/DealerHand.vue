<script setup lang="ts">
    import { calculateTotal} from '@/scripts/gameLogic';
    import type { Card } from '@/scripts/types';
    
    defineProps<{
        dealersHand: Card[]
        dealerMessage:string
        endGame:boolean
    }>()
</script>

<template>
    <div class="player--wrapper">
        <div v-if="dealerMessage" class="result-text">
            {{ dealerMessage }}
        </div>
        <div>
            <h2>The Dealer</h2>
            <h3>Dealer's Cards:</h3>
        </div>
        <div class="card--wrapper">
        <img
            class="card" 
            v-for="(card,index) in dealersHand" 
            :class="{ flip: card.flipping }"
            :key="card.image" 
            :src="`${card.hidden ? 'https://deckofcardsapi.com/static/img/back.png' : card.image}`" 
            :alt="`${card.value} of ${card.suit}`" 
        />
        </div>
        <h4>
            Dealer Total: {{endGame ? calculateTotal(dealersHand) : calculateTotal(dealersHand.filter(card => !card.hidden))+" + ?" }}
        </h4>
    </div>
</template>