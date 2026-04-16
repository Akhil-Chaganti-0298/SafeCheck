<script setup>
const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  vc: {
    type: Object,
    required: true,
  },
  verdictLabel: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-2xl border p-5 flex items-start gap-4" :class="props.vc.banner">
    <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" :class="props.vc.icon">
      <svg class="w-6 h-6" :class="props.vc.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="props.result.verdict === 'safe'"         stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        <path v-else-if="props.result.verdict === 'unsafe'"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        <path v-else                                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
      </svg>
    </div>
    <div class="flex-1">
      <p class="font-bold text-xl" :class="props.vc.title">
        <span v-if="props.result.verdict === 'safe'">This website looks safe</span>
        <span v-else-if="props.result.verdict === 'unsafe'">This website may be risky</span>
        <span v-else>Please be careful</span>
      </p>
      <p class="text-base mt-1" :class="props.vc.subtitle">Website: {{ props.result.hostname }}</p>
      <ul v-if="props.result.riskFactors.length" class="mt-2 space-y-1">
        <li v-for="rf in props.result.riskFactors" :key="rf" class="flex items-start gap-1.5 text-base text-red-700">
          <span class="mt-0.5">•</span> {{ rf }}
        </li>
      </ul>
    </div>
    <span class="text-sm font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide" :class="props.vc.badge">
      {{ props.verdictLabel }}
    </span>
  </div>
</template>
