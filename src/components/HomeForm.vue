<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOnlineSeniorStats } from '../services/api.js'
import { scamProofPoints } from '../data/scamAwarenessData.js'

const emit = defineEmits(['navigate'])

const scamStats = ref(null)
const animated = ref(false)
const hoveredScamType = ref(null)
const hoveredAgeGroup = ref(null)
const flippedProofCards = ref({})
const flippedVisualisationCards = ref({})

const maxReports = computed(() =>
  scamStats.value?.topScamTypes?.length
    ? Math.max(...scamStats.value.topScamTypes.map(r => Number(r.total_reports)))
    : 1
)

const seniorChartRows = computed(() => scamStats.value?.topScamTypes?.slice(0, 5) || [])

const seniorSummaryCards = computed(() => {
  const totalLost = Number(scamStats.value?.summary?.total_lost) || 0
  const totalReports = Number(scamStats.value?.summary?.total_reports) || 0

  return [
    {
      label: 'Reported losses',
      value: `$${(totalLost / 1_000_000).toFixed(1)}M+`,
      helper: 'from online scams affecting Australians 65+',
    },
    {
      label: 'Senior reports',
      value: totalReports.toLocaleString('en-AU'),
      helper: 'online scam reports in the dataset',
    },
  ]
})

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animated.value = true
  } else {
    setTimeout(() => { animated.value = true }, 150)
  }

  try {
    scamStats.value = await getOnlineSeniorStats()
  } catch (e) {
    console.error('Could not load scam stats:', e)
  }
})

const scamTypes = [
  { name: 'Investment scams',    amount: '$1.3B', pct: 100, tooltip: 'The most costly type - scammers pose as financial advisors or offer fake high-return schemes.' },
  { name: 'Remote access scams', amount: '$256M', pct: 20,  tooltip: 'Scammers pretend to be tech support and gain remote access to your computer to "fix" a problem.' },
  { name: 'Payment redirection', amount: '$224M', pct: 17,  tooltip: 'Fraudsters intercept business emails and redirect payments to their own bank accounts.' },
  { name: 'Romance scams',       amount: '$40M',  pct:  3,  tooltip: 'Scammers build fake online relationships over weeks or months, then ask for money.' },
  { name: 'Phishing',            amount: '$29M',  pct:  2,  tooltip: 'Fake emails or texts pretend to be from banks or government agencies to steal passwords and details.' },
]

const ageGroups = [
  { group: '65+',      pct: 100, tooltip: 'Australians aged 65+ face the highest risk - the largest average losses per person of any age group.' },
  { group: '55-64',    pct: 72,  tooltip: 'This age group reports significant losses, particularly from investment and phone-based scams.' },
  { group: '45-54',    pct: 54,  tooltip: 'Working-age Australians are frequently targeted by phishing and identity theft scams.' },
  { group: '35-44',    pct: 38,  tooltip: 'This group is often targeted through social media, online shopping and romance scams.' },
  { group: 'Under 35', pct: 26,  tooltip: 'Younger Australians face lower average losses but are increasingly targeted through social platforms.' },
]

function toggleProofCard(cardId) {
  flippedProofCards.value = {
    ...flippedProofCards.value,
    [cardId]: !flippedProofCards.value[cardId],
  }
}

function handleProofKeydown(event, cardId) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  toggleProofCard(cardId)
}

function goToProofPoint(cardId) {
  emit('navigate', 'awareness', `#proof-${cardId}`)
}

function toggleVisualisationCard(cardId) {
  flippedVisualisationCards.value = {
    ...flippedVisualisationCards.value,
    [cardId]: !flippedVisualisationCards.value[cardId],
  }
}

function handleVisualisationKeydown(event, cardId) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  toggleVisualisationCard(cardId)
}

function getSeniorBarWidth(value) {
  return `${((Number(value) || 0) / Math.max(maxReports.value, 1)) * 100}%`
}
</script>

<template>

  <!-- ============================================================
       HERO
       ============================================================ -->
  <section
    class="home-hero-section relative overflow-hidden"
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

    <div class="home-hero-shell relative px-8 sm:px-16 py-16 sm:py-24">
      <div class="home-hero-layout grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <!-- Left: headline + CTAs -->
        <div class="animate-fade-in-up">

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Check suspicious links, understand the fine print, and spot scams before they reach you.
          </h1>

          <p class="home-hero-copy">
            SafeCheck gives you three free, plain-English tools to check a suspicious link, understand what you are agreeing to, and build the instincts to recognise a scam.
          </p>

          <!-- Three horizontal CTA buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <button
              @click="emit('navigate', 'url-verifier')"
              class="home-hero-cta h-full flex flex-col items-center justify-start rounded-xl text-center bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white group"
            >
              <svg class="home-hero-cta-icon flex-shrink-0 text-blue-600 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="home-hero-cta-prompt">Got a suspicious link?</span>
              <span class="home-cta-label">Check it now</span>
            </button>
            <button
              @click="emit('navigate', 'tnc-simplifier')"
              class="home-hero-cta h-full flex flex-col items-center justify-start rounded-xl text-center bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white group"
            >
              <svg class="home-hero-cta-icon flex-shrink-0 text-blue-600 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="home-hero-cta-prompt">Confused by the fine print?</span>
              <span class="home-cta-label">Explain it to me</span>
            </button>
            <button
              @click="emit('navigate', 'scam-quiz')"
              class="home-hero-cta h-full flex flex-col items-center justify-start rounded-xl text-center bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white group"
            >
              <svg class="home-hero-cta-icon flex-shrink-0 text-blue-600 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span class="home-hero-cta-prompt">Could you spot a scam?</span>
              <span class="home-cta-label">Test yourself</span>
            </button>
          </div>

          <div class="home-hero-trust flex flex-col sm:flex-row flex-wrap">
            <div v-for="item in ['Free', 'No sign-up required', 'Nothing stored']" :key="item" class="home-hero-trust-item flex items-center">
              <svg class="home-hero-trust-icon text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="home-hero-trust-text">{{ item }}</span>
            </div>
          </div>
        </div>

        <!-- Right: senior lady illustration -->
        <div class="hero-visual-column hidden lg:flex justify-center items-center animate-fade-in-up stagger-2">
          <div class="relative">
            <div class="senior-shield-stage rounded-3xl flex items-center justify-center" style="background-color: rgba(255,255,255,0.08);">
              <div class="protective-bubble" aria-hidden="true">
                <span class="bubble-ripple bubble-ripple-top-left"></span>
                <span class="bubble-ripple bubble-ripple-right"></span>
                <span class="bubble-ripple bubble-ripple-bottom-left"></span>
                <span class="bubble-ripple bubble-ripple-top"></span>
                <span class="bubble-ripple bubble-ripple-upper-right"></span>
                <span class="bubble-ripple bubble-ripple-left"></span>
                <span class="bubble-ripple bubble-ripple-bottom-right"></span>
              </div>

              <div class="threat-label threat-suspicious-link" aria-hidden="true">
                <span class="threat-symbol">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9.6 14.4 8 16a3.8 3.8 0 0 1-5.4-5.4L5 8.2a3.8 3.8 0 0 1 5.4 0" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                    <path d="m14.4 9.6 1.6-1.6a3.8 3.8 0 0 1 5.4 5.4L19 15.8a3.8 3.8 0 0 1-5.4 0" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                    <path d="M17.5 15.2v2.1m0 1.9h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>Suspicious link</span>
              </div>

              <div class="threat-label threat-unknown-tnc" aria-hidden="true">
                <span class="threat-symbol">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
                    <path d="M14 3v5h4" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
                    <path d="M12 16.2v-.4c0-1.4 1.9-1.5 1.9-3a1.9 1.9 0 0 0-3.5-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M12 19h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>Unknown T&amp;Cs</span>
              </div>

              <div class="threat-label threat-phishing-email" aria-hidden="true">
                <span class="threat-symbol">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3.5" y="6" width="17" height="12" rx="2.5" stroke="currentColor" stroke-width="2"/>
                    <path d="m5 8 7 5 7-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 13v2.3m0 2h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>Phishing email</span>
              </div>

              <div class="threat-label threat-malware-popup" aria-hidden="true">
                <span class="threat-symbol">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.9"/>
                    <path d="M8 9h8M8 13h4m5 1.5 2 2m0-2-2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>Malware popup</span>
              </div>

              <div class="threat-label threat-password-request" aria-hidden="true">
                <span class="threat-symbol">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="10" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.9"/>
                    <path d="M8 10V8a4 4 0 0 1 8 0v2M12 14v2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                    <path d="M18 5v2m0 2h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>Password request</span>
              </div>

              <div class="threat-label threat-fake-prize" aria-hidden="true">
                <span class="threat-symbol">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 10h14v10H5V10Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
                    <path d="M4 7h16v3H4V7Zm8 0v13M9 7C7 7 6 5.8 6.6 4.6 7.4 3 10 4.4 12 7Zm3 0c2-2.6 4.6-4 5.4-2.4C18 5.8 17 7 15 7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>Fake prize</span>
              </div>

              <div class="blocked-badge blocked-top-left" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>Link blocked</span>
              </div>

              <div class="blocked-badge blocked-right" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>T&amp;Cs decoded</span>
              </div>

              <div class="blocked-badge blocked-bottom-left" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>Email flagged</span>
              </div>

              <div class="blocked-badge blocked-top" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>Popup stopped</span>
              </div>

              <div class="blocked-badge blocked-upper-right" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>Call screened</span>
              </div>

              <div class="blocked-badge blocked-left" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>Password safe</span>
              </div>

              <div class="blocked-badge blocked-bottom-right" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4Z" clip-rule="evenodd" />
                </svg>
                <span>Prize rejected</span>
              </div>

              <div class="bubble-sheen" aria-hidden="true">
                <svg viewBox="0 0 320 320" fill="none">
                  <path d="M92 72 Q132 38 184 48" stroke="rgba(255,255,255,0.22)" stroke-width="5" stroke-linecap="round"/>
                  <path d="M66 132 Q72 104 88 84" stroke="rgba(255,255,255,0.14)" stroke-width="4" stroke-linecap="round"/>
                </svg>
              </div>

              <div class="sr-only">
                Animated protection scene showing suspicious link, fake terms and conditions, and phishing email threats being blocked.
              </div>

              <div class="hero-illustration-layer">
                <svg viewBox="0 0 320 310" class="grandma-hero-svg" fill="none" xmlns="http://www.w3.org/2000/svg"
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
                  <path d="M197 224 Q234 237 254 260" stroke="rgba(252,198,158,0.92)" stroke-width="18" stroke-linecap="round" fill="none"/>
                  <ellipse cx="257" cy="264" rx="14" ry="11" fill="rgba(252,198,158,0.92)"/>
                  <rect x="248" y="248" width="38" height="64" rx="8" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
                  <rect x="251" y="252" width="32" height="52" rx="5" fill="rgba(255,255,255,0.09)"/>
                  <rect x="254" y="256" width="26" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
                  <rect x="256" y="263" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.18)"/>
                  <circle cx="267" cy="279" r="13" fill="rgba(74,222,128,0.28)" stroke="rgba(74,222,128,0.75)" stroke-width="1.8"/>
                  <path d="M261 279 l4 4 l9-9" stroke="rgba(74,222,128,1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="258" y="296" width="18" height="4" rx="2" fill="rgba(74,222,128,0.55)"/>
                  <path d="M123 224 Q92 239 76 268" stroke="rgba(252,198,158,0.88)" stroke-width="16" stroke-linecap="round" fill="none"/>
                  <circle cx="264" cy="80" r="26" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.55)" stroke-width="1.5"/>
                  <path d="M264 68 Q264 68 254 72 L254 82 Q254 92 264 96 Q274 92 274 82 L274 72 Z" fill="rgba(74,222,128,0.46)"/>
                  <path d="M258 82 l3.5 3.5 l8.5-8.5" stroke="rgba(74,222,128,1)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="90" cy="100" r="2.5" fill="rgba(255,255,255,0.25)"/>
                  <circle cx="78" cy="140" r="1.8" fill="rgba(255,255,255,0.18)"/>
                  <circle cx="234" cy="108" r="2" fill="rgba(255,255,255,0.2)"/>
                  <circle cx="235" cy="130" r="3" fill="rgba(74,222,128,0.22)"/>
                </svg>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       PROOF POINTS
       ============================================================ -->
  <section class="home-content-section home-proof-band px-8 sm:px-16">
    <div class="home-section-inner">
      <div class="home-section-header animate-fade-in-up">
        <p class="home-section-kicker">Scam proof points</p>
        <h2>The risk is real, so the tools stay practical.</h2>
        <p>
          These quick numbers explain why SafeCheck exists. Flip a card for the detail, then follow the source if you want to read more.
        </p>
      </div>

      <svg class="proof-visual-symbols" aria-hidden="true" focusable="false">
        <symbol id="proof-visual-total-losses" viewBox="0 0 420 230">
          <rect x="0" y="0" width="420" height="230" rx="18" class="visual-scene-bg"/>
          <circle cx="316" cy="72" r="70" class="visual-danger-glow"/>
          <rect x="58" y="48" width="154" height="122" rx="16" class="visual-paper"/>
          <path d="M188 50 l22 22 h-22z" fill="#dbeafe"/>
          <rect x="78" y="72" width="82" height="8" rx="4" fill="#1e3a8a" opacity="0.24"/>
          <rect x="78" y="98" width="104" height="8" rx="4" class="visual-muted-fill"/>
          <rect x="78" y="118" width="78" height="8" rx="4" class="visual-muted-fill"/>
          <path d="M104 152 h62" fill="none" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/>
          <circle cx="292" cy="112" r="52" fill="#fee2e2" stroke="rgba(153,27,27,0.28)" stroke-width="2"/>
          <text x="292" y="125" text-anchor="middle" fill="#991b1b" font-size="48" font-weight="900">$</text>
          <path d="M338 150 l22 22M360 150 l-22 22" stroke="#991b1b" stroke-width="8" stroke-linecap="round" opacity="0.76"/>
        </symbol>

        <symbol id="proof-visual-investment-losses" viewBox="0 0 420 230">
          <rect x="0" y="0" width="420" height="230" rx="18" class="visual-scene-bg"/>
          <circle cx="306" cy="76" r="72" class="visual-danger-glow"/>
          <rect x="70" y="54" width="280" height="126" rx="18" class="visual-paper"/>
          <rect x="96" y="82" width="86" height="10" rx="5" fill="#1e3a8a" opacity="0.24"/>
          <rect x="96" y="104" width="54" height="54" rx="10" fill="#eff6ff" stroke="rgba(30,58,138,0.22)" stroke-width="2"/>
          <text x="123" y="140" text-anchor="middle" fill="#1e3a8a" font-size="30" font-weight="900">$</text>
          <path d="M186 146 L220 116 L252 126 L300 82" fill="none" stroke="#dc2626" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M300 82 l-2 30M300 82 l-31 1" fill="none" stroke="#dc2626" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="210" y="150" width="82" height="8" rx="4" class="visual-muted-fill"/>
          <rect x="306" y="146" width="22" height="22" rx="6" fill="#fee2e2" stroke="rgba(153,27,27,0.35)" stroke-width="2"/>
          <path d="M317 151v8M317 163v1" stroke="#991b1b" stroke-width="4" stroke-linecap="round"/>
        </symbol>

        <symbol id="proof-visual-older-australians" viewBox="0 0 420 230">
          <rect x="0" y="0" width="420" height="230" rx="18" class="visual-scene-bg"/>
          <circle cx="304" cy="86" r="78" class="visual-danger-glow strong"/>
          <rect x="76" y="54" width="142" height="122" rx="18" class="visual-paper"/>
          <text x="147" y="118" text-anchor="middle" fill="#1e3a8a" font-size="48" font-weight="900">65+</text>
          <rect x="104" y="136" width="84" height="8" rx="4" class="visual-muted-fill"/>
          <rect x="118" y="154" width="56" height="8" rx="4" class="visual-muted-fill"/>
          <rect x="246" y="54" width="98" height="122" rx="18" class="visual-phone"/>
          <rect x="262" y="76" width="66" height="72" rx="9" fill="#fee2e2"/>
          <path d="M295 92 l19 33 H276 z" class="visual-warning"/>
          <path d="M295 104v12M295 122v2" class="visual-warning-mark"/>
          <path d="M284 174h22M312 174h4" class="visual-phone-button"/>
        </symbol>
      </svg>

      <div class="proof-points-grid home-card-grid grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="card in scamProofPoints"
          :key="card.id"
          role="button"
          tabindex="0"
          class="proof-flip-card"
          :class="flippedProofCards[card.id] ? 'is-card-flipped' : ''"
          :aria-label="`${card.value}: ${card.label}. Click to flip for more detail.`"
          :aria-pressed="!!flippedProofCards[card.id]"
          @click="toggleProofCard(card.id)"
          @keydown="handleProofKeydown($event, card.id)"
        >
          <div class="proof-flip-card-inner" :class="flippedProofCards[card.id] ? 'is-flipped' : ''">
            <div class="proof-flip-face proof-flip-front">
              <div class="proof-card-visual" :class="`proof-card-visual-${card.id}`" aria-hidden="true">
                <svg viewBox="0 0 420 230" role="img">
                  <use :href="`#proof-visual-${card.id}`" />
                </svg>
              </div>

              <div class="proof-front-copy">
                <p class="proof-card-value">{{ card.value }}</p>
                <p class="proof-card-label">{{ card.label }}</p>
                <p class="proof-card-flip-hint">Click to flip</p>
              </div>
            </div>

            <div class="proof-flip-face proof-flip-back">
              <div class="proof-card-visual proof-card-visual-back" :class="`proof-card-visual-${card.id}`" aria-hidden="true">
                <svg viewBox="0 0 420 230" role="img">
                  <use :href="`#proof-visual-${card.id}`" />
                </svg>
              </div>

              <div class="proof-back-copy">
                <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">{{ card.source }}</p>
                <h3 class="text-xl font-bold text-slate-900 leading-snug mb-2">{{ card.detailTitle }}</h3>
                <p class="text-base text-slate-700 leading-relaxed">{{ card.detail }}</p>
                <button
                  type="button"
                  class="readable-cta-pill mt-4 inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900"
                  @click.stop="goToProofPoint(card.id)"
                >
                  Know more
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       VISUALISATIONS
       ============================================================ -->
  <section class="home-content-section home-visualisation-band px-8 sm:px-16">
    <div class="home-section-inner">
      <div class="home-section-header animate-fade-in-up">
        <p class="home-section-kicker">Scam visualisations</p>
        <h2>See the patterns behind the scam risk.</h2>
        <p>
          The numbers behind why SafeCheck exists.
        </p>
      </div>

      <div class="visualisation-card-grid home-card-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div
        role="button"
        tabindex="0"
        class="visualisation-flip-card animate-fade-in-up"
        :class="flippedVisualisationCards.losses ? 'is-card-flipped' : ''"
        aria-label="Top scam types by financial loss. Click to flip and see the chart."
        :aria-pressed="!!flippedVisualisationCards.losses"
        @click="toggleVisualisationCard('losses')"
        @keydown="handleVisualisationKeydown($event, 'losses')"
      >
        <div class="visualisation-flip-card-inner" :class="flippedVisualisationCards.losses ? 'is-flipped' : ''">
          <div class="visualisation-flip-face visualisation-flip-front">
            <div class="visualisation-card-visual visualisation-card-visual-losses" aria-hidden="true">
              <svg viewBox="0 0 420 230" role="img">
                <rect x="0" y="0" width="420" height="230" rx="18" class="visual-scene-bg"/>
                <circle cx="318" cy="70" r="74" class="visual-danger-glow"/>
                <rect x="58" y="48" width="304" height="132" rx="18" class="visual-paper"/>
                <rect x="86" y="138" width="44" height="18" rx="6" fill="#1e3a8a" opacity="0.34"/>
                <rect x="146" y="108" width="44" height="48" rx="6" fill="#1e3a8a" opacity="0.5"/>
                <rect x="206" y="82" width="44" height="74" rx="6" fill="#1e3a8a" opacity="0.72"/>
                <rect x="266" y="60" width="44" height="96" rx="6" fill="#dc2626" opacity="0.86"/>
                <path d="M82 166h246" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" opacity="0.38"/>
                <circle cx="330" cy="150" r="18" fill="#fee2e2" stroke="rgba(153,27,27,0.38)" stroke-width="2"/>
                <text x="330" y="158" text-anchor="middle" fill="#991b1b" font-size="22" font-weight="900">$</text>
              </svg>
            </div>
            <div class="visualisation-front-copy">
              <p class="visualisation-card-kicker">ACCC Scamwatch 2023</p>
              <h3 class="visualisation-card-title">Top scam types by financial loss</h3>
              <p class="visualisation-card-description">
                Investment scams caused the largest reported losses in 2023, followed by remote access and payment redirection scams.
              </p>
              <p class="flip-card-cta-text">Click to view chart</p>
            </div>
          </div>

          <div class="visualisation-flip-face visualisation-flip-back">
            <p class="visualisation-back-heading">Financial loss by scam type</p>
            <div class="visualisation-chart-stack">
              <div v-for="(type, i) in scamTypes" :key="type.name" class="relative">
                <div class="visualisation-chart-row-label">
                  <span>{{ type.name }}</span>
                  <span class="visualisation-chart-value">{{ type.amount }}</span>
                </div>
                <div
                  class="visualisation-chart-track cursor-pointer"
                  @mouseenter="hoveredScamType = i"
                  @mouseleave="hoveredScamType = null"
                >
                  <div
                    class="visualisation-chart-fill"
                    style="transition: width 0.9s ease-out;"
                    :style="{ width: animated ? type.pct + '%' : '0%', backgroundColor: 'var(--navy)' }"
                  ></div>
                </div>
                <p v-if="hoveredScamType === i" class="visualisation-chart-tooltip animate-fade-in">
                  {{ type.tooltip }}
                </p>
              </div>
            </div>
            <p class="visualisation-source-note">Source: ACCC Scamwatch 2023 Annual Report</p>
          </div>
        </div>
      </div>

      <div
        role="button"
        tabindex="0"
        class="visualisation-flip-card animate-fade-in-up stagger-1"
        :class="flippedVisualisationCards.age ? 'is-card-flipped' : ''"
        aria-label="Age group scam risk comparison. Click to flip and see the chart."
        :aria-pressed="!!flippedVisualisationCards.age"
        @click="toggleVisualisationCard('age')"
        @keydown="handleVisualisationKeydown($event, 'age')"
      >
        <div class="visualisation-flip-card-inner" :class="flippedVisualisationCards.age ? 'is-flipped' : ''">
          <div class="visualisation-flip-face visualisation-flip-front">
            <div class="visualisation-card-visual visualisation-card-visual-age" aria-hidden="true">
              <svg viewBox="0 0 420 230" role="img">
                <rect x="0" y="0" width="420" height="230" rx="18" class="visual-scene-bg"/>
                <circle cx="306" cy="82" r="76" class="visual-danger-glow strong"/>
                <rect x="66" y="52" width="132" height="126" rx="18" class="visual-paper"/>
                <text x="132" y="122" text-anchor="middle" fill="#1e3a8a" font-size="50" font-weight="900">65+</text>
                <rect x="96" y="142" width="72" height="8" rx="4" class="visual-muted-fill"/>
                <rect x="252" y="52" width="92" height="126" rx="18" class="visual-phone"/>
                <rect x="266" y="76" width="64" height="64" rx="9" fill="#eff6ff"/>
                <path d="M284 108 l10 10 22-26" fill="none" stroke="#1e3a8a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M290 174h18M314 174h4" class="visual-phone-button"/>
                <path d="M202 114h38" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/>
                <path d="M230 98l16 16-16 16" fill="none" stroke="#dc2626" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="visualisation-front-copy">
              <p class="visualisation-card-kicker">Older Australians</p>
              <h3 class="visualisation-card-title">Why checking links matters for people over 65</h3>
              <p class="visualisation-card-description">
                Australians aged 65+ show the highest risk in this comparison, with awareness and link checking acting as practical first steps.
              </p>
              <p class="flip-card-cta-text">Click to view chart</p>
            </div>
          </div>

          <div class="visualisation-flip-face visualisation-flip-back">
            <p class="visualisation-back-heading">Relative risk by age group</p>
            <div class="visualisation-chart-stack">
              <div v-for="(age, i) in ageGroups" :key="age.group" class="grid gap-2">
                <div class="visualisation-chart-row-label">
                  <span>{{ age.group }}</span>
                  <span class="visualisation-chart-value">{{ age.pct }}%</span>
                </div>
                <div class="relative">
                  <div
                    class="visualisation-chart-track cursor-pointer overflow-hidden"
                    @mouseenter="hoveredAgeGroup = i"
                    @mouseleave="hoveredAgeGroup = null"
                  >
                    <div
                      class="visualisation-chart-fill"
                      style="transition: width 0.9s ease-out;"
                      :style="{ width: animated ? age.pct + '%' : '0%', backgroundColor: `rgba(30,58,138,${1 - i * 0.12})` }"
                    ></div>
                  </div>
                  <p v-if="hoveredAgeGroup === i" class="visualisation-chart-tooltip animate-fade-in">
                    {{ age.tooltip }}
                  </p>
                </div>
              </div>
            </div>
            <p class="visualisation-source-note">Source: ACCC Targeting Scams 2023 and Scamwatch guidance</p>
          </div>
        </div>
      </div>

      <div
        role="button"
        tabindex="0"
        class="visualisation-flip-card animate-fade-in-up stagger-2"
        :class="flippedVisualisationCards.seniors ? 'is-card-flipped' : ''"
        aria-label="Online scams affecting people over 65. Click to flip and see the chart."
        :aria-pressed="!!flippedVisualisationCards.seniors"
        @click="toggleVisualisationCard('seniors')"
        @keydown="handleVisualisationKeydown($event, 'seniors')"
      >
        <div class="visualisation-flip-card-inner" :class="flippedVisualisationCards.seniors ? 'is-flipped' : ''">
          <div class="visualisation-flip-face visualisation-flip-front">
            <div class="visualisation-card-visual visualisation-card-visual-seniors" aria-hidden="true">
              <svg viewBox="0 0 420 230" role="img">
                <rect x="0" y="0" width="420" height="230" rx="18" class="visual-scene-bg"/>
                <circle cx="318" cy="78" r="76" class="visual-danger-glow"/>
                <rect x="58" y="54" width="168" height="126" rx="18" class="visual-paper"/>
                <rect x="82" y="78" width="70" height="9" rx="4.5" fill="#1e3a8a" opacity="0.24"/>
                <rect x="82" y="106" width="108" height="12" rx="6" fill="#dc2626" opacity="0.75"/>
                <rect x="82" y="132" width="82" height="12" rx="6" fill="#1e3a8a" opacity="0.42"/>
                <rect x="82" y="158" width="124" height="12" rx="6" fill="#1e3a8a" opacity="0.58"/>
                <rect x="258" y="52" width="104" height="128" rx="18" class="visual-phone"/>
                <rect x="274" y="76" width="72" height="68" rx="10" fill="#fee2e2"/>
                <path d="M310 91 l17 30 H293 z" class="visual-warning"/>
                <path d="M310 102v11M310 118v2" class="visual-warning-mark"/>
                <path d="M298 178h22M326 178h4" class="visual-phone-button"/>
              </svg>
            </div>
            <div class="visualisation-front-copy">
              <p class="visualisation-card-kicker">Scamwatch &amp; NASC</p>
              <h3 class="visualisation-card-title">Online scams affecting people over 65</h3>
              <p class="visualisation-card-description">
                This view uses the senior online scam dataset to show reported losses, report volume, and the most reported scam types.
              </p>
              <p class="flip-card-cta-text">Click to view chart</p>
            </div>
          </div>

          <div class="visualisation-flip-face visualisation-flip-back">
            <p class="visualisation-back-heading">65+ online scam reports</p>
            <div v-if="scamStats" class="visualisation-senior-back-content">
              <div class="visualisation-summary-grid grid grid-cols-2 gap-3">
                <div
                  v-for="stat in seniorSummaryCards"
                  :key="stat.label"
                  class="visualisation-summary-tile"
                >
                  <p class="visualisation-summary-label">{{ stat.label }}</p>
                  <p class="visualisation-summary-value">{{ stat.value }}</p>
                  <p class="visualisation-summary-helper">{{ stat.helper }}</p>
                </div>
              </div>

              <div class="visualisation-senior-chart-stack">
                <div v-for="row in seniorChartRows" :key="row.scam_type" class="grid gap-2">
                  <div class="visualisation-chart-row-label">
                    <span>{{ row.scam_type }}</span>
                    <span class="visualisation-chart-value">
                      {{ Number(row.total_reports || 0).toLocaleString('en-AU') }}
                    </span>
                  </div>
                  <div class="visualisation-chart-track">
                    <div
                      class="visualisation-chart-fill transition-all duration-700"
                      style="background-color: var(--navy);"
                      :style="{ width: getSeniorBarWidth(row.total_reports) }"
                    ></div>
                  </div>
                </div>
              </div>

              <p class="visualisation-source-note">Source: Scamwatch &amp; NASC dataset, 65+ online reports.</p>
            </div>

            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div v-for="i in 2" :key="i" class="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
              <div v-for="i in 5" :key="`senior-bar-${i}`" class="grid gap-2">
                <div class="w-2/3 h-4 bg-slate-100 rounded animate-pulse"></div>
                <div class="h-3 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

  </section>

</template>

<style scoped>
.home-content-section,
.proof-flip-card,
.proof-flip-card-inner,
.proof-flip-face,
.visualisation-flip-card,
.visualisation-flip-card-inner,
.visualisation-flip-face {
  --home-section-card-height: 29rem;
}

.home-content-section {
  padding-top: 3.35rem;
  padding-bottom: 3.35rem;
}

.home-proof-band {
  background: var(--bg);
  border-top: 1px solid rgb(226, 232, 240);
}

.home-visualisation-band {
  background: #ffffff;
  border-top: 1px solid rgb(219, 234, 254);
  border-bottom: 1px solid rgb(219, 234, 254);
}

.home-visualisation-band .home-section-kicker {
  font-size: 0.92rem;
  font-weight: 950;
}

.home-visualisation-band .home-section-header h2 {
  max-width: 52rem;
  font-size: clamp(2.05rem, 3.4vw, 2.85rem);
  font-weight: 950;
}

.home-visualisation-band .home-section-header p {
  max-width: 52rem;
  font-size: clamp(1.02rem, 1.2vw, 1.16rem);
  font-weight: 500;
  line-height: 1.55;
}

.home-section-inner {
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

.home-section-header {
  max-width: 47rem;
  margin-bottom: 1.85rem;
}

.home-section-kicker {
  margin-bottom: 0.55rem;
  color: var(--navy);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.home-section-header h2 {
  margin-bottom: 0.65rem;
  color: rgb(15, 23, 42);
  font-size: clamp(1.75rem, 3vw, 2.45rem);
  line-height: 1.1;
  font-weight: 800;
}

.home-section-header p {
  color: rgb(71, 85, 105);
  font-size: 1.02rem;
  line-height: 1.6;
}

.home-hero-shell {
  padding-top: clamp(2.75rem, 4.8vw, 4rem);
  padding-bottom: clamp(2.75rem, 4.8vw, 4rem);
}

.home-hero-layout {
  gap: clamp(2.25rem, 4vw, 3.25rem);
}

.home-hero-section h1 {
  margin-bottom: 1.15rem;
  font-size: clamp(2rem, 3vw, 2.85rem);
  line-height: 1.12;
}

.home-hero-copy {
  max-width: 40rem;
  margin-bottom: 1.45rem;
  color: #ffffff;
  font-size: clamp(1.02rem, 1.25vw, 1.18rem);
  font-weight: 500;
  line-height: 1.62;
  opacity: 0.94;
}


.home-hero-cta {
  min-height: 9.6rem;
  gap: 0.55rem;
  padding: 0.95rem 0.85rem;
  border-left: 3px solid transparent;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.12);
}

.home-hero-cta:hover {
  border-left-color: #0D9488;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.16);
}

.home-hero-cta-icon {
  width: 2.1rem;
  height: 2.1rem;
  margin-bottom: 0.1rem;
}

.home-hero-cta-prompt {
  color: rgb(51, 65, 85);
  font-size: clamp(0.9rem, 0.98vw, 1rem);
  font-weight: 800;
  line-height: 1.25;
}

.home-cta-label,
.readable-cta-pill,
.flip-card-cta-text {
  background: var(--navy);
  color: #ffffff;
  border: 2px solid var(--navy-dark);
  box-shadow: 0 8px 18px rgba(23, 37, 84, 0.16);
}

.home-cta-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.95rem;
  margin-top: auto;
  padding: 0.62rem 0.78rem;
  border-radius: 0.85rem;
  font-size: clamp(0.94rem, 1.08vw, 1.08rem);
  line-height: 1.18;
  font-weight: 900;
}

@media (min-width: 768px) {
  .home-hero-cta {
    min-width: 11.5rem;
  }

  .home-cta-label {
    white-space: nowrap;
  }
}

.home-hero-trust {
  gap: 0.9rem 1.45rem;
  margin-top: 1.35rem;
}

.home-hero-trust-item {
  gap: 0.55rem;
}

.home-hero-trust-icon {
  width: 1.35rem;
  height: 1.35rem;
}

.home-hero-trust-text {
  color: #ffffff;
  font-size: clamp(0.94rem, 1.04vw, 1.06rem);
  font-weight: 750;
  line-height: 1.25;
  opacity: 0.94;
}

.readable-cta-pill {
  border-radius: 999px;
  padding: 0.62rem 0.92rem;
  font-size: 0.98rem;
  line-height: 1.2;
  font-weight: 900;
  text-decoration: none;
}

.flip-card-cta-text {
  width: fit-content;
  border-radius: 999px;
  padding: 0.64rem 0.92rem;
  font-size: 0.96rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: none;
}

@media (min-width: 640px) {
  .home-cta-label {
    font-size: clamp(0.94rem, 1.04vw, 1.06rem);
  }
}

.hero-visual-column {
  min-height: 18rem;
}

.proof-flip-card {
  min-height: var(--home-section-card-height);
  position: relative;
  perspective: 1000px;
  cursor: pointer;
  outline: none;
}

.proof-flip-card:focus-visible .proof-flip-card-inner {
  box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.28);
}

.proof-points-grid,
.visualisation-card-grid {
  position: relative;
}

.proof-points-grid {
  z-index: 2;
}

.visualisation-card-grid {
  z-index: 1;
}

.proof-flip-card.is-card-flipped,
.visualisation-flip-card.is-card-flipped {
  z-index: 10;
}

.proof-flip-card-inner {
  position: relative;
  width: 100%;
  min-height: var(--home-section-card-height);
  transform-style: preserve-3d;
  transition: transform 0.55s ease, box-shadow 0.2s ease;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.proof-flip-card:hover .proof-flip-card-inner {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

.proof-flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.proof-flip-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: var(--home-section-card-height);
  padding: 1.18rem;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 1rem;
  background: white;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.proof-flip-front {
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
  overflow: hidden;
}

.proof-flip-back {
  transform: rotateY(180deg);
  justify-content: space-between;
  gap: 0.85rem;
  overflow: hidden;
}

.proof-flip-card-inner:not(.is-flipped) .proof-flip-back,
.proof-flip-card-inner.is-flipped .proof-flip-front {
  pointer-events: none;
}

.proof-visual-symbols {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.proof-card-visual {
  width: 100%;
  aspect-ratio: 420 / 230;
  min-height: 9.6rem;
  border: 1px solid rgba(203, 213, 225, 0.72);
  border-radius: 0.85rem;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.92), rgba(239, 246, 255, 0.76)),
    #f8fafc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.proof-card-visual svg {
  display: block;
  width: 100%;
  height: 100%;
}

.proof-front-copy {
  width: 100%;
  position: relative;
  z-index: 1;
}

.proof-card-value {
  margin-bottom: 0.35rem;
  color: var(--navy);
  font-size: clamp(2.05rem, 3.1vw, 3.15rem);
  font-weight: 950;
  line-height: 0.98;
}

.proof-card-label {
  color: rgb(71, 85, 105);
  font-size: clamp(0.96rem, 1.05vw, 1.08rem);
  font-weight: 500;
  line-height: 1.35;
}

.proof-card-flip-hint {
  margin-top: 0.75rem;
  color: rgb(100, 116, 139);
  font-size: calc(0.76rem + 2px);
  font-weight: 950;
  letter-spacing: 0.08em;
  line-height: 1.25;
  text-transform: uppercase;
}

.proof-back-copy {
  width: 100%;
  position: relative;
  z-index: 1;
}

.proof-card-visual-back {
  min-height: 9rem;
}

.proof-card-visual-total-losses {
  background:
    linear-gradient(145deg, rgba(254, 242, 242, 0.94), rgba(239, 246, 255, 0.78) 58%, rgba(248, 250, 252, 0.94)),
    #f8fafc;
}

.proof-card-visual-investment-losses {
  background:
    linear-gradient(145deg, rgba(240, 249, 255, 0.96), rgba(254, 242, 242, 0.82) 62%, rgba(248, 250, 252, 0.92)),
    #f8fafc;
}

.proof-card-visual-older-australians {
  background:
    linear-gradient(145deg, rgba(239, 246, 255, 0.96), rgba(254, 242, 242, 0.9) 66%, rgba(248, 250, 252, 0.94)),
    #f8fafc;
}

.visual-scene-bg {
  fill: rgba(255, 255, 255, 0.18);
}

.visual-danger-glow {
  fill: rgba(220, 38, 38, 0.18);
}

.visual-danger-glow.strong {
  fill: rgba(220, 38, 38, 0.24);
}

.visual-paper {
  fill: rgba(255, 255, 255, 0.94);
  stroke: rgba(148, 163, 184, 0.7);
  stroke-width: 1.5;
}

.visual-warning {
  fill: #dc2626;
}

.visual-warning-mark {
  fill: none;
  stroke: #ffffff;
  stroke-width: 4;
  stroke-linecap: round;
}

.visual-muted-fill {
  fill: #64748b;
  opacity: 0.24;
}

.visual-bill {
  fill: #fee2e2;
  stroke: rgba(153, 27, 27, 0.45);
  stroke-width: 1.5;
}

.visual-money-hole {
  fill: rgba(15, 23, 42, 0.54);
}

.visual-phone {
  fill: #1e293b;
  stroke: rgba(15, 23, 42, 0.18);
  stroke-width: 1.5;
}

.visual-chart-loss {
  fill: none;
  stroke: #dc2626;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.visual-phone-button {
  fill: none;
  stroke: rgba(226, 232, 240, 0.92);
  stroke-width: 5;
  stroke-linecap: round;
}

.visual-coin {
  fill: #facc15;
  stroke: rgba(180, 83, 9, 0.6);
  stroke-width: 1.5;
}

.visual-coin.lost {
  filter: drop-shadow(0 4px 5px rgba(15, 23, 42, 0.2));
}

.visualisation-flip-card {
  min-height: var(--home-section-card-height);
  position: relative;
  perspective: 1000px;
  cursor: pointer;
  outline: none;
}

.visualisation-flip-card:focus-visible .visualisation-flip-card-inner {
  box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.28);
}

.visualisation-flip-card-inner {
  position: relative;
  width: 100%;
  min-height: var(--home-section-card-height);
  transform-style: preserve-3d;
  transition: transform 0.55s ease, box-shadow 0.2s ease;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.visualisation-flip-card:hover .visualisation-flip-card-inner {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

.visualisation-flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.visualisation-flip-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: var(--home-section-card-height);
  padding: 1.18rem;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 1rem;
  background: white;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.visualisation-flip-front {
  justify-content: space-between;
  gap: 0.85rem;
  overflow: hidden;
}

.visualisation-flip-back {
  transform: rotateY(180deg);
  justify-content: flex-start;
  overflow: hidden;
}

.visualisation-flip-card-inner:not(.is-flipped) .visualisation-flip-back,
.visualisation-flip-card-inner.is-flipped .visualisation-flip-front {
  pointer-events: none;
}

.visualisation-card-visual {
  width: 100%;
  aspect-ratio: 420 / 230;
  min-height: 9.5rem;
  border: 1px solid rgba(203, 213, 225, 0.72);
  border-radius: 0.85rem;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.92), rgba(239, 246, 255, 0.76)),
    #f8fafc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.visualisation-card-visual svg {
  display: block;
  width: 100%;
  height: 100%;
}

.visualisation-card-visual-losses {
  background:
    linear-gradient(145deg, rgba(239, 246, 255, 0.96), rgba(254, 242, 242, 0.84) 64%, rgba(248, 250, 252, 0.94)),
    #f8fafc;
}

.visualisation-card-visual-age {
  background:
    linear-gradient(145deg, rgba(239, 246, 255, 0.96), rgba(240, 249, 255, 0.88) 50%, rgba(254, 242, 242, 0.82)),
    #f8fafc;
}

.visualisation-card-visual-seniors {
  background:
    linear-gradient(145deg, rgba(248, 250, 252, 0.96), rgba(239, 246, 255, 0.86) 48%, rgba(254, 242, 242, 0.84)),
    #f8fafc;
}

.visualisation-front-copy {
  width: 100%;
}

.visualisation-card-kicker {
  margin-bottom: 0.42rem;
  color: rgb(100, 116, 139);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}

.visualisation-card-title {
  margin-bottom: 0.55rem;
  color: rgb(15, 23, 42);
  font-family: var(--font-heading);
  font-size: clamp(1.28rem, 1.45vw, 1.58rem);
  font-weight: 950;
  line-height: 1.14;
}

.visualisation-card-description {
  margin-bottom: 0.85rem;
  color: rgb(71, 85, 105);
  font-size: clamp(0.95rem, 1.04vw, 1.08rem);
  font-weight: 500;
  line-height: 1.48;
}

.visualisation-back-heading {
  margin-bottom: 0.88rem;
  color: rgb(100, 116, 139);
  font-size: 0.84rem;
  font-weight: 950;
  letter-spacing: 0.11em;
  line-height: 1.2;
  text-transform: uppercase;
}

.visualisation-chart-stack {
  display: grid;
  gap: 0.9rem;
}

.visualisation-senior-chart-stack {
  display: grid;
  gap: 0.64rem;
}

.visualisation-chart-row-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.38rem;
  color: rgb(15, 23, 42);
  font-size: 0.96rem;
  font-weight: 800;
  line-height: 1.16;
}

.visualisation-chart-value {
  flex-shrink: 0;
  color: var(--navy);
  font-size: 0.98rem;
  font-weight: 950;
}

.visualisation-chart-track {
  width: 100%;
  height: 0.66rem;
  border-radius: 999px;
  background: rgb(241, 245, 249);
  overflow: hidden;
}

.visualisation-chart-fill {
  height: 100%;
  border-radius: 999px;
}

.visualisation-chart-tooltip {
  margin-top: 0.42rem;
  color: rgb(71, 85, 105);
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.4;
}

.visualisation-source-note {
  margin-top: auto;
  padding-top: 0.75rem;
  color: rgb(100, 116, 139);
  font-size: 0.84rem;
  font-weight: 650;
  line-height: 1.35;
}

.visualisation-senior-back-content {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.visualisation-summary-grid {
  margin-bottom: 0.72rem;
}

.visualisation-senior-back-content .visualisation-senior-chart-stack {
  gap: 0.52rem;
}

.visualisation-senior-back-content .visualisation-chart-row-label {
  margin-bottom: 0.24rem;
  font-size: 0.9rem;
}

.visualisation-senior-back-content .visualisation-chart-value {
  font-size: 0.9rem;
}

.visualisation-senior-back-content .visualisation-chart-track {
  height: 0.54rem;
}

.visualisation-senior-back-content .visualisation-source-note {
  padding-top: 0.52rem;
  font-size: 0.74rem;
  line-height: 1.25;
}

.visualisation-summary-tile {
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.75rem;
  background: rgb(248, 250, 252);
  padding: 0.62rem;
}

.visualisation-summary-label {
  color: rgb(100, 116, 139);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
}

.visualisation-summary-value {
  margin-top: 0.2rem;
  color: var(--navy);
  font-size: 1.24rem;
  font-weight: 950;
  line-height: 1;
}

.visualisation-summary-helper {
  margin-top: 0.28rem;
  color: rgb(71, 85, 105);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.28;
}

.senior-shield-stage {
  position: relative;
  width: clamp(16rem, 22vw, 19rem);
  height: clamp(16rem, 22vw, 19rem);
  overflow: visible;
  isolation: isolate;
}

.senior-shield-stage::before {
  content: "";
  position: absolute;
  inset: -0.75rem;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 50% 43%, rgba(255, 255, 255, 0.16), rgba(191, 219, 254, 0.08) 62%, rgba(255, 255, 255, 0.03) 100%);
  filter: blur(12px);
  opacity: 0.78;
  z-index: 0;
  pointer-events: none;
}

.protective-bubble {
  position: absolute;
  inset: -0.75rem;
  border-radius: 9999px;
  background: rgba(219, 234, 254, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    inset 0 0 38px rgba(255, 255, 255, 0.1),
    0 0 30px rgba(147, 197, 253, 0.12);
  z-index: 1;
  pointer-events: none;
}

.protective-bubble::after {
  content: "";
  position: absolute;
  inset: 0.7rem;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.bubble-sheen,
.hero-illustration-layer,
.threat-label,
.blocked-badge {
  position: absolute;
  pointer-events: none;
}

.bubble-sheen {
  inset: -0.75rem;
  z-index: 2;
}

.bubble-sheen svg {
  width: 100%;
  height: 100%;
}

.hero-illustration-layer {
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grandma-hero-svg {
  width: min(22rem, 93%);
  height: min(22rem, 93%);
  max-width: none;
}

.bubble-ripple {
  position: absolute;
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 9999px;
  border: 1.5px solid rgba(255, 255, 255, 0.34);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.45);
  will-change: transform, opacity;
  animation: bubbleRipple 16s ease-out infinite;
}

.bubble-ripple-top-left {
  left: 2%;
  top: 25%;
}

.bubble-ripple-right {
  left: 100%;
  top: 50%;
  animation-delay: 2.2s;
}

.bubble-ripple-bottom-left {
  left: 2%;
  top: 73%;
  animation-delay: 4.4s;
}

.bubble-ripple-top {
  left: 50%;
  top: 0%;
  animation-delay: 6.6s;
}

.bubble-ripple-upper-right {
  left: 88%;
  top: 14%;
  animation-delay: 8.8s;
}

.bubble-ripple-left {
  left: 0%;
  top: 50%;
  animation-delay: 11s;
}

.bubble-ripple-bottom-right {
  left: 88%;
  top: 88%;
  animation-delay: 13.2s;
}

.threat-label {
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  width: max-content;
  min-height: 2.25rem;
  padding: 0.44rem 0.74rem;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.96);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  background: rgba(194, 65, 12, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
  opacity: 0;
  will-change: transform, opacity;
  animation-duration: 16s;
  animation-timing-function: cubic-bezier(0.34, 1.02, 0.58, 1);
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

.threat-symbol {
  width: 1.1rem;
  height: 1.1rem;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
}

.threat-symbol svg {
  width: 1.1rem;
  height: 1.1rem;
}

.threat-suspicious-link {
  left: -2.2rem;
  top: 4.1rem;
  background: rgba(194, 65, 12, 0.84);
  animation-name: suspiciousLinkApproach;
}

.threat-unknown-tnc {
  right: -3.3rem;
  top: 8.1rem;
  background: rgba(185, 28, 28, 0.8);
  animation-name: unknownTncApproach;
  animation-delay: 2.2s;
}

.threat-phishing-email {
  left: -2.2rem;
  top: 13.3rem;
  background: rgba(180, 83, 9, 0.84);
  animation-name: phishingEmailApproach;
  animation-delay: 4.4s;
}

.threat-malware-popup {
  left: 6.6rem;
  top: -2.1rem;
  background: rgba(190, 75, 12, 0.82);
  animation-name: malwarePopupApproach;
  animation-delay: 6.6s;
}

.threat-password-request {
  left: -2.7rem;
  top: 8.7rem;
  background: rgba(180, 83, 9, 0.84);
  animation-name: passwordRequestApproach;
  animation-delay: 11s;
}

.threat-fake-prize {
  right: -2.85rem;
  top: 15rem;
  background: rgba(194, 65, 12, 0.82);
  animation-name: fakePrizeApproach;
  animation-delay: 13.2s;
}

.blocked-badge {
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  width: max-content;
  padding: 0.28rem 0.52rem;
  border-radius: 9999px;
  color: #166534;
  background: rgba(240, 253, 244, 0.96);
  border: 1px solid rgba(134, 239, 172, 0.75);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1;
  opacity: 0;
  transform: translateY(4px) scale(0.94);
  will-change: transform, opacity;
  animation: blockedBadge 16s ease-out infinite;
}

.blocked-badge svg {
  width: 0.82rem;
  height: 0.82rem;
}

.blocked-top-left {
  left: -1.6rem;
  top: 4rem;
}

.blocked-right {
  right: -3.15rem;
  top: 8.1rem;
  animation-delay: 2.2s;
}

.blocked-bottom-left {
  left: -1.6rem;
  top: 13.2rem;
  animation-delay: 4.4s;
}

.blocked-top {
  left: 6.8rem;
  top: -2.15rem;
  animation-delay: 6.6s;
}

.blocked-upper-right {
  right: -3.15rem;
  top: 3.15rem;
  animation-delay: 8.8s;
}

.blocked-left {
  left: -3.8rem;
  top: 8.7rem;
  animation-delay: 11s;
}

.blocked-bottom-right {
  right: -3rem;
  top: 15rem;
  animation-delay: 13.2s;
}

@keyframes suspiciousLinkApproach {
  0%,
  5%,
  40%,
  100% {
    transform: translate(-7rem, -3.8rem) rotate(-5deg) scale(1);
    opacity: 0;
  }

  9%,
  19% {
    opacity: 0.9;
  }

  24% {
    transform: translate(0, 0) rotate(-2deg) scale(1);
  }

  27% {
    transform: translate(0.26rem, 0.18rem) rotate(-2deg) scaleX(0.9) scaleY(1.06);
  }

  31% {
    transform: translate(-1.5rem, -1rem) rotate(-4deg) scale(1.02);
    opacity: 0.88;
  }

  38% {
    transform: translate(-6.6rem, -3.2rem) rotate(-5deg) scale(1);
    opacity: 0;
  }
}

@keyframes unknownTncApproach {
  0%,
  5%,
  40%,
  100% {
    transform: translate(7.2rem, 0.1rem) rotate(4deg) scale(1);
    opacity: 0;
  }

  9%,
  19% {
    opacity: 0.9;
  }

  24% {
    transform: translate(0, 0) rotate(2deg) scale(1);
  }

  27% {
    transform: translate(-0.28rem, 0) rotate(2deg) scaleX(0.88) scaleY(1.06);
  }

  31% {
    transform: translate(1.45rem, 0) rotate(3deg) scale(1.02);
    opacity: 0.88;
  }

  38% {
    transform: translate(6.8rem, 0.1rem) rotate(4deg) scale(1);
    opacity: 0;
  }
}

@keyframes phishingEmailApproach {
  0%,
  5%,
  40%,
  100% {
    transform: translate(-7rem, 4.3rem) rotate(5deg) scale(1);
    opacity: 0;
  }

  9%,
  19% {
    opacity: 0.9;
  }

  24% {
    transform: translate(0, 0) rotate(2deg) scale(1);
  }

  27% {
    transform: translate(0.25rem, -0.22rem) rotate(2deg) scaleX(0.9) scaleY(1.06);
  }

  31% {
    transform: translate(-1.4rem, 0.9rem) rotate(4deg) scale(1.02);
    opacity: 0.88;
  }

  38% {
    transform: translate(-6.8rem, 3.7rem) rotate(5deg) scale(1);
    opacity: 0;
  }
}

@keyframes malwarePopupApproach {
  0%,
  5%,
  40%,
  100% {
    transform: translate(0, -6rem) rotate(-2deg) scale(1);
    opacity: 0;
  }

  9%,
  19% {
    opacity: 0.9;
  }

  24% {
    transform: translate(0, 0) rotate(-1deg) scale(1);
  }

  27% {
    transform: translate(0, 0.25rem) rotate(-1deg) scaleX(1.06) scaleY(0.9);
  }

  31% {
    transform: translate(0, -1.35rem) rotate(-2deg) scale(1.02);
    opacity: 0.88;
  }

  38% {
    transform: translate(0, -5.7rem) rotate(-2deg) scale(1);
    opacity: 0;
  }
}

@keyframes passwordRequestApproach {
  0%,
  5%,
  40%,
  100% {
    transform: translate(-6.8rem, 0) rotate(-3deg) scale(1);
    opacity: 0;
  }

  9%,
  19% {
    opacity: 0.9;
  }

  24% {
    transform: translate(0, 0) rotate(-1deg) scale(1);
  }

  27% {
    transform: translate(0.25rem, 0) rotate(-1deg) scaleX(0.9) scaleY(1.06);
  }

  31% {
    transform: translate(-1.35rem, 0) rotate(-3deg) scale(1.02);
    opacity: 0.88;
  }

  38% {
    transform: translate(-6.9rem, 0) rotate(-3deg) scale(1);
    opacity: 0;
  }
}

@keyframes fakePrizeApproach {
  0%,
  5%,
  40%,
  100% {
    transform: translate(6.8rem, 5.8rem) rotate(6deg) scale(1);
    opacity: 0;
  }

  9%,
  19% {
    opacity: 0.9;
  }

  24% {
    transform: translate(0, 0) rotate(3deg) scale(1);
  }

  27% {
    transform: translate(-0.25rem, -0.24rem) rotate(3deg) scaleX(0.9) scaleY(1.06);
  }

  31% {
    transform: translate(1.25rem, 1.05rem) rotate(5deg) scale(1.02);
    opacity: 0.88;
  }

  38% {
    transform: translate(6.5rem, 5.5rem) rotate(6deg) scale(1);
    opacity: 0;
  }
}

@keyframes bubbleRipple {
  0%,
  42%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.45);
  }

  27% {
    opacity: 0.46;
    transform: translate(-50%, -50%) scale(0.7);
  }

  63% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.55);
  }
}

@keyframes blockedBadge {
  0%,
  30%,
  52%,
  100% {
    opacity: 0;
    transform: translateY(4px) scale(0.94);
  }

  34%,
  43% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  49% {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .proof-flip-card-inner,
  .visualisation-flip-card-inner,
  .visualisation-chart-fill,
  .home-hero-cta,
  .home-hero-cta-icon {
    transition: none !important;
  }

  .protective-bubble,
  .senior-shield-stage::before,
  .bubble-ripple,
  .threat-label,
  .blocked-badge {
    animation: none !important;
    transition: none !important;
  }

  .protective-bubble {
    background: rgba(219, 234, 254, 0.13);
    box-shadow:
      inset 0 0 38px rgba(255, 255, 255, 0.12),
      0 0 34px rgba(147, 197, 253, 0.16);
  }

  .bubble-ripple {
    display: none;
  }

  .threat-label,
  .blocked-badge {
    display: inline-flex;
    opacity: 0.94;
    transform: none;
    will-change: auto;
  }

  .threat-suspicious-link {
    left: -5.2rem;
    top: 3rem;
    transform: rotate(-4deg);
  }

  .threat-unknown-tnc {
    right: -5.2rem;
    top: 6.5rem;
    transform: rotate(3deg);
  }

  .threat-phishing-email {
    left: -5.3rem;
    top: 14.5rem;
    transform: rotate(4deg);
  }

  .threat-malware-popup {
    left: 3.8rem;
    top: -2.2rem;
    transform: rotate(-1deg);
  }

  .threat-password-request {
    left: -5.4rem;
    top: 9.4rem;
    transform: rotate(-2deg);
  }

  .threat-fake-prize {
    right: -4.8rem;
    top: 14.4rem;
    transform: rotate(4deg);
  }

  .blocked-top-left {
    left: -3.4rem;
    top: 5.4rem;
  }

  .blocked-right {
    right: -4rem;
    top: 8.6rem;
  }

  .blocked-bottom-left {
    left: -3.2rem;
    top: 16.9rem;
  }

  .blocked-top {
    left: 9.4rem;
    top: -0.75rem;
  }

  .blocked-upper-right {
    right: -3.9rem;
    top: 4.2rem;
  }

  .blocked-left {
    left: -4rem;
    top: 11.6rem;
  }

  .blocked-bottom-right {
    right: -3.4rem;
    top: 17rem;
  }
}
</style>
