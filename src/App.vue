<script setup>
import { ref } from 'vue'
import BHeader from './components/BHeader.vue'
import BFooter from './components/BFooter.vue'
import PasswordGate from './components/PasswordGate.vue'

const unlocked = ref(false)

function unlock() {
  unlocked.value = true
}
</script>

<template>
  <PasswordGate v-if="!unlocked" @unlock="unlock" />
  <div v-else class="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
    <BHeader />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
    <BFooter />
  </div>
</template>
