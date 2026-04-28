<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOnlineSeniorStats } from '../services/api.js'
import ScamStatsPanel from './verifier/ScamStatsPanel.vue'

const emit = defineEmits(['navigate'])

const scamStats = ref(null)
const animated = ref(false)
const hoveredScamType = ref(null)
const hoveredAgeGroup = ref(null)

const maxReports = computed(() =>
  scamStats.value?.topScamTypes?.length
    ? Math.max(...scamStats.value.topScamTypes.map(r => Number(r.total_reports)))
    : 1
)

onMounted(async () => {
  setTimeout(() => { animated.value = true }, 150)
  try {
    scamStats.value = await getOnlineSeniorStats()
  } catch (e) {
    console.error('Could not load scam stats:', e)
  }
})

const scamTypes = [
  { name: 'Investment scams',    amount: '$1.3B', pct: 100, tooltip: 'The most costly type — scammers pose as financial advisors or offer fake high-return schemes.' },
  { name: 'Remote access scams', amount: '$256M', pct: 20,  tooltip: 'Scammers pretend to be tech support and gain remote access to your computer to "fix" a problem.' },
  { name: 'Payment redirection', amount: '$224M', pct: 17,  tooltip: 'Fraudsters intercept business emails and redirect payments to their own bank accounts.' },
  { name: 'Romance scams',       amount: '$40M',  pct:  3,  tooltip: 'Scammers build fake online relationships over weeks or months, then ask for money.' },
  { name: 'Phishing',            amount: '$29M',  pct:  2,  tooltip: 'Fake emails or texts pretend to be from banks or government agencies to steal passwords and details.' },
]

const ageGroups = [
  { group: '65+',      pct: 100, tooltip: 'Australians aged 65+ face the highest risk — the largest average losses per person of any age group.' },
  { group: '55–64',    pct: 72,  tooltip: 'This age group reports significant losses, particularly from investment and phone-based scams.' },
  { group: '45–54',    pct: 54,  tooltip: 'Working-age Australians are frequently targeted by phishing and identity theft scams.' },
  { group: '35–44',    pct: 38,  tooltip: 'This group is often targeted through social media, online shopping and romance scams.' },
  { group: 'Under 35', pct: 26,  tooltip: 'Younger Australians face lower average losses but are increasingly targeted through social platforms.' },
]

const features = [
  {
    page: 'url-verifier',
    icon: 'link',
    title: 'Check a Link',
    desc: 'Not sure if a website is safe to visit? Paste the address and we will check it for warning signs in seconds.',
    cta: 'Check a link now',
  },
  {
    page: 'tnc-simplifier',
    icon: 'doc',
    title: 'Understand T&Cs',
    desc: 'Confused by the fine print before signing up? We translate legal language into plain English.',
    cta: 'Simplify the fine print',
  },
  {
    page: 'scam-quiz',
    icon: 'bulb',
    title: 'Scam Awareness Quiz',
    desc: 'Test yourself with real scam scenarios. Eight short questions — no tech knowledge needed.',
    cta: 'Take the quiz',
  },
]
</script>

<template>

  <!-- ============================================================
       HERO
       ============================================================ -->
  <section
    class="relative overflow-hidden"
    style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);"
  >
    <div class="absolute inset-0 opacity-5" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <div class="relative px-8 sm:px-16 py-16 sm:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <!-- Left: headline + CTAs -->
        <div class="animate-fade-in-up">

          <div class="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-base font-medium text-white">Free · No sign-up required · Nothing stored</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Stay safe online —<br/>
            <span class="text-white">simply and for free</span>
          </h1>

          <p class="text-xl text-white leading-relaxed mb-8 max-w-xl" style="opacity: 0.92;">
            SafeCheck helps you check suspicious links, understand confusing Terms &amp; Conditions,
            and learn to spot online scams — all in plain English.
          </p>

          <!-- Three identical CTA buttons -->
          <div class="flex flex-col sm:flex-row gap-4 flex-wrap">
            <button
              @click="emit('navigate', 'url-verifier')"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold bg-white text-blue-900 hover:bg-blue-50 shadow-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Check a link now
            </button>
            <button
              @click="emit('navigate', 'tnc-simplifier')"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold bg-white text-blue-900 hover:bg-blue-50 shadow-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Simplify terms &amp; conditions
            </button>
            <button
              @click="emit('navigate', 'scam-quiz')"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold bg-white text-blue-900 hover:bg-blue-50 shadow-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Take the scam quiz
            </button>
          </div>
        </div>

        <!-- Right: senior lady illustration -->
        <div class="hidden lg:flex justify-center items-center animate-fade-in-up stagger-2">
          <div class="relative">
            <div class="w-80 h-80 rounded-3xl flex items-center justify-center" style="background-color: rgba(255,255,255,0.08);">
              <svg viewBox="0 0 320 310" class="w-72 h-72" fill="none" xmlns="http://www.w3.org/2000/svg"
                aria-label="Illustration of an older Australian woman checking a link on her phone and seeing it is safe">

                <circle cx="160" cy="155" r="138" fill="rgba(255,255,255,0.04)"/>
                <path d="M90 312 Q88 245 115 228 Q138 215 160 210 Q182 215 205 228 Q232 245 230 312Z" fill="rgba(100,130,190,0.65)"/>
                <path d="M143 210 L160 205 L177 210 L170 238 L160 244 L150 238Z" fill="rgba(220,230,248,0.68)"/>
                <rect x="152" y="190" width="16" height="24" rx="7" fill="rgba(252,198,158,0.95)"/>
                <ellipse cx="160" cy="156" rx="48" ry="52" fill="rgba(252,198,158,0.95)"/>
                <path d="M112 146 Q108 102 136 86 Q160 76 184 86 Q212 102 208 146 Q198 120 160 116 Q122 120 112 146Z" fill="rgba(212,212,222,0.97)"/>
                <path d="M112 146 Q104 158 106 176 Q113 172 118 162Z" fill="rgba(212,212,222,0.94)"/>
                <path d="M208 146 Q216 158 214 176 Q207 172 202 162Z" fill="rgba(212,212,222,0.94)"/>
                <path d="M122 118 Q132 110 143 110" stroke="rgba(185,185,200,0.5)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <path d="M177 110 Q188 110 198 118" stroke="rgba(185,185,200,0.5)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <path d="M136 136 Q144 131 152 133" stroke="rgba(160,140,120,0.55)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <path d="M168 133 Q176 131 184 136" stroke="rgba(160,140,120,0.55)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <ellipse cx="144" cy="148" rx="8" ry="7" fill="rgba(88,62,44,0.9)"/>
                <ellipse cx="176" cy="148" rx="8" ry="7" fill="rgba(88,62,44,0.9)"/>
                <circle cx="145.5" cy="146" r="2.5" fill="rgba(255,255,255,0.92)"/>
                <circle cx="177.5" cy="146" r="2.5" fill="rgba(255,255,255,0.92)"/>
                <path d="M185 144 Q190 140 191 146" stroke="rgba(200,155,110,0.22)" stroke-width="1.2" fill="none"/>
                <path d="M135 144 Q130 140 129 146" stroke="rgba(200,155,110,0.22)" stroke-width="1.2" fill="none"/>
                <rect x="132" y="142" width="22" height="16" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(80,82,106,0.88)" stroke-width="2.5"/>
                <rect x="166" y="142" width="22" height="16" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(80,82,106,0.88)" stroke-width="2.5"/>
                <path d="M154 150 L166 150" stroke="rgba(80,82,106,0.88)" stroke-width="2.2"/>
                <path d="M132 150 Q122 149 120 146" stroke="rgba(80,82,106,0.85)" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M188 150 Q198 149 200 146" stroke="rgba(80,82,106,0.85)" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M157 164 Q160 170 163 164" stroke="rgba(200,145,100,0.42)" stroke-width="1.8" fill="none"/>
                <path d="M141 178 Q160 198 179 178" stroke="rgba(190,110,65,0.78)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                <circle cx="138" cy="175" r="2.5" fill="rgba(220,150,110,0.28)"/>
                <circle cx="182" cy="175" r="2.5" fill="rgba(220,150,110,0.28)"/>
                <ellipse cx="130" cy="170" rx="14" ry="9" fill="rgba(255,140,110,0.14)"/>
                <ellipse cx="190" cy="170" rx="14" ry="9" fill="rgba(255,140,110,0.14)"/>
                <path d="M205 238 Q240 248 254 264" stroke="rgba(252,198,158,0.92)" stroke-width="18" stroke-linecap="round" fill="none"/>
                <ellipse cx="257" cy="270" rx="14" ry="11" fill="rgba(252,198,158,0.92)"/>
                <rect x="246" y="254" width="38" height="64" rx="8" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
                <rect x="249" y="258" width="32" height="52" rx="5" fill="rgba(255,255,255,0.09)"/>
                <rect x="252" y="262" width="26" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
                <rect x="254" y="269" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.18)"/>
                <circle cx="265" cy="285" r="13" fill="rgba(74,222,128,0.28)" stroke="rgba(74,222,128,0.75)" stroke-width="1.8"/>
                <path d="M259 285 l4 4 l9-9" stroke="rgba(74,222,128,1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="256" y="302" width="18" height="4" rx="2" fill="rgba(74,222,128,0.55)"/>
                <path d="M115 238 Q88 250 76 268" stroke="rgba(252,198,158,0.88)" stroke-width="16" stroke-linecap="round" fill="none"/>
                <circle cx="264" cy="80" r="26" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.55)" stroke-width="1.5"/>
                <path d="M264 68 Q264 68 254 72 L254 82 Q254 92 264 96 Q274 92 274 82 L274 72 Z" fill="rgba(74,222,128,0.46)"/>
                <path d="M258 82 l3.5 3.5 l8.5-8.5" stroke="rgba(74,222,128,1)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="90" cy="100" r="2.5" fill="rgba(255,255,255,0.25)"/>
                <circle cx="78" cy="140" r="1.8" fill="rgba(255,255,255,0.18)"/>
                <circle cx="234" cy="108" r="2" fill="rgba(255,255,255,0.2)"/>
                <circle cx="235" cy="130" r="3" fill="rgba(74,222,128,0.22)"/>
              </svg>
            </div>

            <div class="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">Link checked</p>
                <p class="text-xs text-green-600 font-semibold">This site is safe ✓</p>
              </div>
            </div>

            <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: #fef3c7;">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">T&amp;C flagged</p>
                <p class="text-xs text-amber-700 font-semibold">Data sharing clause found</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       SCAM STATISTICS — combined static + live data
       (moved directly after hero so users see the stakes first)
       ============================================================ -->
  <section class="py-16 px-8 sm:px-16" style="background-color: var(--bg);">

    <div class="text-center mb-12 animate-fade-in-up">
      <h2 class="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">The scale of scams in Australia</h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        In 2023, Australians reported over $2.74 billion in losses to scams.
        Seniors aged 65+ are disproportionately targeted — knowing the numbers helps you stay alert.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- Left column: ACCC 2023 annual report — animated interactive charts -->
      <div class="space-y-6">

        <!-- Animated bar chart: top scam types by loss -->
        <div class="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm animate-fade-in-up">
          <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">ACCC Scamwatch 2023</p>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Top scam types by financial loss</h3>
          <p class="text-sm text-slate-500 mb-6">Hover over any bar to learn more</p>
          <div class="space-y-5">
            <div v-for="(type, i) in scamTypes" :key="type.name" class="relative">
              <div class="flex items-center justify-between mb-2">
                <span class="text-lg font-medium text-slate-700">{{ type.name }}</span>
                <span class="text-lg font-bold" style="color: var(--navy);">{{ type.amount }}</span>
              </div>
              <div
                class="w-full bg-slate-100 rounded-full h-4 cursor-pointer"
                @mouseenter="hoveredScamType = i"
                @mouseleave="hoveredScamType = null"
              >
                <div
                  class="h-4 rounded-full"
                  style="transition: width 0.9s ease-out;"
                  :style="{ width: animated ? type.pct + '%' : '0%', backgroundColor: 'var(--navy)' }"
                ></div>
              </div>
              <!-- Tooltip -->
              <div
                v-if="hoveredScamType === i"
                class="absolute z-20 left-0 bg-slate-900 text-white text-sm rounded-xl px-4 py-3 shadow-xl leading-relaxed animate-fade-in pointer-events-none"
                style="bottom: calc(100% + 8px); max-width: 300px; min-width: 200px;"
              >
                <p class="font-semibold mb-1">{{ type.name }} — {{ type.amount }}</p>
                <p style="opacity: 0.85;">{{ type.tooltip }}</p>
                <div class="absolute left-4 top-full w-0 h-0" style="border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #0f172a;"></div>
              </div>
            </div>
          </div>
          <p class="text-sm text-slate-400 mt-6">Source: ACCC Scamwatch 2023 Annual Report</p>
        </div>

        <!-- Animated age group vulnerability chart -->
        <div class="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm animate-fade-in-up stagger-1">
          <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">Vulnerability by age</p>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Who is most affected?</h3>
          <p class="text-sm text-slate-500 mb-6">Hover over any bar to learn more</p>
          <div class="space-y-4">
            <div v-for="(age, i) in ageGroups" :key="age.group" class="flex items-center gap-4">
              <span class="text-base font-semibold text-slate-600 w-24 flex-shrink-0">{{ age.group }}</span>
              <div class="flex-1 relative">
                <div
                  class="bg-slate-100 rounded-full h-5 cursor-pointer"
                  @mouseenter="hoveredAgeGroup = i"
                  @mouseleave="hoveredAgeGroup = null"
                >
                  <div
                    class="h-5 rounded-full"
                    style="transition: width 0.9s ease-out;"
                    :style="{ width: animated ? age.pct + '%' : '0%', backgroundColor: `rgba(30,58,138,${1 - i * 0.16})` }"
                  ></div>
                </div>
                <!-- Tooltip -->
                <div
                  v-if="hoveredAgeGroup === i"
                  class="absolute z-20 left-0 bg-slate-900 text-white text-sm rounded-xl px-4 py-3 shadow-xl leading-relaxed animate-fade-in pointer-events-none"
                  style="bottom: calc(100% + 8px); max-width: 280px; min-width: 180px;"
                >
                  <p class="font-semibold mb-1">Age {{ age.group }} — {{ age.pct }}% risk index</p>
                  <p style="opacity: 0.85;">{{ age.tooltip }}</p>
                  <div class="absolute left-4 top-full w-0 h-0" style="border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #0f172a;"></div>
                </div>
              </div>
              <span class="text-base font-bold w-12 text-right" style="color: var(--navy);">{{ age.pct }}%</span>
            </div>
          </div>
          <p class="text-sm text-slate-400 mt-5">Relative vulnerability index — 65+ face the highest risk per person</p>
        </div>
      </div>

      <!-- Right column: live data from our database -->
      <div class="animate-fade-in-up stagger-2">
        <ScamStatsPanel :scam-stats="scamStats" :max-reports="maxReports" />
      </div>

    </div>

    <!-- Why are older Australians targeted — full-width prominent callout -->
    <div
      class="mt-10 rounded-3xl overflow-hidden animate-fade-in-up"
      style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);"
    >
      <div class="px-8 sm:px-12 py-10 sm:py-14 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-3xl sm:text-4xl font-bold text-white mb-5">Why are older Australians targeted?</h3>
        <p class="text-xl sm:text-2xl text-white max-w-3xl mx-auto leading-relaxed mb-10" style="opacity: 0.9;">
          Scammers specifically target people aged 65+ because they are more likely to have accumulated savings,
          may be less familiar with digital warning signs, and can be more susceptible to unsolicited contact.
          Knowledge is the most powerful protection.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div class="bg-white/10 rounded-2xl p-6 text-center">
            <p class="text-3xl font-bold text-white mb-2">$2.74B</p>
            <p class="text-base text-blue-200 leading-relaxed">Total losses reported to Scamwatch in 2023 — a record high</p>
          </div>
          <div class="bg-white/10 rounded-2xl p-6 text-center">
            <p class="text-3xl font-bold text-white mb-2">Highest avg</p>
            <p class="text-base text-blue-200 leading-relaxed">People aged 65+ have the highest average loss per individual report</p>
          </div>
          <div class="bg-white/10 rounded-2xl p-6 text-center">
            <p class="text-3xl font-bold text-white mb-2">Awareness</p>
            <p class="text-base text-blue-200 leading-relaxed">The single most effective defence against online scams</p>
          </div>
        </div>
      </div>
    </div>

  </section>

  <!-- ============================================================
       HOW WE CAN HELP
       ============================================================ -->
  <section class="py-16 sm:py-20 px-8 sm:px-16" style="background-color: var(--bg);">
    <div class="text-center mb-12 animate-fade-in-up">
      <h2 class="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">How can we help you today?</h2>
      <p class="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Three free tools — each designed to be simple, no matter your tech experience.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <button
        v-for="(f, index) in features"
        :key="f.page"
        @click="emit('navigate', f.page)"
        class="bg-white rounded-2xl p-8 text-left border-2 border-slate-100 hover:border-blue-900 hover:shadow-xl transition-all duration-200 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900 animate-fade-in-up"
        :class="index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : 'stagger-3'"
        style="box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
      >
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-200"
          style="background-color: var(--navy-tint);"
        >
          <svg v-if="f.icon === 'link'" class="w-8 h-8" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <svg v-else-if="f.icon === 'doc'" class="w-8 h-8" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else class="w-8 h-8" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p class="text-2xl font-bold text-slate-900 mb-3 leading-snug">{{ f.title }}</p>
        <p class="text-lg text-slate-600 leading-relaxed mb-6">{{ f.desc }}</p>
        <div class="flex items-center gap-2 text-lg font-semibold group-hover:gap-3 transition-all" style="color: var(--navy);">
          {{ f.cta }}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  </section>

  <!-- ============================================================
       WHO IS THIS FOR — illustration + scenario tiles + text
       ============================================================ -->
  <section class="py-16 px-8 sm:px-16 bg-white">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      <!-- Left: secondary senior lady illustration above scenario tiles -->
      <div class="animate-fade-in-up">
        <div class="flex justify-center mb-8">
          <div class="relative inline-block">
            <div class="w-56 h-56 rounded-3xl flex items-center justify-center" style="background-color: var(--navy-tint);">
              <svg viewBox="0 0 200 210" class="w-48 h-48" fill="none" xmlns="http://www.w3.org/2000/svg"
                aria-label="Illustration of an older Australian woman safely using her phone">
                <path d="M55 215 Q53 165 72 152 Q87 143 100 140 Q113 143 128 152 Q147 165 145 215Z" fill="rgba(100,130,190,0.65)"/>
                <path d="M90 140 L100 136 L110 140 L106 158 L100 162 L94 158Z" fill="rgba(220,230,248,0.7)"/>
                <rect x="94" y="127" width="12" height="16" rx="5" fill="rgba(252,198,158,0.95)"/>
                <ellipse cx="100" cy="95" rx="36" ry="40" fill="rgba(252,198,158,0.95)"/>
                <path d="M64 88 Q62 58 84 46 Q100 38 116 46 Q138 58 136 88 Q128 68 100 65 Q72 68 64 88Z" fill="rgba(212,212,222,0.97)"/>
                <path d="M64 88 Q58 97 60 111 Q65 108 69 100Z" fill="rgba(212,212,222,0.94)"/>
                <path d="M136 88 Q142 97 140 111 Q135 108 131 100Z" fill="rgba(212,212,222,0.94)"/>
                <path d="M80 80 Q87 76 93 78" stroke="rgba(160,140,120,0.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
                <path d="M107 78 Q113 76 120 80" stroke="rgba(160,140,120,0.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
                <ellipse cx="88" cy="92" rx="6.5" ry="5.5" fill="rgba(88,62,44,0.9)"/>
                <ellipse cx="112" cy="92" rx="6.5" ry="5.5" fill="rgba(88,62,44,0.9)"/>
                <circle cx="89" cy="90" r="2" fill="rgba(255,255,255,0.92)"/>
                <circle cx="113" cy="90" r="2" fill="rgba(255,255,255,0.92)"/>
                <rect x="80" y="87" width="18" height="12" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(80,82,106,0.88)" stroke-width="2"/>
                <rect x="102" y="87" width="18" height="12" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(80,82,106,0.88)" stroke-width="2"/>
                <path d="M98 93 L102 93" stroke="rgba(80,82,106,0.88)" stroke-width="1.8"/>
                <path d="M80 93 Q73 92 71 89" stroke="rgba(80,82,106,0.85)" stroke-width="1.6" stroke-linecap="round" fill="none"/>
                <path d="M120 93 Q127 92 129 89" stroke="rgba(80,82,106,0.85)" stroke-width="1.6" stroke-linecap="round" fill="none"/>
                <path d="M87 113 Q100 128 113 113" stroke="rgba(190,110,65,0.78)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <ellipse cx="81" cy="108" rx="10" ry="6" fill="rgba(255,140,110,0.13)"/>
                <ellipse cx="119" cy="108" rx="10" ry="6" fill="rgba(255,140,110,0.13)"/>
                <path d="M128 158 Q152 166 162 178" stroke="rgba(252,198,158,0.92)" stroke-width="12" stroke-linecap="round" fill="none"/>
                <ellipse cx="164" cy="183" rx="9" ry="7" fill="rgba(252,198,158,0.92)"/>
                <rect x="158" y="172" width="24" height="40" rx="5" fill="rgba(255,255,255,0.9)" stroke="rgba(30,58,138,0.35)" stroke-width="1.5"/>
                <rect x="161" y="175" width="18" height="30" rx="3" fill="rgba(239,246,255,0.8)"/>
                <rect x="163" y="178" width="14" height="3" rx="1.5" fill="rgba(30,58,138,0.3)"/>
                <circle cx="170" cy="194" r="8" fill="rgba(74,222,128,0.28)" stroke="rgba(74,222,128,0.75)" stroke-width="1.5"/>
                <path d="M166 194 l3 3 l6-6" stroke="rgba(74,222,128,1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M72 158 Q52 167 44 180" stroke="rgba(252,198,158,0.88)" stroke-width="11" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <div class="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 border border-slate-100">
              <div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm font-bold text-slate-800">Scam detected — stay safe!</span>
            </div>
          </div>
        </div>

        <!-- Scenario tiles -->
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 rounded-2xl p-8 flex items-center gap-6" style="background-color: var(--navy-tint); border: 1px solid #bfdbfe;">
            <div class="flex-shrink-0">
              <svg viewBox="0 0 120 120" class="w-24 h-24" fill="none">
                <rect x="38" y="25" width="44" height="72" rx="7" fill="#1e3a8a" />
                <rect x="42" y="31" width="36" height="58" rx="4" fill="#e8f4fd" />
                <rect x="46" y="36" width="28" height="3" rx="1.5" fill="#1e3a8a" opacity="0.5"/>
                <rect x="46" y="42" width="24" height="3" rx="1.5" fill="#93c5fd" opacity="0.7"/>
                <rect x="46" y="48" width="28" height="3" rx="1.5" fill="#93c5fd" opacity="0.5"/>
                <circle cx="60" cy="68" r="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
                <path d="M55 68 l3 3 l7-7" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="60" cy="92" r="4" fill="#374151" opacity="0.3"/>
                <circle cx="22" cy="50" r="14" fill="#fde68a" opacity="0.9"/>
                <path d="M10 50 Q10 36 22 36 Q34 36 34 50" fill="#d1d5db"/>
                <path d="M17 54 Q22 59 27 54" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <rect x="15" y="48" width="6" height="4" rx="2" fill="none" stroke="#374151" stroke-width="1.2"/>
                <rect x="23" y="48" width="6" height="4" rx="2" fill="none" stroke="#374151" stroke-width="1.2"/>
                <path d="M21 50 L23 50" stroke="#374151" stroke-width="1.2"/>
                <path d="M30 60 Q36 65 38 72" stroke="#fde68a" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <p class="text-xl font-bold text-slate-900 mb-2">Received a suspicious link by text?</p>
              <p class="text-lg text-slate-600 leading-relaxed">Paste it into SafeCheck before you tap. Takes just a few seconds.</p>
            </div>
          </div>

          <div class="rounded-2xl p-6 flex flex-col items-center text-center" style="background-color: var(--navy-tint); border: 1px solid #bfdbfe;">
            <svg viewBox="0 0 100 80" class="w-20 h-16 mb-3" fill="none">
              <rect x="15" y="30" width="70" height="40" rx="4" fill="#1e3a8a"/>
              <rect x="19" y="34" width="62" height="32" rx="2" fill="#bfdbfe"/>
              <rect x="23" y="38" width="40" height="3" rx="1.5" fill="#1e3a8a" opacity="0.4"/>
              <rect x="23" y="44" width="30" height="3" rx="1.5" fill="#93c5fd" opacity="0.6"/>
              <rect x="10" y="70" width="80" height="6" rx="3" fill="#374151" opacity="0.5"/>
              <circle cx="50" cy="18" r="12" fill="#fde68a" opacity="0.9"/>
              <path d="M38 18 Q38 6 50 6 Q62 6 62 18" fill="#d1d5db"/>
            </svg>
            <p class="text-base font-bold text-slate-900">Confused by fine print?</p>
            <p class="text-sm text-slate-600 mt-1">We translate it for you</p>
          </div>

          <div class="rounded-2xl p-6 flex flex-col items-center text-center" style="background-color: var(--navy);">
            <div class="w-14 h-14 rounded-full mb-3 flex items-center justify-center bg-white/10">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p class="text-base font-bold text-white">Test your scam radar</p>
            <p class="text-sm text-blue-200 mt-1">8 quick questions</p>
          </div>
        </div>
      </div>

      <!-- Right: text content -->
      <div class="animate-fade-in-up stagger-2">
        <p class="text-sm font-semibold uppercase tracking-widest mb-3" style="color: var(--navy);">Designed for everyday Australians</p>
        <h2 class="text-4xl font-bold text-slate-900 mb-6 leading-tight">
          You shouldn't need to be a tech expert to stay safe online
        </h2>
        <p class="text-xl text-slate-600 leading-relaxed mb-6">
          Online scams cost Australians over 65 more than a billion dollars every year.
          SafeCheck gives you the same tools the experts use — in language everyone can understand.
        </p>
        <div class="space-y-4">
          <div v-for="point in [
            'Results in plain English — no technical jargon',
            'No account, no password, no personal details needed',
            'Works on phones, tablets, and computers',
            'Completely free — always',
          ]" :key="point" class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: var(--navy);">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-lg text-slate-700">{{ point }}</p>
          </div>
        </div>
        <button @click="emit('navigate', 'url-verifier')" class="btn-navy mt-8 text-xl px-8 py-4">
          Get started — it's free
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </section>

  <!-- ============================================================
       TRUST STATS
       ============================================================ -->
  <section class="py-12 px-8 sm:px-16 border-t border-slate-100" style="background-color: var(--bg);">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
      <div v-for="stat in [
        { value: 'Free',  label: 'Always free to use'        },
        { value: '3',     label: 'Tools in one place'        },
        { value: '0',     label: 'Personal details needed'   },
        { value: '24/7',  label: 'Available any time'        },
      ]" :key="stat.label" class="flex flex-col items-center gap-1">
        <span class="text-4xl font-bold" style="color: var(--navy);">{{ stat.value }}</span>
        <span class="text-base text-slate-600">{{ stat.label }}</span>
      </div>
    </div>
  </section>

</template>
