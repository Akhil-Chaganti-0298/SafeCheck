<script setup>
import { computed } from 'vue'
import { parseWebsiteInput } from '../../../shared/websiteValidation.js'
import TrustScoreCard from './TrustScoreCard.vue'

const props = defineProps({
  url:                { type: String,  default: '' },
  loading:            { type: Boolean, default: false },
  error:              { type: String,  default: '' },
  result:             { type: Object,  default: null },
  showScoreBreakdown: { type: Boolean, default: false },
})

const emit = defineEmits(['update:url', 'submit', 'toggle-score-breakdown'])

const urlModel = computed({
  get: () => props.url,
  set: value => emit('update:url', value),
})

const previewDomain = computed(() => {
  if (!props.url.trim()) {
    return ''
  }

  return parseWebsiteInput(props.url)?.hostname || ''
})

function useExample(value) {
  emit('update:url', value)
}
</script>

<template>
  <div class="space-y-6 animate-fade-in-up">

    <!-- Open form - no card wrapper, content breathes freely on the page -->
    <div>
      <label for="url-input" class="block text-xl font-semibold text-slate-800 mb-3">
        Website address
      </label>
      <input
        id="url-input"
        v-model="urlModel"
        @keyup.enter="emit('submit')"
        type="text"
        placeholder="Paste any link or website address here"
        class="w-full border-2 rounded-xl px-5 py-5 text-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-transparent mb-2 transition shadow-sm"
        :class="props.error ? 'border-red-400' : 'border-slate-200'"
        style="font-size: 1.125rem;"
      />
      <p v-if="props.url.trim() && previewDomain" class="mb-3 text-[13px] text-slate-500">
        We will check: {{ previewDomain }}
      </p>
      <p class="mb-5 text-lg text-slate-600 leading-relaxed">
        Type or paste a website address. You do not need to include "https://". Any real web address works.
      </p>
      <div class="mb-5 flex flex-col gap-2">
        <button
          type="button"
          class="w-fit text-left text-base font-semibold text-slate-600 hover:text-slate-700 hover:underline focus-visible:outline-none focus-visible:underline"
          @click="useExample('amazon.com.au')"
        >
          Try a safe example: amazon.com.au
        </button>
        <button
          type="button"
          class="w-fit text-left text-base font-semibold text-slate-600 hover:text-slate-700 hover:underline focus-visible:outline-none focus-visible:underline"
          @click="useExample('paypa1-secure.com')"
        >
          Try a suspicious-looking example: paypa1-secure.com
        </button>
      </div>
      <div
        v-if="props.loading"
        class="mb-4 rounded-xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900"
        style="background-color: #fffbeb;"
      >
        Please allow SafeCheck up to 15 seconds to check this website.
      </div>
      <button
        @click="emit('submit')"
        :disabled="props.loading"
        class="btn-navy w-full py-5 text-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg v-if="props.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ props.loading ? 'Checking...' : 'Check this website' }}
      </button>
      <p v-if="props.error" class="mt-3 text-lg text-red-600 font-medium">{{ props.error }}</p>
    </div>

    <TrustScoreCard
      v-if="props.result"
      :result="props.result"
      :show-score-breakdown="props.showScoreBreakdown"
      @toggle-breakdown="emit('toggle-score-breakdown')"
    />

    <!-- Three reassurance tiles - stacked on mobile, 3-col on sm+ -->
    <div v-if="!props.result" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="badge in [
          { icon: 'flash', title: 'No account needed', body: 'Start checking right away. Nothing to sign up for' },
          { icon: 'chat',  title: 'Plain English',     body: 'Results explained simply, no technical words' },
          { icon: 'lock',  title: 'Private',           body: 'Nothing you type is saved or stored anywhere' },
        ]"
        :key="badge.title"
        class="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm"
      >
        <div class="flex justify-center mb-3">
          <svg v-if="badge.icon === 'flash'" class="w-9 h-9" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <svg v-else-if="badge.icon === 'chat'" class="w-9 h-9" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg v-else class="w-9 h-9" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-lg font-bold text-slate-800 mb-1">{{ badge.title }}</p>
        <p class="text-base text-slate-600 leading-snug">{{ badge.body }}</p>
      </div>
    </div>

    <!-- Disclaimer - Item 8: navy left border callout style -->
    <div
      class="rounded-xl px-5 py-4 flex gap-3 items-start"
      style="background-color: var(--navy-tint); border-left: 4px solid var(--navy); border-top: 1px solid #bfdbfe; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe;"
    >
      <svg class="w-6 h-6 flex-shrink-0 mt-0.5" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-base text-slate-700 leading-relaxed">
        <strong class="font-bold text-slate-900">Important:</strong> SafeCheck provides general guidance only. It cannot guarantee a website is completely safe. When in doubt, contact the organisation directly.
      </p>
    </div>

  </div>
</template>
