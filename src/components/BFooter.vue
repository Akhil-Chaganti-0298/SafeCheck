<script setup>
const navLinks = [
  { label: 'Home',           to: '/'               },
  { label: 'URL Verifier',   to: '/url-verifier'   },
  { label: 'T&C Simplifier', to: '/tnc-simplifier' },
  { label: 'Scam Quiz',      to: '/scam-quiz'       },
]

const reassurances = [
  { icon: 'free',    text: 'Free for all Australians'         },
  { icon: 'private', text: 'We do not store what you type'    },
  { icon: 'guide',   text: 'Guidance only — not legal advice' },
]
</script>

<template>
  <!-- Full-width dark navy footer with content aligned to the page rhythm -->
  <footer style="background-color: var(--navy-dark); color: #bfdbfe;">

    <div class="max-w-7xl mx-auto px-8 sm:px-16 py-14">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.75fr_1.15fr] lg:gap-16">

        <!-- Brand column -->
        <div class="flex flex-col gap-5">
          <RouterLink to="/" class="flex items-center gap-3 w-fit">
            <img src="/logo.png" alt="SafeCheck logo" class="h-12 w-12 rounded-xl object-contain bg-white/10 p-1" />
            <span class="text-2xl font-bold tracking-wide text-white">SafeCheck</span>
          </RouterLink>
          <p class="text-lg leading-relaxed text-blue-200 max-w-xs">
            Helping older Australians stay safe online — no sign-up, no data stored, no cost.
          </p>
          <div class="flex flex-col gap-3 mt-1">
            <div v-for="r in reassurances" :key="r.text" class="flex items-center gap-2">
              <svg v-if="r.icon === 'free'" class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="r.icon === 'private'" class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <svg v-else class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-lg text-blue-200">{{ r.text }}</span>
            </div>
          </div>
        </div>

        <!-- Navigate column -->
        <div class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-1">Navigate</h3>
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-lg text-blue-200 transition hover:text-white focus-visible:outline-none focus-visible:underline w-fit"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- Tools column -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-1">Our Tools</h3>
          <div v-for="tool in [
            { to: '/url-verifier',   icon: 'link', title: 'URL Verifier',   desc: 'Check if a link is safe to visit'       },
            { to: '/tnc-simplifier', icon: 'doc',  title: 'T&C Simplifier', desc: 'Plain-English summary of fine print'    },
            { to: '/scam-quiz',      icon: 'bulb', title: 'Scam Quiz',      desc: 'Learn to spot scams with real examples' },
          ]" :key="tool.to" class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/10">
              <svg v-if="tool.icon === 'link'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <svg v-else-if="tool.icon === 'doc'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <RouterLink :to="tool.to" class="text-lg font-medium text-white hover:underline focus-visible:underline">{{ tool.title }}</RouterLink>
              <p class="text-base text-blue-300 leading-snug">{{ tool.desc }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Bottom bar — also full-width -->
    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-8 sm:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-base text-blue-300">
        <span>© 2025 SafeCheck. All rights reserved.</span>
        <span class="text-center text-sm">
          Information only · Not financial or legal advice · Always verify with official sources
        </span>
      </div>
    </div>

  </footer>
</template>
