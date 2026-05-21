<script setup>
import { onMounted, ref } from 'vue'

const menuOpen = ref(false)
const logoSrc = `${import.meta.env.BASE_URL}logo.png`
const fontScale = ref(1)
const minFontScale = 0.9
const maxFontScale = 1.2
const fontScaleStep = 0.05

const links = [
  { label: 'Home',           to: '/'               },
  { label: 'URL Verifier',   to: '/url-verifier'   },
  { label: 'Explain my Terms', to: '/tnc-simplifier' },
  { label: 'Scam Quiz',      to: '/scam-quiz'       },
  { label: 'Awareness',      to: '/awareness'       },
]

function applyFontScale(value) {
  const nextScale = Math.min(maxFontScale, Math.max(minFontScale, Number(value.toFixed(2))))
  fontScale.value = nextScale
  document.documentElement.style.setProperty('--font-scale', String(nextScale))
  localStorage.setItem('safecheck-font-scale', String(nextScale))
}

function changeFontScale(direction) {
  applyFontScale(fontScale.value + direction * fontScaleStep)
}

onMounted(() => {
  const savedScaleValue = localStorage.getItem('safecheck-font-scale')
  const savedScale = Number(savedScaleValue)

  if (savedScaleValue !== null && Number.isFinite(savedScale)) {
    applyFontScale(savedScale)
  }
})
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

        <div class="site-header-actions flex items-center">
          <div
            class="site-font-controls inline-flex items-center rounded-xl border border-white/25 bg-white/10 p-1"
            role="group"
            aria-label="Text size controls"
          >
            <button
              type="button"
              class="site-font-button rounded-lg text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="fontScale <= minFontScale"
              aria-label="Decrease text size"
              title="Decrease text size"
              @click="changeFontScale(-1)"
            >
              A-
            </button>
            <span class="site-font-label text-blue-50" title="Text Size">
              Text Size
            </span>
            <button
              type="button"
              class="site-font-button site-font-button-large rounded-lg text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="fontScale >= maxFontScale"
              aria-label="Increase text size"
              title="Increase text size"
              @click="changeFontScale(1)"
            >
              A+
            </button>
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
  min-height: 5.25rem;
}

.site-brand {
  gap: 0.75rem;
}

.site-brand-logo {
  width: 3rem;
  height: 3rem;
}

.site-brand-name {
  font-family: var(--font-heading);
  font-size: clamp(1.38rem, 1.55vw, 1.65rem);
  font-weight: 900;
  line-height: 1.1;
}

.site-nav-links {
  gap: 0.35rem;
}

.site-nav-link {
  font-family: var(--font-heading);
  min-height: 3rem;
  padding: 0.82rem 1.08rem;
  font-size: clamp(0.98rem, 1vw, 1.08rem);
  font-weight: 800;
  line-height: 1.15;
}

.site-menu-button {
  padding: 0.8rem;
}

.site-header-actions {
  gap: 0.6rem;
}

.site-font-button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0.45rem 0.58rem;
  font-family: var(--font-heading);
  font-size: 0.98rem;
  font-weight: 900;
  line-height: 1;
}

.site-font-label {
  padding: 0.45rem 0.52rem;
  border-inline: 1px solid rgba(255, 255, 255, 0.18);
  font-family: var(--font-heading);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
}

.site-font-button-large {
  font-size: 1.14rem;
}

.site-mobile-nav-link {
  font-family: var(--font-heading);
  padding: 0.95rem 0.85rem;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.2;
}

@media (max-width: 440px) {
  .site-brand-name {
    display: none;
  }
}

@media (min-width: 1024px) {
  .site-header-inner {
    min-height: 5.45rem;
  }

  .site-nav-link {
    padding-inline: 1.18rem;
  }
}
</style>
