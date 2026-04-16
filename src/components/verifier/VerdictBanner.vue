<script setup>
// This banner is the first thing shown after a check — it needs to be clear at a glance
const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  // Colour/style object — passed in from the container so all theming lives in one place
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
  <!-- Slides in from the right when the result arrives — feels snappy -->
  <div class="rounded-2xl border p-6 flex items-start gap-4 animate-slide-in-right" :class="props.vc.banner">

    <!-- Circular icon — green tick, red cross, or amber warning depending on verdict -->
    <div class="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" :class="props.vc.icon">
      <svg class="w-7 h-7" :class="props.vc.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="props.result.verdict === 'safe'"         stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        <path v-else-if="props.result.verdict === 'unsafe'"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        <path v-else                                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
      </svg>
    </div>

    <div class="flex-1">
      <!-- Headline — made large so it's readable at a glance for older users -->
      <p class="font-bold text-2xl" :class="props.vc.title">
        <span v-if="props.result.verdict === 'safe'">This website looks safe</span>
        <span v-else-if="props.result.verdict === 'unsafe'">This website may be risky</span>
        <span v-else>Please be careful</span>
      </p>
      <p class="text-xl mt-1" :class="props.vc.subtitle">Website: {{ props.result.hostname }}</p>

      <!-- List of specific risk factors — only shown when there are any -->
      <ul v-if="props.result.riskFactors.length" class="mt-3 space-y-1">
        <li v-for="rf in props.result.riskFactors" :key="rf" class="flex items-start gap-1.5 text-xl text-red-700">
          <span class="mt-0.5">•</span> {{ rf }}
        </li>
      </ul>
    </div>

    <!-- Pill badge in the top-right corner — Safe / Unsafe / Be careful -->
    <span class="text-lg font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide" :class="props.vc.badge">
      {{ props.verdictLabel }}
    </span>

  </div>
</template>
