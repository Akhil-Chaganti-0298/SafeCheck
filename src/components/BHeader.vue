<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const links = [
  { label: 'Home', to: '/' },
  { label: 'URL Verifier', to: '/url-verifier' },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz', to: '/scam-quiz' },
]
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-24 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-4" @click="menuOpen = false">
        <img src="/logo.png" alt="SafeCheck logo" class="h-14 w-14 rounded-2xl object-contain" />
        <span class="text-xl font-bold tracking-wide text-slate-900">SafeCheck</span>
      </RouterLink>

      <div class="hidden items-center gap-2 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-6 py-3 text-lg font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          exact-active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-100 md:hidden"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        aria-label="Toggle navigation"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="menuOpen" id="mobile-nav" class="border-t border-slate-200 bg-white md:hidden">
      <div class="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div class="grid gap-2">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
            active-class="bg-slate-100 text-slate-900"
            exact-active-class="bg-slate-100 text-slate-900"
            @click="menuOpen = false"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>