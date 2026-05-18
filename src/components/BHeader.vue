<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
const logoSrc = `${import.meta.env.BASE_URL}logo.png`

const links = [
  { label: 'Home',           to: '/'               },
  { label: 'URL Verifier',   to: '/url-verifier'   },
  { label: 'Explain my Terms', to: '/tnc-simplifier' },
  { label: 'Scam Quiz',      to: '/scam-quiz'       },
  { label: 'Awareness',      to: '/awareness'       },
]
</script>

<template>
  <!-- Full-width navy header with edge-to-edge background -->
  <header class="site-header sticky top-0 z-50 shadow-md" style="background-color: var(--navy);">

    <nav>
      <div class="site-header-inner flex items-center justify-between px-6 sm:px-10 lg:px-16">

        <!-- Logo + site name -->
        <RouterLink
          to="/"
          class="site-brand flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          @click="menuOpen = false"
        >
          <img :src="logoSrc" alt="SafeCheck logo" class="site-brand-logo rounded-xl object-contain bg-white/10 p-1" />
          <span class="site-brand-name tracking-wide text-white">SafeCheck</span>
        </RouterLink>

        <!-- Desktop nav links -->
        <div class="site-nav-links hidden items-center md:flex">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="site-nav-link rounded-lg text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            :exact-active-class="'bg-white text-blue-900 hover:bg-white hover:text-blue-900'"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- Hamburger, small screens only -->
        <button
          type="button"
          class="site-menu-button inline-flex items-center justify-center rounded-lg border border-white/30 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
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

      <!-- Mobile dropdown, full-width -->
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
              class="site-mobile-nav-link rounded-lg text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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

<style scoped>
.site-header-inner {
  min-height: 6.75rem;
}

.site-brand {
  gap: 1rem;
}

.site-brand-logo {
  width: 3.9rem;
  height: 3.9rem;
}

.site-brand-name {
  font-size: clamp(1.82rem, 2.08vw, 2.16rem);
  font-weight: 900;
  line-height: 1.1;
}

.site-nav-links {
  gap: 0.35rem;
}

.site-nav-link {
  min-height: 3.8rem;
  padding: 1.05rem 1.45rem;
  font-size: clamp(1.22rem, 1.24vw, 1.36rem);
  font-weight: 800;
  line-height: 1.15;
}

.site-menu-button {
  padding: 1rem;
}

.site-mobile-nav-link {
  padding: 1.2rem 1rem;
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.2;
}

@media (min-width: 1024px) {
  .site-header-inner {
    min-height: 7rem;
  }

  .site-nav-link {
    padding-inline: 1.6rem;
  }
}
</style>
