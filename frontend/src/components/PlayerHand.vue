<script setup lang="ts">
import type { Card } from '@/scripts/types';
defineProps<{
  playersHand: Card[]
  playerTotal:string
  playerMessage:string
}>()
</script>

<template>
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
            <h4>Player Total: {{ playerTotal }}</h4>
        </div>
    </div>
</template> 