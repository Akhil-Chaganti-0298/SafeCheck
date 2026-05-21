<script setup>
import { computed, nextTick, ref } from 'vue'
import { simplifyTnC } from '../services/api.js'

const inputMode = ref('url')
const inputValue = ref('')
const uploadedFile = ref(null)
const selectedFileName = ref('')
const selectedFileSize = ref('')
const selectedFileType = ref('')
const fileInputRef = ref(null)
const loading = ref(false)
const hasResult = ref(false)
const result = ref(null)
const error = ref('')
const resultSourceMode = ref('')
const resultViewMode = ref('cards')
const resultsPanelRef = ref(null)
const riskCardIndexes = ref({
  danger: 0,
  warn: 0,
  pass: 0,
})
const MAX_FILE_SIZE = 5 * 1024 * 1024
const allowedFileTypes = ['application/pdf', 'text/plain']

const canAnalyze = computed(() => {
  if (loading.value) return false
  if (inputMode.value === 'file') return Boolean(uploadedFile.value)
  return Boolean(inputValue.value.trim())
})

const uploadStatusMessage = computed(() => {
  if (inputMode.value === 'file') return 'Uploading and analysing your PDF...'
  if (inputMode.value === 'url') return 'Fetching and analysing the Terms page...'
  return 'Analysing the pasted Terms and Conditions...'
})

function formatFileSize(sizeInBytes) {
  return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`
}

function getFriendlyFileType(file) {
  if (file.type === 'application/pdf') return 'PDF'
  if (file.type === 'text/plain') return 'Text file'
  return file.type || 'Unknown'
}

function setInputMode(mode) {
  inputMode.value = mode
  error.value = ''
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  uploadedFile.value = null
  selectedFileName.value = ''
  selectedFileSize.value = ''
  selectedFileType.value = ''
  error.value = ''

  if (!file) return

  if (!allowedFileTypes.includes(file.type)) {
    error.value = 'Only PDF and text files are supported.'
    event.target.value = ''
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    error.value = 'This file is too large. Please upload a file under 5 MB.'
    event.target.value = ''
    return
  }

  uploadedFile.value = file
  selectedFileName.value = file.name
  selectedFileSize.value = formatFileSize(file.size)
  selectedFileType.value = getFriendlyFileType(file)
}

function removeSelectedFile() {
  uploadedFile.value = null
  selectedFileName.value = ''
  selectedFileSize.value = ''
  selectedFileType.value = ''
  error.value = ''

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (hasResult.value && resultSourceMode.value === 'file') {
    hasResult.value = false
    result.value = null
    resultSourceMode.value = ''
  }
}

async function handleAnalyze() {
  if (loading.value) return
  if (inputMode.value === 'file' && !uploadedFile.value) {
    error.value = 'Please upload a PDF or text file before analysing.'
    return
  }
  if (!canAnalyze.value) return

  loading.value = true
  hasResult.value = false
  error.value = ''
  result.value = null
  resultSourceMode.value = ''
  resultViewMode.value = 'cards'
  riskCardIndexes.value = { danger: 0, warn: 0, pass: 0 }

  try {
    const data = await simplifyTnC({
      mode: inputMode.value,
      url: inputMode.value === 'url' ? inputValue.value.trim() : undefined,
      text: inputMode.value === 'text' ? inputValue.value.trim() : undefined,
      file: inputMode.value === 'file' ? uploadedFile.value : undefined,
    })
    result.value = data
    hasResult.value = true
    resultSourceMode.value = inputMode.value
    scrollResultsIntoView()
  } catch (err) {
    if (err.response?.status === 429) {
      const seconds = Number.isFinite(err.retryAfterSeconds) ? err.retryAfterSeconds : 30
      error.value = `AI service is busy right now. Please wait about ${seconds} seconds, then try again.`
    } else {
      error.value = err.response?.data?.error || 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function scrollResultsIntoView() {
  nextTick(() => {
    const panel = resultsPanelRef.value
    if (!panel) return

    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0
    const top = panel.getBoundingClientRect().top + window.scrollY - headerHeight - 24
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  })
}

const sampleTnC = `By using this service, you agree to our collection of information about your usage patterns, device details, and browsing activity within the platform. This information is used to improve our products and to serve personalised advertisements.

We may share your personal information with our advertising partners, analytics providers, and affiliated businesses. Shared data may include your name, email address, browsing habits, and purchase history. You may not opt out of essential data sharing without terminating your account.

Content you submit, including messages, uploaded documents, and search queries, may be used to train, test, and improve our artificial intelligence systems. This data may be retained for up to ten years.

To cancel your subscription, you must submit a written cancellation request no less than 30 days before your next billing date. Cancellations received after this deadline will not take effect until the following renewal period, and no partial refunds will be issued.

These terms may be updated at any time without individual notice. Continued use of this service constitutes your acceptance of the revised terms.`

function trySample() {
  inputMode.value = 'text'
  inputValue.value = sampleTnC
  removeSelectedFile()
  error.value = ''
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

const severityRank = {
  danger: 3,
  warn: 2,
  pass: 1,
}

const severityOrder = ['danger', 'warn', 'pass']

const sortedFlaggedClauses = computed(() => {
  const clauses = result.value?.flaggedClauses
  if (!Array.isArray(clauses)) return []

  return clauses
    .map((clause, index) => ({ clause, index }))
    .sort((a, b) => {
      const riskDifference = (severityRank[b.clause.severity] || 0) - (severityRank[a.clause.severity] || 0)
      return riskDifference || a.index - b.index
    })
    .map(({ clause }) => clause)
})

const riskCardGroups = computed(() => {
  return severityOrder
    .map((severity) => ({
      severity,
      clauses: sortedFlaggedClauses.value.filter((clause) => clause.severity === severity),
    }))
    .filter((group) => group.clauses.length > 0)
})

function setResultViewMode(mode) {
  resultViewMode.value = mode
}

function currentRiskCard(group) {
  const index = riskCardIndexes.value[group.severity] || 0
  return group.clauses[Math.min(index, group.clauses.length - 1)]
}

function setRiskCardIndex(severity, index, total) {
  riskCardIndexes.value = {
    ...riskCardIndexes.value,
    [severity]: Math.min(Math.max(index, 0), total - 1),
  }
}
</script>

<template>
  <!-- Compact navy hero band -->
  <section style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);">
    <div class="px-8 sm:px-16 py-12 sm:py-16">
      <div class="text-center max-w-2xl mx-auto animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 bg-white/15">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          Explain my Terms
        </h1>
        <p class="text-xl text-white leading-relaxed" style="opacity: 0.92;">
          Paste any Terms and Conditions link or text and we will explain what you are actually agreeing to, in plain English.
        </p>
      </div>
    </div>
  </section>

  <!-- Main content -->
  <section class="py-12 px-8 sm:px-16" style="background-color: var(--bg);">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

      <!-- ── Left: input card ────────────────────────────────── -->
      <div class="lg:col-span-2 animate-fade-in-up">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <!-- URL / Paste Text / Upload PDF toggle - strong active state -->
          <div class="flex rounded-xl border border-slate-200 p-1 mb-4 bg-slate-50">
            <button
              @click="setInputMode('url')"
              class="flex-1 text-base sm:text-lg font-semibold py-3 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              :class="inputMode === 'url' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
              :style="inputMode === 'url' ? 'background-color: var(--navy);' : ''"
            >
              Paste a link
            </button>
            <button
              @click="setInputMode('text')"
              class="flex-1 text-base sm:text-lg font-semibold py-3 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              :class="inputMode === 'text' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
              :style="inputMode === 'text' ? 'background-color: var(--navy);' : ''"
            >
              Paste the text
            </button>
            <button
              @click="setInputMode('file')"
              class="flex-1 text-base sm:text-lg font-semibold py-3 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              :class="inputMode === 'file' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
              :style="inputMode === 'file' ? 'background-color: var(--navy);' : ''"
            >
              Upload a PDF
            </button>
          </div>

          <!-- Item 6: Try a sample link -->
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xl font-semibold text-slate-800">
              {{
                inputMode === 'url'
                  ? 'Link to the Terms & Conditions page'
                  : inputMode === 'text'
                    ? 'Paste the Terms & Conditions here'
                    : 'Upload a PDF or text file'
              }}
            </label>
            <button
              v-if="inputMode !== 'file'"
              type="button"
              @click="trySample"
              class="text-base font-semibold ml-3 flex-shrink-0 underline decoration-dotted underline-offset-2 hover:no-underline transition-all"
              style="color: var(--navy);"
            >
              Try a sample →
            </button>
          </div>

          <input
            v-if="inputMode === 'url'"
            v-model="inputValue"
            type="url"
            placeholder="Paste the link to the Terms and Conditions page here"
            class="w-full border border-slate-200 rounded-xl px-5 py-4 text-xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-transparent transition"
            style="font-size: 1.125rem;"
          />
          <textarea
            v-else-if="inputMode === 'text'"
            v-model="inputValue"
            rows="7"
            placeholder="Copy and paste the full Terms and Conditions text here"
            class="w-full border border-slate-200 rounded-xl px-5 py-4 text-xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-transparent resize-none transition"
            style="font-size: 1.125rem;"
          ></textarea>
          <div
            v-else
            class="border border-dashed border-slate-300 rounded-xl px-5 py-6 bg-slate-50"
          >
            <div class="rounded-xl border border-blue-100 p-4 mb-5" style="background-color: var(--navy-tint);">
              <p class="text-base font-bold mb-3" style="color: var(--navy);">How to upload Terms &amp; Conditions</p>
              <ol class="space-y-2 text-base text-slate-700 leading-relaxed">
                <li><strong>Step 1:</strong> Download or save the Terms and Conditions as a PDF from the website.</li>
                <li><strong>Step 2:</strong> Click Upload PDF and choose the file from your device.</li>
                <li><strong>Step 3:</strong> Click Analyse these T&amp;Cs.</li>
                <li><strong>Step 4:</strong> Read the plain-English summary and risky clauses.</li>
              </ol>
              <p class="mt-3 text-base text-slate-600 leading-relaxed">
                If the website does not provide a PDF, copy the Terms and Conditions text and use Paste Text instead.
              </p>
            </div>

            <input
              id="tnc-file-upload"
              ref="fileInputRef"
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              class="sr-only"
              :disabled="loading"
              @change="handleFileChange"
            />
            <label
              for="tnc-file-upload"
              class="btn-navy inline-flex px-5 py-3 text-lg"
              :class="loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'"
            >
              Choose file
            </label>

            <div
              v-if="uploadedFile"
              class="mt-4 bg-white border border-slate-200 rounded-xl p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <p class="text-lg font-semibold text-slate-800">Selected file: {{ selectedFileName }}</p>
                  <p class="text-base text-slate-600">Size: {{ selectedFileSize }}</p>
                  <p class="text-base text-slate-600">Type: {{ selectedFileType }}</p>
                </div>
                <button
                  type="button"
                  @click="removeSelectedFile"
                  :disabled="loading"
                  class="text-base font-semibold underline decoration-dotted underline-offset-2 hover:no-underline disabled:opacity-60 disabled:cursor-not-allowed"
                  style="color: var(--navy);"
                >
                  Remove file
                </button>
              </div>
            </div>
            <p v-else class="mt-3 text-lg text-slate-700">
              No file selected
            </p>
            <p class="mt-1 text-base text-slate-500">
              PDF or .txt only, maximum 5 MB. Scanned PDFs without selectable text are not supported.
            </p>
          </div>

          <div
            v-if="loading"
            class="mt-4 rounded-xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900"
            style="background-color: #fffbeb;"
          >
            Please allow up to 90 seconds. We are reading the full document for you.
          </div>

          <button
            @click="handleAnalyze"
            :disabled="!canAnalyze"
            class="btn-navy mt-4 w-full py-4 text-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{{ loading ? uploadStatusMessage : 'Analyse these T&Cs' }}</span>
          </button>
        </div>

        <div
          v-if="hasResult && !loading && result"
          class="mt-5 rounded-2xl border-4 p-6 animate-slide-in-right"
          :style="{
            background: riskConfig[result.overallRisk].bg,
            borderColor: riskConfig[result.overallRisk].border,
          }"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-14 h-14 rounded-full flex items-center justify-center"
              :style="{ background: riskConfig[result.overallRisk].bg, border: '2px solid ' + riskConfig[result.overallRisk].border }">
              <svg class="w-7 h-7" :style="{ color: riskConfig[result.overallRisk].icon }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="result.overallRisk === 'low'"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                <path v-else
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p class="text-base font-semibold uppercase tracking-widest" :style="{ color: riskConfig[result.overallRisk].text, opacity: 0.7 }">
                Overall assessment
              </p>
              <p class="text-3xl font-bold" :style="{ color: riskConfig[result.overallRisk].text }">
                {{ riskConfig[result.overallRisk].label }}
              </p>
            </div>
          </div>
          <p class="text-lg leading-relaxed" :style="{ color: riskConfig[result.overallRisk].text }">
            {{ result.summary }}
          </p>
        </div>

        <!-- What we look for -->
        <div class="mt-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p class="text-base font-semibold text-slate-600 uppercase tracking-wide mb-3">What we flag</p>
          <ul class="space-y-2">
            <li v-for="item in [
              'Data collection and what it\'s used for',
              'Data sold to third parties',
              'AI training data usage',
              'Chat and message data retention',
              'Cancellation traps and auto-renewal',
            ]" :key="item" class="flex items-start gap-2 text-lg text-slate-600">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" stroke-width="2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.8 12.2l2 2 4.4-4.6" />
              </svg>
              {{ item }}
            </li>
          </ul>
        </div>

        <div
          v-if="hasResult && !loading && result"
          class="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-3 items-start"
        >
          <svg class="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-base font-bold text-slate-700 mb-1">Educational guidance only, not legal advice</p>
            <p class="text-base text-slate-600 leading-relaxed">
              This summary is provided to help you understand what you may be agreeing to. It is not a substitute
              for professional legal advice. If you have concerns about a specific document, please consult a
              qualified solicitor or contact the Australian Consumer and Competition Commission (ACCC).
            </p>
          </div>
        </div>
      </div>

      <!-- ── Right: results or educational panel ──────────────── -->
      <div class="lg:col-span-3">

        <!-- Educational empty state - fills the space usefully -->
        <div v-if="!loading && !hasResult && !error" class="space-y-5 animate-fade-in">

          <!-- Why T&Cs matter -->
          <div class="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Why do Terms &amp; Conditions matter?</h3>
            <p class="text-lg text-slate-600 leading-relaxed mb-5">
              When you sign up to a website or app, you agree to their Terms &amp; Conditions. Most people
              tick "I agree" without reading them, but these documents can legally allow companies to do things
              you may not expect:
            </p>
            <ul class="space-y-3 mb-5">
              <li v-for="risk in [
                'Sell your personal information to advertising companies',
                'Use your conversations to train AI systems',
                'Store your private messages for years',
                'Make it very difficult to cancel and get a refund',
              ]" :key="risk" class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span class="text-lg text-slate-700">{{ risk }}</span>
              </li>
            </ul>
            <p class="text-lg text-slate-600 leading-relaxed">
              SafeCheck reads the T&amp;Cs for you and highlights the clauses most likely to affect you in plain English, not legal language.
            </p>
          </div>

          <!-- Prompt to try it - now appears before the real example -->
          <div class="rounded-2xl p-6 shadow-sm" style="background-color: var(--navy-tint); border: 1px solid #bfdbfe;">
            <p class="text-lg font-bold mb-2" style="color: var(--navy);">Try it now. It only takes a moment.</p>
            <p class="text-lg text-slate-600 leading-relaxed">
              Paste the link to any website's Terms &amp; Conditions in the panel on the left, then click
              <strong>Analyse these T&amp;Cs</strong>. We will give you a plain-English summary within seconds.
            </p>
          </div>

          <!-- Real-world case - shown below the CTA as supporting context -->
          <div class="bg-white border-l-4 rounded-2xl p-6 shadow-sm" style="border-color: var(--navy);">
            <p class="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">A real example</p>
            <h4 class="text-xl font-bold text-slate-900 mb-3">Facebook &amp; Cambridge Analytica (2016)</h4>
            <p class="text-lg text-slate-600 leading-relaxed">
              Millions of Facebook users unknowingly agreed to terms that allowed their personal data to be
              harvested and used to influence political elections. Most had no idea until it became a global
              news story. The company had to pay a <strong>$5 billion fine</strong>, but users never got their data back.
            </p>
          </div>

        </div>

        <!-- Error state -->
        <div v-if="error && !loading" class="animate-fade-in">
          <div class="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-red-800 mb-1">Analysis failed</p>
                <p class="text-base text-red-700 leading-relaxed">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="space-y-4 animate-fade-in">
          <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-full bg-slate-100 animate-pulse"></div>
              <div class="flex-1">
                <p class="text-base font-semibold text-slate-600 mb-2">{{ uploadStatusMessage }}</p>
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
        <div v-if="hasResult && !loading && result" ref="resultsPanelRef" class="space-y-5 animate-slide-in-right scroll-mt-28">
          <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <p class="text-base font-semibold text-slate-600 uppercase tracking-wide">
                Clauses worth knowing about
              </p>
              <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  @click="setResultViewMode('cards')"
                  class="px-4 py-2 rounded-lg text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                  :class="resultViewMode === 'cards' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
                  :style="resultViewMode === 'cards' ? 'background-color: var(--navy);' : ''"
                >
                  Risk cards
                </button>
                <button
                  type="button"
                  @click="setResultViewMode('full')"
                  class="px-4 py-2 rounded-lg text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                  :class="resultViewMode === 'full' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
                  :style="resultViewMode === 'full' ? 'background-color: var(--navy);' : ''"
                >
                  Full summary
                </button>
              </div>
            </div>

            <div v-if="resultViewMode === 'full'" class="space-y-5">
              <div
                v-for="clause in sortedFlaggedClauses"
                :key="clause.category"
                class="rounded-xl border p-5"
                :style="{
                  background: severityConfig[clause.severity].bg,
                  borderColor: severityConfig[clause.severity].border,
                }"
              >
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
                    <span data-testid="flagged-clause-category" class="text-lg font-bold text-slate-800">{{ clause.category }}</span>
                    <span class="text-sm font-semibold px-3 py-1 rounded-full text-white"
                      :style="{ background: severityConfig[clause.severity].icon }">
                      {{ severityConfig[clause.severity].label }}
                    </span>
                  </div>
                </div>

                <div class="mb-3">
                  <p class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">What the T&Cs say</p>
                  <p class="text-base text-slate-600 italic leading-relaxed border-l-4 pl-3" :style="{ borderColor: severityConfig[clause.severity].border }">
                    "{{ clause.clause }}"
                  </p>
                </div>

                <div class="mb-3">
                  <p class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">What this means for you</p>
                  <p class="text-lg text-slate-800 leading-relaxed font-medium">{{ clause.consequence }}</p>
                </div>

                <div v-if="clause.realCase"
                  class="mt-3 rounded-lg p-4"
                  style="background: rgba(0,0,0,0.04);"
                >
                  <p class="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Real case: {{ clause.realCase.name }}</p>
                  <p class="text-base text-slate-600 leading-relaxed">{{ clause.realCase.detail }}</p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-5">
              <section
                v-for="group in riskCardGroups"
                :key="group.severity"
                class="rounded-xl border p-5"
                :style="{
                  background: severityConfig[group.severity].bg,
                  borderColor: severityConfig[group.severity].border,
                }"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      :style="{ background: severityConfig[group.severity].iconBg }">
                      <svg class="w-4 h-4" :style="{ color: severityConfig[group.severity].icon }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="group.severity === 'danger'"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                        <path v-else-if="group.severity === 'warn'"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
                        <path v-else
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-lg font-bold text-slate-800">{{ severityConfig[group.severity].label }}</p>
                      <p class="text-sm font-semibold text-slate-600">
                        {{ (riskCardIndexes[group.severity] || 0) + 1 }} of {{ group.clauses.length }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      :aria-label="`Previous ${severityConfig[group.severity].label} risk`"
                      :disabled="(riskCardIndexes[group.severity] || 0) === 0"
                      @click="setRiskCardIndex(group.severity, (riskCardIndexes[group.severity] || 0) - 1, group.clauses.length)"
                      class="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-all"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      :aria-label="`Next ${severityConfig[group.severity].label} risk`"
                      :disabled="(riskCardIndexes[group.severity] || 0) >= group.clauses.length - 1"
                      @click="setRiskCardIndex(group.severity, (riskCardIndexes[group.severity] || 0) + 1, group.clauses.length)"
                      class="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-all"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <article
                  v-if="currentRiskCard(group)"
                  class="bg-white rounded-xl border p-5 shadow-sm"
                  :style="{ borderColor: severityConfig[group.severity].border }"
                >
                  <div class="flex items-center justify-between gap-3 mb-4">
                    <h3 data-testid="risk-card-category" class="text-2xl font-bold text-slate-900 leading-tight">
                      {{ currentRiskCard(group).category }}
                    </h3>
                    <span class="text-sm font-semibold px-3 py-1 rounded-full text-white flex-shrink-0"
                      :style="{ background: severityConfig[group.severity].icon }">
                      {{ severityConfig[group.severity].label }}
                    </span>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <p class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">What the T&Cs say</p>
                      <p class="text-base text-slate-600 italic leading-relaxed border-l-4 pl-3" :style="{ borderColor: severityConfig[group.severity].border }">
                        "{{ currentRiskCard(group).clause }}"
                      </p>
                    </div>

                    <div>
                      <p class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">What this means for you</p>
                      <p class="text-lg text-slate-800 leading-relaxed font-medium">{{ currentRiskCard(group).consequence }}</p>
                    </div>

                    <div v-if="currentRiskCard(group).realCase"
                      class="rounded-lg p-4"
                      style="background: rgba(0,0,0,0.04);"
                    >
                      <p class="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Real case: {{ currentRiskCard(group).realCase.name }}</p>
                      <p class="text-base text-slate-600 leading-relaxed">{{ currentRiskCard(group).realCase.detail }}</p>
                    </div>
                  </div>
                </article>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
