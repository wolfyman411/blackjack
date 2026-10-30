<script setup lang="ts">
    import type { Card } from '@/scripts/types';
    
    defineProps<{
        dealersHand: Card[]
        dealerMessage:string
        dealerTotal:string
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
            Dealer Total: {{dealerTotal}}
        </h4>
    </div>
</template>