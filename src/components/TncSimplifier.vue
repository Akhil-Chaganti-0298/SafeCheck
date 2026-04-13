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
  setTimeout(() => {
    loading.value = false
    hasResult.value = true
  }, 1500)
}
</script>

<template>
  <section id="tnc-simplifier" class="py-20 bg-gray-50 border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-10">
        <h2 class="text-4xl font-bold text-gray-900 mb-3">T&amp;C Simplifier</h2>
        <p class="text-gray-500 text-lg max-w-xl leading-relaxed">
          Paste a link or the full text and get a plain-English breakdown of what you are agreeing to —
          data sharing, cancellation terms, and anything else worth knowing before you sign up.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex rounded-lg border border-gray-200 p-1 mb-4 bg-gray-50">
              <button
                @click="inputMode = 'url'"
                :class="inputMode === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 text-base font-medium py-2.5 rounded-md transition-all"
              >
                URL
              </button>
              <button
                @click="inputMode = 'text'"
                :class="inputMode === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 text-base font-medium py-2.5 rounded-md transition-all"
              >
                Paste Text
              </button>
            </div>

            <label class="block text-lg font-medium text-gray-700 mb-2">
              {{ inputMode === 'url' ? 'Website URL' : 'Terms & Conditions Text' }}
            </label>

            <input
              v-if="inputMode === 'url'"
              v-model="inputValue"
              type="url"
              placeholder="https://example.com/terms"
              class="w-full border border-gray-200 rounded-xl px-5 py-4 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <textarea
              v-else
              v-model="inputValue"
              rows="6"
              placeholder="Paste the full Terms & Conditions text here..."
              class="w-full border border-gray-200 rounded-xl px-5 py-4 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            ></textarea>

            <button
              @click="handleAnalyze"
              :disabled="loading"
              class="mt-3 w-full bg-purple-600 text-white text-lg font-semibold py-4 rounded-xl hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Analyzing...</span>
              <span v-else>Analyze</span>
            </button>
          </div>
        </div>

        <div class="lg:col-span-3">
          <div v-if="!loading && !hasResult" class="flex items-center justify-center h-full min-h-48">
            <p class="text-lg text-gray-400 text-center">Enter a URL or paste text above to analyze</p>
          </div>

          <div v-if="loading || hasResult" class="space-y-4">
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-base font-medium text-gray-400 uppercase tracking-wide">Summary</p>
                <div class="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div class="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                <div class="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <p class="text-base font-medium text-gray-400 uppercase tracking-wide mb-4">Red Flags</p>
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

            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <p class="text-base font-medium text-gray-400 uppercase tracking-wide mb-4">Key Clauses</p>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="label in ['Data Collection', 'Cancellation', 'Auto-renewal', 'Data Sharing']" :key="label"
                  class="p-4 border border-gray-100 rounded-lg">
                  <p class="text-base text-gray-500 mb-2">{{ label }}</p>
                  <div class="h-3 w-full bg-gray-100 rounded animate-pulse mb-1"></div>
                  <div class="h-3 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
