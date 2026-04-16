<script setup>
import { computed } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:url', 'submit'])

const urlModel = computed({
  get: () => props.url,
  set: value => emit('update:url', value),
})
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <label class="block text-lg font-medium text-gray-700 mb-3">Website address</label>
      <input
        v-model="urlModel"
        @keyup.enter="emit('submit')"
        type="text"
        placeholder="example.com, example.org "
        class="w-full border border-gray-200 rounded-xl px-5 py-4 text-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
        :class="props.error ? 'border-red-300' : ''"
      />
      <p class="mb-3 text-sm text-gray-500">
        Use a full website address with a valid domain extension. Any real extension works.
      </p>
      <button
        @click="emit('submit')"
        :disabled="props.loading"
        class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="props.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ props.loading ? 'Checking...' : 'Check website' }}
      </button>
      <p v-if="props.error" class="mt-2 text-base text-red-500">{{ props.error }}</p>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div class="flex justify-center mb-2">
          <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-gray-800 mb-1">No account needed</p>
        <p class="text-sm text-gray-500">You can check a site right away</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div class="flex justify-center mb-2">
          <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-gray-800 mb-1">Easy to read</p>
        <p class="text-sm text-gray-500">We use simple words</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div class="flex justify-center mb-2">
          <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-gray-800 mb-1">Private</p>
        <p class="text-sm text-gray-500">We do not save what you type</p>
      </div>
    </div>

    <div class="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3 items-start">
      <svg class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p class="text-base text-amber-800 leading-relaxed">
        <strong>Disclaimer:</strong> SafeCheck gives general guidance only. It cannot promise that a website is safe.
      </p>
    </div>
  </div>
</template>
