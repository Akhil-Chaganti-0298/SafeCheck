<script setup>
import { ref } from 'vue'

const url = ref('')
const loading = ref(false)

function handleSubmit() {
  if (!url.value.trim()) return
  loading.value = true
  // Placeholder: simulate loading
  setTimeout(() => { loading.value = false }, 1500)
}
</script>

<template>
  <section id="url-verifier" class="py-20 bg-white border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mb-10">
        <span class="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
          Feature #1
        </span>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">URL / Link Verifier</h2>
        <p class="text-gray-500 max-w-xl">
          Paste any link and we'll check it against Google Safe Browsing, PhishTank, VirusTotal, and WHOIS
          to give you an instant safety verdict.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Input panel -->
        <div class="lg:col-span-2">
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Enter a URL</label>
            <input
              v-model="url"
              type="url"
              placeholder="https://example.com"
              class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              @click="handleSubmit"
              :disabled="loading"
              class="mt-3 w-full bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Checking...</span>
              <span v-else>Check Link</span>
            </button>

            <div class="mt-4 border-t border-gray-200 pt-4">
              <p class="text-xs text-gray-400 mb-2">Data sources</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="src in ['Google Safe Browsing', 'PhishTank', 'VirusTotal', 'WHOIS']" :key="src"
                  class="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-md">
                  {{ src }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Results skeleton -->
        <div class="lg:col-span-3">
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <!-- Result header skeleton -->
            <div class="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div class="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div class="h-3 w-48 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div class="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            <!-- Score bars skeleton -->
            <div class="px-6 py-5 space-y-4">
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Check results</p>
              <div v-for="i in 4" :key="i" class="flex items-center gap-4">
                <div class="h-3 w-24 bg-gray-100 rounded animate-pulse flex-shrink-0"></div>
                <div class="flex-1 bg-gray-100 rounded-full h-2 animate-pulse"></div>
                <div class="h-3 w-12 bg-gray-100 rounded animate-pulse flex-shrink-0"></div>
              </div>
            </div>

            <!-- Details skeleton -->
            <div class="border-t border-gray-100 px-6 py-5 space-y-3">
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Details</p>
              <div v-for="i in 3" :key="i" class="flex items-start gap-3">
                <div class="w-4 h-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0 mt-0.5"></div>
                <div class="flex-1">
                  <div class="h-3 w-full bg-gray-100 rounded animate-pulse mb-1"></div>
                  <div class="h-3 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <p class="text-xs text-gray-400 text-center">Enter a URL above to see your safety report</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
