<template>
  <footer class="bg-slate-900 text-slate-300 mt-auto">
    <!-- Main footer content -->
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Brand column -->
        <div class="flex flex-col gap-4">
          <RouterLink to="/" class="flex items-center gap-3">
            <img src="/logo.png" alt="SafeCheck logo" class="h-10 w-10 rounded-xl object-contain" />
            <span class="text-lg font-bold tracking-wide text-white">SafeCheck</span>
          </RouterLink>
          <p class="text-sm leading-relaxed text-slate-400">
            Helping older Australians stay safe online. We show differences, not recommendations.
          </p>
        </div>

        <!-- Navigate column -->
        <div class="flex flex-col gap-3">
          <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-500">Navigate</h3>
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm text-slate-400 transition hover:text-white"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- Tools column -->
        <div class="flex flex-col gap-3">
          <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-500">Tools</h3>
          <RouterLink
            v-for="tool in toolLinks"
            :key="tool.to"
            :to="tool.to"
            class="text-sm text-slate-400 transition hover:text-white"
          >
            {{ tool.label }}
          </RouterLink>
        </div>

        <!-- About column -->
        <div class="flex flex-col gap-3">
          <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-500">About</h3>
          <span
            v-for="item in aboutItems"
            :key="item"
            class="text-sm text-slate-400"
          >
            {{ item }}
          </span>
        </div>

      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-slate-700/60">
      <div class="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span>© 2025 SafeCheck. All rights reserved.</span>
        <span class="text-center">
          Data indicative only · Not financial or legal advice · Always verify with official sources
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'URL Verifier', to: '/url-verifier' },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz', to: '/scam-quiz' },
]

const toolLinks = [
  { label: 'URL Verifier', to: '/url-verifier' },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz', to: '/scam-quiz' },
]

const aboutItems = [
  'Free tool for Australians',
  'Guidance only — not advice',
  'No data stored or shared',
]
</script>
