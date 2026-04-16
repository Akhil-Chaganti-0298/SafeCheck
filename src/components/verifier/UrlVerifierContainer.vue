<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkUrl, getOnlineSeniorStats } from '../../services/api.js'
import { getWebsiteInputError } from '../../../shared/websiteValidation.js'
import UrlVerifierForm from './UrlVerifierForm.vue'
import VerdictBanner from './VerdictBanner.vue'
import TrustScoreCard from './TrustScoreCard.vue'
import ChecksList from './ChecksList.vue'
import ScamStatsPanel from './ScamStatsPanel.vue'

// UI state
const showScoreBreakdown = ref(false)
const url = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref('')

// Scam stats are fetched once when the page loads — they're shown regardless of whether the user checks a URL
const scamStats = ref(null)

onMounted(async () => {
  try {
    scamStats.value = await getOnlineSeniorStats()
  } catch (e) {
    console.error('Could not load scam stats:', e)
  }
})

// Used to scale the bar chart in the stats panel — the tallest bar should always fill 100%
const maxReports = computed(() =>
  scamStats.value
    ? Math.max(...scamStats.value.topScamTypes.map(r => Number(r.total_reports)))
    : 1
)

// Colour scheme for the verdict banner — matches the green/amber/red meaning people already expect
const verdictTheme = {
  safe:    { banner: 'bg-green-50 border-green-200',  icon: 'bg-green-200',  iconColor: 'text-green-700', title: 'text-green-800', subtitle: 'text-green-700', badge: 'bg-green-200 text-green-800' },
  unsafe:  { banner: 'bg-red-50 border-red-200',      icon: 'bg-red-200',    iconColor: 'text-red-700',   title: 'text-red-800',   subtitle: 'text-red-700',   badge: 'bg-red-200 text-red-800'     },
  warning: { banner: 'bg-amber-50 border-amber-200',  icon: 'bg-amber-200',  iconColor: 'text-amber-700', title: 'text-amber-800', subtitle: 'text-amber-700', badge: 'bg-amber-200 text-amber-800' },
}

const vc = computed(() => verdictTheme[result.value?.verdict] ?? verdictTheme.safe)

function verdictText(verdict) {
  if (verdict === 'unsafe') return 'Unsafe'
  if (verdict === 'warning') return 'Be careful'
  return 'Safe'
}

async function handleSubmit() {
  // Validate the input first so the user gets a clear error message before we hit the API
  const inputError = getWebsiteInputError(url.value)
  if (inputError) {
    error.value = inputError
    return
  }

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

// Clears everything so the user can check another site
function reset() {
  url.value = ''
  result.value = null
  error.value = ''
  showScoreBreakdown.value = false
}

function updateUrl(value) {
  url.value = value
}
</script>

<template>
  <section class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Page heading — fades up on load -->
      <div class="flex justify-center mb-6 animate-fade-in-up">
        <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
      <h1 class="text-6xl font-bold text-gray-900 text-center mb-3 animate-fade-in-up stagger-1">Is this website safe?</h1>
      <p class="text-2xl text-gray-500 text-center mb-10 animate-fade-in-up stagger-2">
        Type a website address below and we will check it for common warning signs.
      </p>

      <!-- Two-column layout: form on the left, results + stats on the right -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        <!-- Left column: input form -->
        <div class="lg:col-span-2 space-y-4">
          <UrlVerifierForm
            :url="url"
            :loading="loading"
            :error="error"
            @update:url="updateUrl"
            @submit="handleSubmit"
          />
        </div>

        <!-- Right column: verdict + score + checks + scam stats -->
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

            <!-- Link to start again — sits below the result cards -->
            <button @click="reset" class="w-full text-xl text-green-700 font-medium py-2 hover:underline transition">
              Check another website
            </button>
          </div>

          <!-- Scam stats always visible — useful context even without doing a check -->
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
