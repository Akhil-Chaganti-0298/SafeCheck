<script setup>
import { ref } from 'vue'
import BHeader from './components/BHeader.vue'
import BFooter from './components/BFooter.vue'
import PasswordGate from './components/PasswordGate.vue'

const isUnlocked = ref(sessionStorage.getItem('safecheck-unlocked') === 'true')

function unlockSite() {
  sessionStorage.setItem('safecheck-unlocked', 'true')
  isUnlocked.value = true
}
</script>

<template>
  <PasswordGate v-if="!isUnlocked" @unlock="unlockSite" />
  <div v-else class="min-h-screen flex flex-col" style="background-color: var(--bg); color: #1e293b;">
    <BHeader />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
    <BFooter />
  </div>
</template>
