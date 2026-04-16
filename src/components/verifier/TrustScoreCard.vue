<script setup>
import StatusIcon from '../StatusIcon.vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  showScoreBreakdown: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-breakdown'])

const scoreStyle = {
  high: { text: 'text-green-600', bar: 'bg-green-500' },
  mid:  { text: 'text-amber-500', bar: 'bg-amber-400' },
  low:  { text: 'text-red-600',   bar: 'bg-red-500'   },
}

function scoreLevel(score) {
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-3">
      <p class="text-base font-semibold text-gray-400 uppercase tracking-wide">Safety rating</p>
      <span class="text-4xl font-bold" :class="scoreStyle[scoreLevel(props.result.trustScore)].text">
        {{ props.result.trustScore }}<span class="text-lg font-medium text-gray-400">/100</span>
      </span>
    </div>
    <div class="w-full bg-gray-100 rounded-full h-4 mb-3">
      <div
        class="h-4 rounded-full transition-all duration-500"
        :style="{ width: props.result.trustScore + '%' }"
        :class="scoreStyle[scoreLevel(props.result.trustScore)].bar"
      />
    </div>
    <p class="text-base text-gray-500 mb-3">
      <span v-if="props.result.trustScore >= 85">We found very few warning signs. This site looks safe.</span>
      <span v-else-if="props.result.trustScore >= 70">We found a couple of things to note. Take a look below before visiting.</span>
      <span v-else-if="props.result.trustScore >= 40">We found some warning signs. Please read the details below carefully.</span>
      <span v-else>We found several warning signs. We recommend not visiting this site.</span>
    </p>
    <button
      @click="emit('toggle-breakdown')"
      class="text-base text-gray-400 hover:text-gray-600 flex items-center gap-2 transition-colors"
    >
      <svg class="w-4 h-4 transition-transform duration-200" :class="props.showScoreBreakdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
      How did we decide this?
    </button>
    <div v-if="props.showScoreBreakdown" class="mt-3 border-t border-gray-100 pt-3">
      <div class="grid grid-cols-12 text-base font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
        <span class="col-span-5">Check</span>
        <span class="col-span-4">What we found</span>
        <span class="col-span-2 text-right">Worth</span>
        <span class="col-span-1 text-right">Lost</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="cat in props.result.scoreCategories"
          :key="cat.label"
          class="grid grid-cols-12 items-start text-base px-2 py-2.5 rounded-lg"
          :class="cat.status === 'pass' ? 'bg-green-50' : cat.status === 'warn' ? 'bg-amber-50' : 'bg-red-50'"
        >
          <div class="col-span-5 flex items-center gap-1.5">
            <StatusIcon :status="cat.status || (cat.passed ? 'pass' : 'danger')" size="sm" />
            <span class="font-medium text-gray-700">{{ cat.label }}</span>
          </div>
          <span class="col-span-4 text-gray-500 leading-tight">{{ cat.detail }}</span>
          <span class="col-span-2 text-right text-gray-400">{{ cat.maxDeduction }} marks</span>
          <span class="col-span-1 text-right font-semibold" :class="cat.deduction === 0 ? 'text-green-600' : 'text-red-500'">
            {{ cat.deduction === 0 ? '0' : cat.deduction }}
          </span>
        </div>
      </div>
      <div class="grid grid-cols-12 text-base font-semibold border-t border-gray-200 mt-2 pt-2 px-1">
        <span class="col-span-11 text-gray-700">Your score — we start at 100 and remove marks for each warning sign found</span>
        <span class="col-span-1 text-right" :class="scoreStyle[scoreLevel(props.result.trustScore)].text">{{ props.result.trustScore }}</span>
      </div>
    </div>
  </div>
</template>
