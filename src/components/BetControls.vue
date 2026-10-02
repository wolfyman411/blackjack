<script setup lang="ts">
    defineProps<{
        playerMoney: number
        playerBet: number
        disableBet:boolean
        playerMessage:string
    }>()

    const emit = defineEmits<{
        (e: 'updateBet', amount: number): void
        (e: 'updateMoney', amount: number): void
        (e: 'stand'): void
        (e: 'startGame'): void
        (e: 'getCard'): void
    }>()

    function updateBet(amount: number) {
    emit('updateBet', amount)
    }

    function updateMoney(amount: number) {
    emit('updateMoney', amount)
    }

</script>

<template>
    <div class="bet--wrapper">
        <h4>Player Money: {{playerMoney}} | Player Bet: {{playerBet}}</h4>
        <div class="bet-controls">
        <button @click="updateBet(Math.min(50,playerMoney))" :disabled="disableBet">+{{Math.min(50,playerMoney)}}</button>
        <button @click="updateBet(Math.max(-50,-playerBet))" :disabled="disableBet">-{{Math.max(-50,-playerBet)}}</button>
        <button @click="updateMoney(1000)" :disabled="disableBet" v-if="playerMessage && playerMoney === 0 && playerBet === 0">Get a Loan</button>
        </div>
    </div>
</template> 