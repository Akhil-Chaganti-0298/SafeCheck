<script setup>
import { ref } from 'vue'

// Which input mode the user has selected — URL or pasted text
const inputMode = ref('url')
const inputValue = ref('')
const loading = ref(false)
const hasResult = ref(false)

function handleAnalyze() {
  if (!inputValue.value.trim()) return
  loading.value = true
  hasResult.value = false
  // TODO: replace this timeout with a real API call once the backend is ready
  setTimeout(() => {
    loading.value = false
    hasResult.value = true
  }, 1500)
}
</script>

<template>
  <!-- Purple is the colour for the T&C Simplifier throughout the whole site -->
  <section id="tnc-simplifier" class="py-20 bg-gray-50 border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="mb-10 animate-fade-in-up">
        <h2 class="text-5xl font-bold text-gray-900 mb-4">T&amp;C Simplifier</h2>
        <p class="text-2xl text-gray-500 max-w-xl leading-relaxed">
          Paste a link or the full text and get a plain-English breakdown of what you are agreeing to —
          data sharing, cancellation terms, and anything else worth knowing before you sign up.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

        <!-- Left: input card — purple border matches the T&C brand colour -->
        <div class="lg:col-span-2 animate-fade-in-up">
          <div class="bg-white border border-purple-200 rounded-xl p-6">

            <!-- URL / Paste Text toggle -->
            <div class="flex rounded-lg border border-gray-200 p-1 mb-5 bg-gray-50">
              <button
                @click="inputMode = 'url'"
                :class="inputMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 text-xl font-medium py-3 rounded-md transition-all"
              >
                URL
              </button>
              <button
                @click="inputMode = 'text'"
                :class="inputMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                class="flex-1 text-xl font-medium py-3 rounded-md transition-all"
              >
                Paste Text
              </button>
            </div>

            <label class="block text-xl font-medium text-gray-700 mb-2">
              {{ inputMode === 'url' ? 'Website URL' : 'Terms & Conditions Text' }}
            </label>

            <!-- Focus ring matches the purple brand colour -->
            <input
              v-if="inputMode === 'url'"
              v-model="inputValue"
              type="url"
              placeholder="https://example.com/terms"
              class="w-full border border-gray-200 rounded-xl px-5 py-4 text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <textarea
              v-else
              v-model="inputValue"
              rows="6"
              placeholder="Paste the full Terms &amp; Conditions text here..."
              class="w-full border border-gray-200 rounded-xl px-5 py-4 text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition"
            ></textarea>

            <button
              @click="handleAnalyze"
              :disabled="loading"
              class="mt-4 w-full bg-purple-600 text-white text-xl font-semibold py-4 rounded-xl hover:bg-purple-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <span v-if="loading">Analysing...</span>
              <span v-else>Analyse</span>
            </button>
          </div>
        </div>

        <!-- Right: result panels -->
        <div class="lg:col-span-3">
          <div v-if="!loading && !hasResult" class="flex items-center justify-center h-full min-h-48 animate-fade-in-up">
            <p class="text-2xl text-gray-400 text-center">Enter a URL or paste text above to analyse</p>
          </div>

          <div v-if="loading || hasResult" class="space-y-4 animate-slide-in-right">

            <!-- Summary card -->
            <div class="bg-white border border-purple-200 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-lg font-medium text-gray-400 uppercase tracking-wide">Summary</p>
                <div class="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
              <div class="space-y-2">
                <div class="h-5 w-full bg-gray-100 rounded animate-pulse"></div>
                <div class="h-5 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                <div class="h-5 w-4/6 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>

            <!-- Red flags — things worth knowing before signing up -->
            <div class="bg-white border border-purple-200 rounded-xl p-6">
              <p class="text-lg font-medium text-gray-400 uppercase tracking-wide mb-4">Red Flags</p>
              <div class="space-y-3">
                <div v-for="i in 3" :key="i" class="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div class="w-5 h-5 rounded-full bg-red-200 animate-pulse flex-shrink-0 mt-0.5"></div>
                  <div class="flex-1">
                    <div class="h-4 w-3/4 bg-red-100 rounded animate-pulse mb-1"></div>
                    <div class="h-4 w-full bg-red-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Key clauses grid -->
            <div class="bg-white border border-purple-200 rounded-xl p-6">
              <p class="text-lg font-medium text-gray-400 uppercase tracking-wide mb-4">Key Clauses</p>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="label in ['Data Collection', 'Cancellation', 'Auto-renewal', 'Data Sharing']"
                  :key="label"
                  class="p-4 border border-purple-100 rounded-lg"
                >
                  <p class="text-xl text-gray-500 mb-2">{{ label }}</p>
                  <div class="h-4 w-full bg-gray-100 rounded animate-pulse mb-1"></div>
                  <div class="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>
