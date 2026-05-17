<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  awarenessInsights,
  scamAwarenessCards,
  scamProofPoints,
  supportLinks,
} from '../data/scamAwarenessData.js'
import { getOnlineSeniorStats } from '../services/api.js'

const statsLoading = ref(false)
const statsError = ref('')
const seniorStats = ref(null)

const topScamTypes = computed(() => seniorStats.value?.topScamTypes || [])
const summary = computed(() => seniorStats.value?.summary || null)
const chartRows = computed(() => topScamTypes.value.slice(0, 6))

const maxReports = computed(() => {
  return Math.max(...topScamTypes.value.map(item => Number(item.total_reports) || 0), 1)
})

const summaryCards = computed(() => {
  if (!summary.value) return []

  return [
    {
      label: 'Reported online scam cases',
      value: formatNumber(summary.value.total_reports),
      helper: 'Reports from people aged 65 and over',
    },
    {
      label: 'Reported money lost',
      value: formatCurrency(summary.value.total_lost),
      helper: 'Reported losses from online scam cases',
    },
  ]
})

function formatNumber(value) {
  return new Intl.NumberFormat('en-AU').format(Number(value) || 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function getBarWidth(value) {
  return `${((Number(value) || 0) / maxReports.value) * 100}%`
}

onMounted(async () => {
  statsLoading.value = true
  statsError.value = ''

  try {
    seniorStats.value = await getOnlineSeniorStats()
  } catch (err) {
    statsError.value = 'Scam statistics could not be loaded right now. You can still read the safety information below.'
  } finally {
    statsLoading.value = false
  }
})
</script>

<template>
  <section style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);">
    <div class="px-8 sm:px-16 py-12 sm:py-16">
      <div class="text-center max-w-3xl mx-auto animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 bg-white/15">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3l7 4v5c0 4.5-2.9 8.5-7 9.8-4.1-1.3-7-5.3-7-9.8V7l7-4z" />
          </svg>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          Scam Awareness
        </h1>
        <p class="text-xl text-white leading-relaxed" style="opacity: 0.92;">
          Learn common scam warning signs before you click, pay, or share personal details.
        </p>
      </div>
    </div>
  </section>

  <section class="py-12 px-8 sm:px-16" style="background-color: var(--bg);">
    <div class="max-w-6xl mx-auto space-y-10">
      <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-slate-900 mb-3">
            Scam statistics for older Australians
          </h2>
          <p class="text-lg text-slate-600 leading-relaxed">
            These figures show online scam reports involving Australians aged 65 and over. They help explain why simple scam warnings matter.
          </p>
        </div>

        <div v-if="statsLoading" class="text-lg text-slate-600">
          Loading scam statistics...
        </div>

        <div v-else-if="statsError" class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p class="text-lg text-amber-900 leading-relaxed">
            {{ statsError }}
          </p>
        </div>

        <div v-else-if="summary" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
              At a glance
            </p>
            <div class="divide-y divide-slate-200">
              <div
                v-for="card in summaryCards"
                :key="card.label"
                class="py-4 first:pt-0 last:pb-0"
              >
                <p class="text-base font-semibold text-slate-600 uppercase tracking-wide">
                  {{ card.label }}
                </p>
                <p class="text-4xl font-bold mt-1" style="color: var(--navy);">
                  {{ card.value }}
                </p>
                <p class="text-base text-slate-600 leading-snug mt-1">
                  {{ card.helper }}
                </p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-8 rounded-xl border border-slate-200 p-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
              <div>
                <h3 class="text-2xl font-bold text-slate-900">
                  Common online scam types
                </h3>
                <p class="text-base text-slate-600 leading-relaxed mt-1">
                  Ranked by report volume. Longer bars mean more reports.
                </p>
              </div>
              <p class="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Reports
              </p>
            </div>

            <div v-if="chartRows.length" class="space-y-4">
              <div
                v-for="item in chartRows"
                :key="item.scam_type"
                class="grid gap-2"
              >
                <div class="flex items-baseline justify-between gap-3">
                  <p class="text-lg font-semibold text-slate-800 leading-tight">
                    {{ item.scam_type }}
                  </p>
                  <p class="text-base font-bold shrink-0" style="color: var(--navy);">
                    {{ formatNumber(item.total_reports) }}
                  </p>
                </div>

                <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full"
                    style="background-color: var(--navy);"
                    :style="{ width: getBarWidth(item.total_reports) }"
                  ></div>
                </div>
              </div>
            </div>

            <p v-else class="text-lg text-slate-600 leading-relaxed">
              No scam type data is available right now.
            </p>
          </div>
        </div>
      </section>

      <section class="animate-fade-in-up">
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-slate-900 mb-3">Scam proof points</h2>
          <p class="text-lg text-slate-600 leading-relaxed">
            These cards explain the headline numbers used on the home page, with links to the original Australian guidance.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <article
            v-for="point in scamProofPoints"
            :id="`proof-${point.id}`"
            :key="point.id"
            class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm scroll-mt-24 transition-colors target:border-blue-900 target:bg-blue-50"
          >
            <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">{{ point.source }}</p>
            <div class="flex items-start gap-4 mb-4">
              <p class="text-4xl font-bold shrink-0" style="color: var(--navy);">{{ point.value }}</p>
              <div>
                <h3 class="text-2xl font-bold text-slate-900 leading-tight">{{ point.awarenessTitle }}</h3>
                <p class="text-base text-slate-600 leading-snug mt-1">{{ point.label }}</p>
              </div>
            </div>
            <p class="text-lg text-slate-700 leading-relaxed mb-4">{{ point.awarenessText }}</p>
            <a
              :href="point.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-lg font-semibold rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              style="color: var(--navy);"
            >
              {{ point.sourceLabel }}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          </article>
        </div>
      </section>

      <div class="animate-fade-in-up">
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Common scam types</h2>
        <p class="text-lg text-slate-600 leading-relaxed mb-6">
          These examples show how common scams work and what you can do to stay safer.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <article
            v-for="card in scamAwarenessCards"
            :key="card.title"
            class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 class="text-2xl font-bold text-slate-900 mb-5">{{ card.title }}</h3>

            <div class="space-y-5">
              <div>
                <p class="text-base font-semibold text-slate-500 uppercase tracking-wide mb-1">How it works</p>
                <p class="text-lg text-slate-700 leading-relaxed">{{ card.description }}</p>
              </div>

              <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p class="text-base font-bold text-amber-900 uppercase tracking-wide mb-1">Warning sign</p>
                <p class="text-lg text-amber-900 leading-relaxed">{{ card.warningSign }}</p>
              </div>

              <div class="rounded-xl border border-green-200 bg-green-50 p-4">
                <p class="text-base font-bold text-green-900 uppercase tracking-wide mb-1">What to do</p>
                <p class="text-lg text-green-900 leading-relaxed">{{ card.safeAction }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="animate-fade-in-up">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Simple safety reminders</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <article
            v-for="insight in awarenessInsights"
            :key="insight.title"
            class="rounded-2xl border border-blue-100 p-6 shadow-sm"
            style="background-color: var(--navy-tint);"
          >
            <h3 class="text-2xl font-bold mb-3" style="color: var(--navy);">{{ insight.title }}</h3>
            <p class="text-lg text-slate-700 leading-relaxed">{{ insight.text }}</p>
          </article>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Trusted Australian help and information</h2>
        <p class="text-lg text-slate-600 leading-relaxed mb-6">
          These Australian services can help you learn more or find support if you are worried about a scam.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            v-for="link in supportLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-xl border border-slate-200 p-5 transition hover:border-blue-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            <p class="text-xl font-bold mb-2" style="color: var(--navy);">{{ link.label }}</p>
            <p class="text-lg text-slate-700 leading-relaxed">{{ link.description }}</p>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
