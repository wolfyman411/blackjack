<script setup lang="ts">
import type { Player } from '@/scripts/types';
import { ref, watchEffect, type Ref } from 'vue';

    const playerUsername = ref('')
    const playerPassword = ref('')
    const errorMessage = ref('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const props = defineProps<{
        player:Player|null
    }>()

    const emit = defineEmits<{
        (e: 'accountHandling', username: string, password: string): void
    }>()

    watchEffect(()=> {
        if (props.player?.id === "bad_player") {
            errorMessage.value = "Invalid password!"
        }
    })

    async function accountHandling() {

        errorMessage.value = ""
        if (playerUsername.value.length === 0 || playerPassword.value.length === 0) {
            errorMessage.value = "Please enter an email and password."
            return
        }

        if (!emailRegex.test(playerUsername.value)) {
            errorMessage.value = "Please enter a valid email."
            return
        }

        if (playerPassword.value.length < 6) {
            errorMessage.value = "Password must be at least 6 characters."
            return
        }

        emit('accountHandling',playerUsername.value,playerPassword.value)

        if (props.player?.id === "bad_player") {
            console.log(props.player)
            errorMessage.value = "Invalid password!"
            return
        }
    }

</script>

<template>
    <div :class="{ 'fade-out': player?.id !== 'bad_player' && player?.id }">
        <h1>Log In / Sign Up</h1>
        <form class="login-form">
            <h2>Email</h2>
            <input type="email" placeholder="Enter email" v-model="playerUsername" autocomplete="email">
            <h2>Password</h2>
            <input type="password" placeholder="Enter password" v-model="playerPassword" autocomplete="current-password">
            <button type="button" v-on:click="accountHandling">Log In / Sign Up</button>
            <h2 class="error">{{ errorMessage }}</h2>
        </form>
    </div>
</template>