<script setup>
import { computed } from 'vue'

const props = defineProps({
  url:     { type: String,  default: '' },
  loading: { type: Boolean, default: false },
  error:   { type: String,  default: '' },
})

const emit = defineEmits(['update:url', 'submit'])

const urlModel = computed({
  get: () => props.url,
  set: value => emit('update:url', value),
})
</script>

<template>
  <div class="space-y-4">

    <!-- Main input card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up">
      <label for="url-input" class="block text-xl font-semibold text-slate-800 mb-3">
        Website address
      </label>
      <input
        id="url-input"
        v-model="urlModel"
        @keyup.enter="emit('submit')"
        type="text"
        placeholder="e.g. example.com or https://example.com"
        class="w-full border rounded-xl px-5 py-4 text-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-3 focus:border-transparent mb-3 transition"
        :class="props.error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'"
        style="font-size: 1.125rem;"
      />
      <p class="mb-4 text-base text-slate-500 leading-relaxed">
        Type or paste a website address. You do not need to include "https://" — any real web address works.
      </p>
      <button
        @click="emit('submit')"
        :disabled="props.loading"
        class="btn-navy w-full py-4 text-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg v-if="props.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ props.loading ? 'Checking...' : 'Check this website' }}
      </button>
      <p v-if="props.error" class="mt-3 text-lg text-red-600 font-medium">{{ props.error }}</p>
    </div>

    <!-- Three reassurance badges -->
    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="badge in [
          { icon: 'flash', title: 'No account needed', body: 'Check right away' },
          { icon: 'chat',  title: 'Plain English',     body: 'No technical words' },
          { icon: 'lock',  title: 'Private',           body: 'Nothing is saved' },
        ]"
        :key="badge.title"
        class="bg-white border border-slate-200 rounded-xl p-4 text-center animate-fade-in-up"
      >
        <div class="flex justify-center mb-2">
          <svg v-if="badge.icon === 'flash'" class="w-7 h-7" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <svg v-else-if="badge.icon === 'chat'" class="w-7 h-7" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg v-else class="w-7 h-7" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-base font-semibold text-slate-800 mb-0.5">{{ badge.title }}</p>
        <p class="text-sm text-slate-500">{{ badge.body }}</p>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex gap-3 items-start animate-fade-in-up">
      <svg class="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-base text-slate-700 leading-relaxed">
        <strong>Important:</strong> SafeCheck provides general guidance only. It cannot guarantee a website is completely safe. When in doubt, contact the organisation directly.
      </p>
    </div>

  </div>
</template>
