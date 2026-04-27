<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const links = [
  { label: 'Home',           to: '/'               },
  { label: 'URL Verifier',   to: '/url-verifier'   },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz',      to: '/scam-quiz'       },
]
</script>

<template>
  <!-- Full-width navy header — no max-width constraint, stretches edge to edge -->
  <header class="sticky top-0 z-50 shadow-md" style="background-color: var(--navy);">

    <nav>
      <div class="flex h-20 items-center justify-between px-6 sm:px-10 lg:px-16">

        <!-- Logo + site name -->
        <RouterLink
          to="/"
          class="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          @click="menuOpen = false"
        >
          <img src="/logo.png" alt="SafeCheck logo" class="h-12 w-12 rounded-xl object-contain bg-white/10 p-1" />
          <span class="text-2xl font-bold tracking-wide text-white">SafeCheck</span>
        </RouterLink>

        <!-- Desktop nav links -->
        <div class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-5 py-2.5 text-lg font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            :exact-active-class="'bg-white text-blue-900 hover:bg-white hover:text-blue-900'"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- Hamburger — small screens only -->
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-white/30 p-2.5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
          @click="menuOpen = !menuOpen"
        >
          <svg v-if="!menuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile dropdown — full-width, no inner constraint -->
      <div
        v-if="menuOpen"
        id="mobile-nav"
        class="border-t border-white/20 md:hidden"
        style="background-color: var(--navy-dark);"
      >
        <div class="px-6 py-3">
          <div class="grid gap-1">
            <RouterLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="rounded-lg px-4 py-4 text-xl font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              :exact-active-class="'bg-white text-blue-900'"
              @click="menuOpen = false"
            >
              {{ link.label }}
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

  </header>
</template>
