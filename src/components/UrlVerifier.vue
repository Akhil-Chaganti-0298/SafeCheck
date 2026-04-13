<script setup>
import { ref, computed } from 'vue'
import { checkUrl } from '../services/api.js'
import StatusIcon from './StatusIcon.vue'

const showScoreBreakdown = ref(false)

const url = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref('')

const verdictTheme = {
  safe:    { banner: 'bg-green-50 border-green-200',  icon: 'bg-green-200',  iconColor: 'text-green-700', title: 'text-green-800', subtitle: 'text-green-700', badge: 'bg-green-200 text-green-800' },
  unsafe:  { banner: 'bg-red-50 border-red-200',      icon: 'bg-red-200',    iconColor: 'text-red-700',   title: 'text-red-800',   subtitle: 'text-red-700',   badge: 'bg-red-200 text-red-800'     },
  warning: { banner: 'bg-amber-50 border-amber-200',  icon: 'bg-amber-200',  iconColor: 'text-amber-700', title: 'text-amber-800', subtitle: 'text-amber-700', badge: 'bg-amber-200 text-amber-800' },
}

const scoreStyle = {
  high: { text: 'text-green-600', bar: 'bg-green-500' },
  mid:  { text: 'text-amber-500', bar: 'bg-amber-400' },
  low:  { text: 'text-red-600',   bar: 'bg-red-500'   },
}

const vc = computed(() => verdictTheme[result.value?.verdict] ?? verdictTheme.safe)

function scoreLevel(score) {
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}

async function handleSubmit() {
  const input = url.value.trim()
  if (!input) {
    error.value = 'Please enter a URL to check.'
    return
  }
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
</script>

<template>
  <section class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Page header -->
      <div class="flex justify-center mb-5">
        <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-11 h-11 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
      <h1 class="text-5xl font-bold text-gray-900 text-center mb-3">Is this website safe?</h1>
      <p class="text-gray-500 text-xl text-center mb-10">
        Paste any website address below. We check it before you visit.
      </p>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        <!-- Left panel: form + info -->
        <div class="lg:col-span-2 space-y-4">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <label class="block text-lg font-medium text-gray-700 mb-3">Website address to check:</label>
            <input
              v-model="url"
              @keyup.enter="handleSubmit"
              type="text"
              placeholder="e.g. www.example.com"
              class="w-full border border-gray-200 rounded-xl px-5 py-4 text-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
              :class="error ? 'border-red-300' : ''"
            />
            <button
              @click="handleSubmit"
              :disabled="loading"
              class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {{ loading ? 'Checking...' : 'Check Now' }}
            </button>
            <p v-if="error" class="mt-2 text-base text-red-500">{{ error }}</p>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div class="flex justify-center mb-2">
                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800 mb-1">Free to use</p>
              <p class="text-sm text-gray-500">No sign-up needed</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div class="flex justify-center mb-2">
                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800 mb-1">Plain English</p>
              <p class="text-sm text-gray-500">No tech jargon</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div class="flex justify-center mb-2">
                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800 mb-1">Private</p>
              <p class="text-sm text-gray-500">Nothing stored</p>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3 items-start">
            <svg class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-base text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> SafeCheck gives general guidance only. It is not a substitute for professional cybersecurity advice and does not guarantee any result.
            </p>
          </div>
        </div>

        <!-- Right panel: results or empty state -->
        <div class="lg:col-span-3">

          <div v-if="result" class="space-y-4">

            <!-- Verdict banner -->
            <div class="rounded-2xl border p-5 flex items-start gap-4" :class="vc.banner">
              <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" :class="vc.icon">
                <svg class="w-6 h-6" :class="vc.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="result.verdict === 'safe'"         stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  <path v-else-if="result.verdict === 'unsafe'"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  <path v-else                                   stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-bold text-xl" :class="vc.title">
                  <span v-if="result.verdict === 'safe'">This website looks safe</span>
                  <span v-else-if="result.verdict === 'unsafe'">This website looks dangerous</span>
                  <span v-else>Proceed with caution</span>
                </p>
                <p class="text-base mt-1" :class="vc.subtitle">{{ result.hostname }}</p>
                <ul v-if="result.riskFactors.length" class="mt-2 space-y-1">
                  <li v-for="rf in result.riskFactors" :key="rf" class="flex items-start gap-1.5 text-base text-red-700">
                    <span class="mt-0.5">•</span> {{ rf }}
                  </li>
                </ul>
              </div>
              <span class="text-sm font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide" :class="vc.badge">
                {{ result.verdict }}
              </span>
            </div>

            <!-- Trust score -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-base font-semibold text-gray-400 uppercase tracking-wide">Trust Score</p>
                <span class="text-4xl font-bold" :class="scoreStyle[scoreLevel(result.trustScore)].text">
                  {{ result.trustScore }}<span class="text-lg font-medium text-gray-400">/100</span>
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-4 mb-3">
                <div
                  class="h-4 rounded-full transition-all duration-500"
                  :style="{ width: result.trustScore + '%' }"
                  :class="scoreStyle[scoreLevel(result.trustScore)].bar"
                />
              </div>
              <p class="text-base text-gray-500 mb-3">
                <span v-if="result.trustScore >= 85">This site looks highly trustworthy</span>
                <span v-else-if="result.trustScore >= 70">Generally safe, no major red flags</span>
                <span v-else-if="result.trustScore >= 40">Some concerns found - proceed carefully</span>
                <span v-else>Multiple red flags detected - avoid this site</span>
              </p>
              <button
                @click="showScoreBreakdown = !showScoreBreakdown"
                class="text-base text-gray-400 hover:text-gray-600 flex items-center gap-2 transition-colors"
              >
                <svg class="w-4 h-4 transition-transform duration-200" :class="showScoreBreakdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                How is this score calculated?
              </button>
              <div v-if="showScoreBreakdown" class="mt-3 border-t border-gray-100 pt-3">
                <div class="grid grid-cols-12 text-base font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                  <span class="col-span-5">Category</span>
                  <span class="col-span-4">What we found</span>
                  <span class="col-span-2 text-right">Max risk</span>
                  <span class="col-span-1 text-right">Score</span>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="cat in result.scoreCategories"
                    :key="cat.label"
                    class="grid grid-cols-12 items-start text-base px-2 py-2.5 rounded-lg"
                    :class="cat.passed ? 'bg-green-50' : 'bg-red-50'"
                  >
                    <div class="col-span-5 flex items-center gap-1.5">
                      <StatusIcon :status="cat.passed ? 'pass' : 'danger'" size="sm" />
                      <span class="font-medium text-gray-700">{{ cat.label }}</span>
                    </div>
                    <span class="col-span-4 text-gray-500 leading-tight">{{ cat.detail }}</span>
                    <span class="col-span-2 text-right text-gray-400">-{{ cat.maxDeduction }}</span>
                    <span class="col-span-1 text-right font-semibold" :class="cat.deduction === 0 ? 'text-green-600' : 'text-red-500'">
                      {{ cat.deduction === 0 ? '0' : '-' + cat.deduction }}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-12 text-base font-semibold border-t border-gray-200 mt-2 pt-2 px-1">
                  <span class="col-span-11 text-gray-700">Final score (100 minus total deductions)</span>
                  <span class="col-span-1 text-right" :class="scoreStyle[scoreLevel(result.trustScore)].text">{{ result.trustScore }}</span>
                </div>
              </div>
            </div>

            <!-- Check results -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <p class="text-base font-semibold text-gray-400 uppercase tracking-wide mb-4">Check results</p>
              <div class="space-y-4">
                <div v-for="check in result.checks" :key="check.label" class="flex items-start gap-3">
                  <StatusIcon :status="check.status" class="mt-0.5" />
                  <div>
                    <p class="text-lg font-semibold text-gray-800">{{ check.label }}</p>
                    <p class="text-base text-gray-500 mt-0.5">{{ check.detail }}</p>
                  </div>
                </div>
              </div>
            </div>

            <button @click="reset" class="w-full text-base text-green-700 font-medium py-2 hover:underline">
              Check another website
            </button>
          </div>

          <!-- Empty state -->
          <div v-else class="h-full min-h-72 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center">
            <svg class="w-14 h-14 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <p class="text-lg font-medium text-gray-400">Your results will appear here</p>
            <p class="text-base text-gray-300 mt-1">Enter a website address on the left to get started</p>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>
