<script setup>
import { ref } from 'vue'
import axios from 'axios'

const password = ref('')
const error = ref(false)
const loading = ref(false)
const logoSrc = `${import.meta.env.BASE_URL}logo.png`

const emit = defineEmits(['unlock'])

async function checkPassword() {
  error.value = false
  loading.value = true

  try {
    const response = await axios.post('/api/auth', { password: password.value })
    if (response.data.success) {
      emit('unlock')
    } else {
      error.value = true
      password.value = ''
    }
  } catch (err) {
    error.value = true
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full">
      <div class="flex justify-center mb-6">
        <img :src="logoSrc" alt="SafeCheck" class="h-16 w-16 rounded-xl" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 text-center mb-2">SafeCheck</h1>
      <p class="text-lg text-gray-600 text-center mb-6">Enter password to continue</p>

      <form @submit.prevent="checkPassword" class="space-y-4">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          :class="{ 'border-red-500': error }"
          :disabled="loading"
        />
        <p v-if="error" class="text-red-600 text-sm">Incorrect password</p>
        <button
          type="submit"
          class="w-full bg-green-700 text-white py-3 rounded-xl text-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Checking...' : 'Unlock' }}
        </button>
      </form>
    </div>
  </div>
</template>
