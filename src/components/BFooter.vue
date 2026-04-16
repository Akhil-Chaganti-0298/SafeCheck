<script setup>
// Footer links — kept in sync with the router so nothing goes stale
const navLinks = [
  { label: 'Home',           to: '/'               },
  { label: 'URL Verifier',   to: '/url-verifier'   },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz',      to: '/scam-quiz'       },
]

const toolLinks = [
  { label: 'URL Verifier',   to: '/url-verifier'   },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz',      to: '/scam-quiz'       },
]

// Static about blurbs — no links needed here, just reassurance for first-time visitors
const aboutItems = [
  'Free tool for Australians',
  'Guidance only — not advice',
  'No data stored or shared',
]
</script>

<template>
  <!-- Dark slate footer — sits at the very bottom of every page -->
  <footer class="bg-slate-900 text-slate-300 mt-auto">

    <!-- Four-column grid: brand · navigate · tools · about -->
    <div class="max-w-6xl mx-auto px-6 py-14">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Brand column — logo + short tagline -->
        <div class="flex flex-col gap-4">
          <RouterLink to="/" class="flex items-center gap-3">
            <img src="/logo.png" alt="SafeCheck logo" class="h-12 w-12 rounded-xl object-contain" />
            <span class="text-2xl font-bold tracking-wide text-white">SafeCheck</span>
          </RouterLink>
          <p class="text-xl leading-relaxed text-slate-400">
            Helping older Australians stay safe online. We show differences, not recommendations.
          </p>
        </div>

        <!-- Navigate column -->
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold uppercase tracking-widest text-slate-500">Navigate</h3>
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-xl text-slate-400 transition hover:text-white"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- Tools column — quick links straight to each tool -->
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold uppercase tracking-widest text-slate-500">Tools</h3>
          <RouterLink
            v-for="tool in toolLinks"
            :key="tool.to"
            :to="tool.to"
            class="text-xl text-slate-400 transition hover:text-white"
          >
            {{ tool.label }}
          </RouterLink>
        </div>

        <!-- About column — short reassurances for people wondering who we are -->
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold uppercase tracking-widest text-slate-500">About</h3>
          <span
            v-for="item in aboutItems"
            :key="item"
            class="text-xl text-slate-400"
          >
            {{ item }}
          </span>
        </div>

      </div>
    </div>

    <!-- Bottom bar — copyright + disclaimer in one line -->
    <div class="border-t border-slate-700/60">
      <div class="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-lg text-slate-500">
        <span>© 2025 SafeCheck. All rights reserved.</span>
        <span class="text-center">
          Data indicative only · Not financial or legal advice · Always verify with official sources
        </span>
      </div>
    </div>

  </footer>
</template>
