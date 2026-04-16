<script setup>
import StatusIcon from '../StatusIcon.vue'

// Receives the list of individual checks from the container
const props = defineProps({
  checks: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <!-- Green border keeps this card consistent with everything else on the URL Verifier page -->
  <div class="bg-white rounded-2xl border border-green-200 p-6 animate-slide-in-right">
    <p class="text-lg font-semibold text-gray-400 uppercase tracking-wide mb-4">What we checked</p>
    <div class="space-y-5">
      <!-- Each check has a coloured status icon + a label + a plain-English detail line -->
      <div v-for="check in props.checks" :key="check.label" class="flex items-start gap-3">
        <StatusIcon :status="check.status" class="mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-xl font-semibold text-gray-800">{{ check.label }}</p>
          <p class="text-xl text-gray-500 mt-0.5">{{ check.detail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
