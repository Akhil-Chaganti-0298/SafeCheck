<script setup>
import BHeader from './components/BHeader.vue'
import BFooter from './components/BFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
    <BHeader />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
    <BFooter />
  </div>
</template>