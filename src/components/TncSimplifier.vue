<script setup>
import { ref } from 'vue'

const inputMode = ref('url')
const inputValue = ref('')
const loading = ref(false)
const hasResult = ref(false)

function handleAnalyze() {
  if (!inputValue.value.trim()) return
  loading.value = true
  hasResult.value = false
  // Placeholder — replace with real API call when backend is ready
  setTimeout(() => {
    loading.value = false
    hasResult.value = true
  }, 1800)
}

// ── Sample output structure ──────────────────────────────────────────────────
// This defines the shape of what a real API response should look like.
// Each flaggedClause connects to a real-world consequence and, where relevant,
// a real case (Cambridge Analytica, Meta, OpenAI) so users understand the stakes.
const sampleResult = {
  overallRisk: 'medium', // 'low' | 'medium' | 'high'
  summary: `This service collects data about how you use it and may share that data with
    third-party advertising partners. Your conversations or activity may be used
    to improve or train future versions of the product. Cancelling your subscription
    requires written notice 30 days in advance.`,
  flaggedClauses: [
    {
      category: 'Data collection',
      severity: 'warn',
      clause: 'We collect your usage data, device information, and browsing activity within the app.',
      consequence: 'The service builds a detailed profile of your habits. This profile can be sold or shared with advertisers — even if you never knew.',
      realCase: {
        name: 'Facebook / Cambridge Analytica (2016)',
        detail: 'Millions of Facebook users had their personal data harvested and used to build political profiles without their knowledge or consent, influencing the 2016 US election.',
      },
    },
    {
      category: 'Data sharing with third parties',
      severity: 'danger',
      clause: 'We may share your personal information with our advertising and analytics partners.',
      consequence: 'Your personal data — including things you search for or read — may be sold to companies you have never heard of, who use it to target you with ads.',
      realCase: {
        name: 'Meta Privacy Policy',
        detail: 'User data across Facebook, Instagram, and WhatsApp was shared and used for advertising. Most users did not understand the extent of this until it became a major news story.',
      },
    },
    {
      category: 'AI training data',
      severity: 'warn',
      clause: 'Your conversations and submitted content may be used to train and improve our AI models.',
      consequence: 'Anything you type — questions, complaints, personal details — could be used to teach an AI system. This data may be kept and processed for years.',
      realCase: {
        name: 'OpenAI Privacy Policy scrutiny',
        detail: 'OpenAI\'s terms raised concerns that user conversations submitted to ChatGPT could be used to train future AI models, prompting regulatory investigations in several countries.',
      },
    },
    {
      category: 'Cancellation trap',
      severity: 'warn',
      clause: 'To cancel your subscription, you must provide written notice 30 days before your renewal date.',
      consequence: 'If you forget to cancel in time, you will be charged for another full year. Many people discover this only after seeing an unexpected charge on their bank statement.',
      realCase: null,
    },
    {
      category: 'Chat data retention',
      severity: 'warn',
      clause: 'Chat logs and support conversations are retained for up to 7 years for quality assurance purposes.',
      consequence: 'Private conversations with customer support — which may include sensitive details — are stored for many years and could be accessed in legal proceedings or data breaches.',
      realCase: null,
    },
  ],
}

const riskConfig = {
  low:    { label: 'Low Risk',    bg: '#f0fdf4', border: '#16a34a', text: '#14532d', icon: '#16a34a' },
  medium: { label: 'Medium Risk', bg: '#fffbeb', border: '#d97706', text: '#78350f', icon: '#d97706' },
  high:   { label: 'High Risk',   bg: '#fef2f2', border: '#dc2626', text: '#7f1d1d', icon: '#dc2626' },
}

const severityConfig = {
  danger: { label: 'High concern', bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', iconBg: '#fee2e2' },
  warn:   { label: 'Worth noting', bg: '#fffbeb', border: '#fde68a', icon: '#d97706', iconBg: '#fef3c7' },
  pass:   { label: 'Fine',         bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', iconBg: '#dcfce7' },
}
</script>

<template>
  <section class="py-16 px-4" style="background-color: var(--bg);">
    <div>

      <!-- Page heading -->
      <div class="text-center mb-10 animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style="background-color: var(--navy-tint);">
          <svg class="w-10 h-10" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="text-5xl sm:text-6xl font-bold text-slate-900 mb-4 animate-fade-in-up stagger-1">
          T&amp;C Simplifier
        </h1>
        <p class="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
          Paste a link or the full Terms &amp; Conditions text and get a plain-English summary —
          with a clear risk rating and the things that matter most, explained.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

        <!-- ── Left: input card ────────────────────────────────── -->
        <div class="lg:col-span-2 animate-fade-in-up">
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <!-- URL / Paste Text toggle -->
            <div class="flex rounded-xl border border-slate-200 p-1 mb-5 bg-slate-50">
              <button
                @click="inputMode = 'url'"
                :class="inputMode === 'url'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'"
                class="flex-1 text-lg font-medium py-3 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              >
                Website URL
              </button>
              <button
                @click="inputMode = 'text'"
                :class="inputMode === 'text'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'"
                class="flex-1 text-lg font-medium py-3 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              >
                Paste Text
              </button>
            </div>

            <label class="block text-xl font-semibold text-slate-800 mb-2">
              {{ inputMode === 'url' ? 'Link to the Terms & Conditions page' : 'Paste the Terms & Conditions here' }}
            </label>

            <input
              v-if="inputMode === 'url'"
              v-model="inputValue"
              type="url"
              placeholder="https://example.com/terms"
              class="w-full border border-slate-200 rounded-xl px-5 py-4 text-xl placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-transparent transition"
              style="font-size: 1.125rem;"
            />
            <textarea
              v-else
              v-model="inputValue"
              rows="7"
              placeholder="Paste the full Terms &amp; Conditions text here..."
              class="w-full border border-slate-200 rounded-xl px-5 py-4 text-xl placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-transparent resize-none transition"
              style="font-size: 1.125rem;"
            ></textarea>

            <button
              @click="handleAnalyze"
              :disabled="loading || !inputValue.trim()"
              class="btn-navy mt-4 w-full py-4 text-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>{{ loading ? 'Analysing...' : 'Analyse these T&Cs' }}</span>
            </button>

            <!-- What we look for -->
            <div class="mt-6 border-t border-slate-100 pt-5">
              <p class="text-base font-semibold text-slate-500 uppercase tracking-wide mb-3">What we flag</p>
              <ul class="space-y-2">
                <li v-for="item in [
                  'Data collection and what it\'s used for',
                  'Data sold to third parties',
                  'AI training data usage',
                  'Chat and message data retention',
                  'Cancellation traps and auto-renewal',
                ]" :key="item" class="flex items-start gap-2 text-lg text-slate-600">
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ── Right: results ──────────────────────────────────── -->
        <div class="lg:col-span-3">

          <!-- Empty state -->
          <div v-if="!loading && !hasResult" class="flex flex-col items-center justify-center min-h-64 text-center py-16 animate-fade-in">
            <div class="w-20 h-20 rounded-full mb-5 flex items-center justify-center" style="background-color: var(--navy-tint);">
              <svg class="w-10 h-10" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-2xl font-semibold text-slate-700 mb-2">Enter a URL or paste text to begin</p>
            <p class="text-lg text-slate-400 max-w-xs">We will highlight the things most likely to affect you.</p>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="space-y-4 animate-fade-in">
            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-full bg-slate-100 animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-5 w-32 bg-slate-100 rounded animate-pulse mb-2"></div>
                  <div class="h-8 w-48 bg-slate-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div class="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
                <div class="h-4 w-4/6 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
            <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="h-4 w-40 bg-slate-100 rounded animate-pulse mb-3"></div>
              <div class="h-4 w-full bg-slate-100 rounded animate-pulse mb-2"></div>
              <div class="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Results -->
          <div v-if="hasResult && !loading" class="space-y-5 animate-slide-in-right">

            <!-- ① Overall Risk Rating — the FIRST thing the user sees -->
            <div
              class="rounded-2xl border-4 p-6"
              :style="{
                background: riskConfig[sampleResult.overallRisk].bg,
                borderColor: riskConfig[sampleResult.overallRisk].border,
              }"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-full flex items-center justify-center"
                    :style="{ background: riskConfig[sampleResult.overallRisk].bg, border: '2px solid ' + riskConfig[sampleResult.overallRisk].border }">
                    <svg class="w-7 h-7" :style="{ color: riskConfig[sampleResult.overallRisk].icon }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sampleResult.overallRisk === 'low'"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      <path v-else
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-base font-semibold uppercase tracking-widest" :style="{ color: riskConfig[sampleResult.overallRisk].text, opacity: 0.7 }">
                      Overall assessment
                    </p>
                    <p class="text-3xl font-bold" :style="{ color: riskConfig[sampleResult.overallRisk].text }">
                      {{ riskConfig[sampleResult.overallRisk].label }}
                    </p>
                  </div>
                </div>
              </div>
              <p class="text-lg leading-relaxed" :style="{ color: riskConfig[sampleResult.overallRisk].text }">
                {{ sampleResult.summary }}
              </p>
            </div>

            <!-- ② Flagged clauses — each with real-world consequence -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <p class="text-base font-semibold text-slate-400 uppercase tracking-wide mb-5">
                Clauses worth knowing about
              </p>

              <div class="space-y-5">
                <div
                  v-for="clause in sampleResult.flaggedClauses"
                  :key="clause.category"
                  class="rounded-xl border p-5"
                  :style="{
                    background: severityConfig[clause.severity].bg,
                    borderColor: severityConfig[clause.severity].border,
                  }"
                >
                  <!-- Category header -->
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      :style="{ background: severityConfig[clause.severity].iconBg }">
                      <svg class="w-4 h-4" :style="{ color: severityConfig[clause.severity].icon }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="clause.severity === 'danger'"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                        <path v-else-if="clause.severity === 'warn'"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
                        <path v-else
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div class="flex items-center justify-between flex-1 flex-wrap gap-2">
                      <span class="text-lg font-bold text-slate-800">{{ clause.category }}</span>
                      <span class="text-sm font-semibold px-3 py-1 rounded-full text-white"
                        :style="{ background: severityConfig[clause.severity].icon }">
                        {{ severityConfig[clause.severity].label }}
                      </span>
                    </div>
                  </div>

                  <!-- What the T&C actually says -->
                  <div class="mb-3">
                    <p class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">What the T&Cs say</p>
                    <p class="text-base text-slate-600 italic leading-relaxed border-l-4 pl-3" :style="{ borderColor: severityConfig[clause.severity].border }">
                      "{{ clause.clause }}"
                    </p>
                  </div>

                  <!-- Real-world consequence — the most important part for Mary -->
                  <div class="mb-3">
                    <p class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">What this means for you</p>
                    <p class="text-lg text-slate-800 leading-relaxed font-medium">{{ clause.consequence }}</p>
                  </div>

                  <!-- Real case reference — educational context -->
                  <div v-if="clause.realCase"
                    class="mt-3 rounded-lg p-4"
                    style="background: rgba(0,0,0,0.04);"
                  >
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Real case: {{ clause.realCase.name }}</p>
                    <p class="text-base text-slate-600 leading-relaxed">{{ clause.realCase.detail }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ③ Legal disclaimer — required and clear -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-3 items-start">
              <svg class="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-base font-bold text-slate-700 mb-1">Educational guidance only — not legal advice</p>
                <p class="text-base text-slate-500 leading-relaxed">
                  This summary is provided to help you understand what you may be agreeing to. It is not a substitute
                  for professional legal advice. If you have concerns about a specific document, please consult a
                  qualified solicitor or contact the Australian Consumer and Competition Commission (ACCC).
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>
