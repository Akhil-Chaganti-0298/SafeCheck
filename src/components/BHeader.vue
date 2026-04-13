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
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </span>
        <span class="leading-tight">
          <span class="block text-xl font-bold tracking-wide text-slate-900">SafeCheck</span>
          <span class="block text-base text-slate-500">Simple online safety tools</span>
        </span>
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