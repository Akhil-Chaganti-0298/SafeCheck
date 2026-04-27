<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkUrl, getOnlineSeniorStats } from '../../services/api.js'
import { getWebsiteInputError } from '../../../shared/websiteValidation.js'
import UrlVerifierForm from './UrlVerifierForm.vue'
import VerdictBanner from './VerdictBanner.vue'
import TrustScoreCard from './TrustScoreCard.vue'
import ChecksList from './ChecksList.vue'
import ScamStatsPanel from './ScamStatsPanel.vue'

const showScoreBreakdown = ref(false)
const url = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref('')
const scamStats = ref(null)

onMounted(async () => {
  try {
    scamStats.value = await getOnlineSeniorStats()
  } catch (e) {
    console.error('Could not load scam stats:', e)
  }
})

const maxReports = computed(() =>
  scamStats.value?.topScamTypes?.length
    ? Math.max(...scamStats.value.topScamTypes.map(r => Number(r.total_reports)))
    : 1
)

// Colour-theme object passed to child components — red/amber/green for risk only
const verdictTheme = {
  safe:    { banner: 'bg-green-50 border-green-200',  icon: 'bg-green-200',  iconColor: 'text-green-700', title: 'text-green-800', subtitle: 'text-green-700', badge: 'bg-green-600 text-white' },
  unsafe:  { banner: 'bg-red-50 border-red-200',      icon: 'bg-red-200',    iconColor: 'text-red-700',   title: 'text-red-900',   subtitle: 'text-red-700',   badge: 'bg-red-600 text-white'   },
  warning: { banner: 'bg-amber-50 border-amber-200',  icon: 'bg-amber-200',  iconColor: 'text-amber-700', title: 'text-amber-900', subtitle: 'text-amber-700', badge: 'bg-amber-600 text-white' },
}

const vc = computed(() => verdictTheme[result.value?.verdict] ?? verdictTheme.safe)

function verdictText(verdict) {
  if (verdict === 'unsafe')  return 'Unsafe — do not visit'
  if (verdict === 'warning') return 'Caution'
  return 'Safe'
}

async function handleSubmit() {
  const inputError = getWebsiteInputError(url.value)
  if (inputError) { error.value = inputError; return }

  const input = url.value.trim()
  error.value = ''
  result.value = null
  loading.value = true
  try {
    const data = await checkUrl(input)
    result.value = data
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

function reset() {
  url.value = ''
  result.value = null
  error.value = ''
  showScoreBreakdown.value = false
}

function updateUrl(value) { url.value = value }
</script>

<template>
  <section class="min-h-screen py-10 px-4" style="background-color: var(--bg);">
    <div>

      <!-- Page heading -->
      <div class="text-center mb-10 animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style="background-color: var(--navy-tint);">
          <svg class="w-10 h-10" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 class="text-5xl sm:text-6xl font-bold text-slate-900 mb-3 animate-fade-in-up stagger-1">
          Is this website safe?
        </h1>
        <p class="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
          Type a website address below and we will check it for common warning signs. Results in plain English.
        </p>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        <!-- Left: form -->
        <div class="lg:col-span-2 space-y-4">
          <UrlVerifierForm
            :url="url"
            :loading="loading"
            :error="error"
            @update:url="updateUrl"
            @submit="handleSubmit"
          />
        </div>

        <!-- Right: verdict + score + checks + scam stats -->
        <div class="lg:col-span-3">
          <div v-if="result" class="space-y-4">
            <VerdictBanner
              :result="result"
              :vc="vc"
              :verdict-label="verdictText(result.verdict)"
            />
            <TrustScoreCard
              :result="result"
              :show-score-breakdown="showScoreBreakdown"
              @toggle-breakdown="showScoreBreakdown = !showScoreBreakdown"
            />
            <ChecksList :checks="result.checks" />

            <button
              @click="reset"
              class="w-full text-lg font-semibold py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              Check another website
            </button>
          </div>

          <!-- Scam stats always visible -->
          <ScamStatsPanel
            :scam-stats="scamStats"
            :max-reports="maxReports"
            :with-top-margin="Boolean(result)"
          />
        </div>

      </div>
    </div>
  </section>
</template>
