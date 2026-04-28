<script setup>
import { ref, computed } from 'vue'
import { checkUrl } from '../../services/api.js'
import { getWebsiteInputError } from '../../../shared/websiteValidation.js'
import UrlVerifierForm from './UrlVerifierForm.vue'
import VerdictBanner from './VerdictBanner.vue'
import TrustScoreCard from './TrustScoreCard.vue'
import ChecksList from './ChecksList.vue'

const showScoreBreakdown = ref(false)
const url = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref('')

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
  <!-- Compact navy hero band -->
  <section style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);">
    <div class="px-8 sm:px-16 py-12 sm:py-16">
      <div class="text-center max-w-2xl mx-auto animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 bg-white/15">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          Is this website safe?
        </h1>
        <p class="text-xl text-white leading-relaxed" style="opacity: 0.92;">
          Type a website address below and we will check it for common warning signs. Results in plain English.
        </p>
      </div>
    </div>
  </section>

  <!-- Main content -->
  <section class="py-10 px-8 sm:px-16" style="background-color: var(--bg);">
    <div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        <!-- Left: form -->
        <div class="lg:col-span-2">
          <UrlVerifierForm
            :url="url"
            :loading="loading"
            :error="error"
            @update:url="updateUrl"
            @submit="handleSubmit"
          />
        </div>

        <!-- Right: results or "what we check" explainer -->
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
              class="w-full text-lg font-semibold py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900"
            >
              Check another website
            </button>
          </div>

          <!-- What we check — shown when no result yet -->
          <div v-if="!result" class="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm animate-fade-in-up">
            <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">How it works</p>
            <h3 class="text-2xl font-bold text-slate-900 mb-6">What SafeCheck looks for</h3>
            <div class="space-y-5">
              <div
                v-for="(check, i) in [
                  { title: 'Domain reputation',    desc: 'Cross-references the address against known threat databases and blocklists from around the world.' },
                  { title: 'Domain age',           desc: 'New domains registered just days or weeks ago are a common hallmark of scam and phishing sites.' },
                  { title: 'HTTPS & SSL',          desc: 'Checks whether the site uses a valid, trusted security certificate for encrypted connections.' },
                  { title: 'Lookalike detection',  desc: 'Spots domain names designed to impersonate trusted brands — like your bank or a government agency.' },
                  { title: 'Content signals',      desc: 'Reviews visible page content for urgency language, suspicious patterns, and phishing indicators.' },
                ]"
                :key="check.title"
                class="flex items-start gap-4"
              >
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold text-white"
                  style="background-color: var(--navy);"
                >
                  {{ i + 1 }}
                </div>
                <div>
                  <p class="text-lg font-bold text-slate-800 mb-1">{{ check.title }}</p>
                  <p class="text-base text-slate-600 leading-relaxed">{{ check.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
