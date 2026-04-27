<script setup>
import BHeader from './components/BHeader.vue'
import BFooter from './components/BFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--bg); color: #1e293b;">
    <BHeader />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
    <BFooter />
  </div>
</template>
