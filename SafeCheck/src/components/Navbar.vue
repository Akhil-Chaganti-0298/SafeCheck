<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const links = [
  { label: 'Link Verifier', href: '#url-verifier' },
  { label: 'T&C Simplifier', href: '#tnc-simplifier' },
  { label: 'Scam Quiz', href: '#scam-quiz' },
]
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span class="text-xl font-semibold text-gray-900">SafeCheck</span>
        </a>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-6">
          <a v-for="link in links" :key="link.href" :href="link.href"
            class="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            {{ link.label }}
          </a>
          <a href="#" class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </a>
        </div>

        <!-- Mobile hamburger -->
        <button @click="menuOpen = !menuOpen" class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="menuOpen" class="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
      <a v-for="link in links" :key="link.href" :href="link.href" @click="menuOpen = false"
        class="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors">
        {{ link.label }}
      </a>
    </div>
  </nav>
</template>
