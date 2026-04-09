<script setup>
import { ref } from 'vue'

const inputMode = ref('url') // 'url' | 'text'
const inputValue = ref('')
const loading = ref(false)

function handleAnalyze() {
  if (!inputValue.value.trim()) return
  loading.value = true
  setTimeout(() => { loading.value = false }, 1500)
}
</script>

<template>
  <section id="tnc-simplifier" class="py-20 bg-gray-50 border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mb-10">
        <span class="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
          Feature #2
        </span>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">T&amp;C Simplifier</h2>
        <p class="text-gray-500 max-w-xl">
          Paste a URL or raw Terms &amp; Conditions text and our AI will extract the key risks —
          data collection, cancellation terms, and red flags — in plain English.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Input panel -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <!-- Toggle -->
            <div class="flex rounded-lg border border-gray-200 p-1 mb-4 bg-gray-50">
              <button
                @click="inputMode = 'url'"
                :class="inputMode === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 text-sm font-medium py-1.5 rounded-md transition-all"
              >
                URL
              </button>
              <button
                @click="inputMode = 'text'"
                :class="inputMode === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 text-sm font-medium py-1.5 rounded-md transition-all"
              >
                Paste Text
              </button>
            </div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ inputMode === 'url' ? 'Website URL' : 'Terms & Conditions Text' }}
            </label>

            <input
              v-if="inputMode === 'url'"
              v-model="inputValue"
              type="url"
              placeholder="https://example.com/terms"
              class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <textarea
              v-else
              v-model="inputValue"
              rows="6"
              placeholder="Paste the full Terms & Conditions text here..."
              class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            ></textarea>

            <button
              @click="handleAnalyze"
              :disabled="loading"
              class="mt-3 w-full bg-purple-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Analyzing...</span>
              <span v-else>Analyze</span>
            </button>
          </div>
        </div>

        <!-- Results skeleton -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Summary card -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Summary</p>
              <div class="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Red flags -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Red Flags</p>
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div class="w-4 h-4 rounded-full bg-red-200 animate-pulse flex-shrink-0 mt-0.5"></div>
                <div class="flex-1">
                  <div class="h-3 w-3/4 bg-red-100 rounded animate-pulse mb-1"></div>
                  <div class="h-3 w-full bg-red-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Key clauses -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Key Clauses</p>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="label in ['Data Collection', 'Cancellation', 'Auto-renewal', 'Data Sharing']" :key="label"
                class="p-3 border border-gray-100 rounded-lg">
                <p class="text-xs text-gray-500 mb-2">{{ label }}</p>
                <div class="h-3 w-full bg-gray-100 rounded animate-pulse mb-1"></div>
                <div class="h-3 w-2/3 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-400 text-center">Enter a URL or paste text above to analyze</p>
        </div>
      </div>
    </div>
  </section>
</template>
