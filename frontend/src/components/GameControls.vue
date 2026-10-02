<script setup lang="ts">

    defineProps<{
        enableStart:boolean
        endGame:boolean
    }>()

    const emit = defineEmits<{
        (e: 'stand'): void
        (e: 'startGame'): void
        (e: 'getCard'): void
    }>()

    function stand() {
    emit('stand')
    }

    function startGame() {
    emit('startGame')
    }

    function getCard() {
    emit('getCard')
    }

</script>

<template>
    <div class="main-controls">
      <button @click="startGame" :disabled="!enableStart">Start Game</button>
      <button @click="getCard" :disabled="endGame">Get Card</button>
      <button @click="stand()" :disabled="endGame">Stand</button>
    </div>
</template> 