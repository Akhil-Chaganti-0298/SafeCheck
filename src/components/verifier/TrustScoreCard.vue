<script setup>
import StatusIcon from '../StatusIcon.vue'

const props = defineProps({
  result:             { type: Object,  required: true },
  showScoreBreakdown: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-breakdown'])

// Risk-only colour mapping — never used for branding
const scoreStyle = {
  high: { text: 'text-green-700', bar: 'bg-green-600' },
  mid:  { text: 'text-amber-600', bar: 'bg-amber-500' },
  low:  { text: 'text-red-700',   bar: 'bg-red-600'   },
}

// Maps the internal category name to a shorter plain-English label
// shown as the row heading inside the score breakdown panel.
function plainLabel(label) {
  const labels = {
    'API Verification':  'Scam and threat lists',
    'HTTP Security':     'Connection security',
    'SSL/TLS Analysis':  'Website identity',
    'DNS Analysis':      'Website age',
  }
  return labels[label] ?? label
}

// One plain sentence shown below each row label explaining what that
// category actually checked, so Philip Morris understands the score.
function plainDescription(label) {
  const descriptions = {
    'API Verification':  'We checked this website against 4 different databases used by security experts to track scams, malware, and fake websites.',
    'HTTP Security':     'We checked whether your connection to this website is private and whether the website has set up the right protections for visitors.',
    'SSL/TLS Analysis':  'We checked whether this website has a valid identity certificate, who issued it, and whether your connection is properly encrypted.',
    'DNS Analysis':      'We checked how long this website has existed, whether it is properly registered, and whether its address appears on any known harmful lists.',
  }
  return descriptions[label] ?? ''
}

function scoreLevel(score) {
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 animate-slide-in-right">

    <!-- Score header -->
    <div class="flex items-center justify-between mb-3">
      <p class="text-base font-semibold text-slate-400 uppercase tracking-wide">Safety rating</p>
      <span class="text-5xl font-bold" :class="scoreStyle[scoreLevel(props.result.trustScore)].text">
        {{ props.result.trustScore }}<span class="text-xl font-medium text-slate-400">/100</span>
      </span>
    </div>

    <!-- Progress bar -->
    <div class="w-full bg-slate-100 rounded-full h-4 mb-4">
      <div
        class="h-4 rounded-full transition-all duration-700"
        :style="{ width: props.result.trustScore + '%' }"
        :class="scoreStyle[scoreLevel(props.result.trustScore)].bar"
      />
    </div>

    <!-- Plain-English summary -->
    <p class="text-xl text-slate-600 mb-5 leading-relaxed">
      <span v-if="props.result.trustScore >= 85">We found very few warning signs. This site looks safe.</span>
      <span v-else-if="props.result.trustScore >= 70">We found a couple of things to note. Read the details below before visiting.</span>
      <span v-else-if="props.result.trustScore >= 40">We found some warning signs. Please read the details carefully before visiting.</span>
      <span v-else>We found several serious warning signs. We recommend not visiting this site.</span>
    </p>

    <!-- Toggle for score breakdown -->
    <button
      @click="emit('toggle-breakdown')"
      class="text-lg text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:underline"
    >
      <svg class="w-5 h-5 transition-transform duration-200" :class="props.showScoreBreakdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
      How did we calculate this score?
    </button>

    <!-- Breakdown table -->
    <div v-if="props.showScoreBreakdown" class="mt-4 border-t border-slate-100 pt-4">
      <div class="space-y-3">
        <div
          v-for="cat in props.result.scoreCategories"
          :key="cat.label"
          class="rounded-xl px-4 py-3"
          :class="cat.status === 'pass' ? 'bg-green-50' : cat.status === 'warn' ? 'bg-amber-50' : 'bg-red-50'"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <StatusIcon :status="cat.status" size="sm" />
              <span class="text-base font-semibold text-slate-700">{{ plainLabel(cat.label) }}</span>
            </div>
            <span
              class="text-base font-bold"
              :class="cat.status === 'pass' ? 'text-green-700' : cat.status === 'warn' ? 'text-amber-600' : 'text-red-600'"
            >
              {{ cat.score }} / {{ cat.maxScore }}
            </span>
          </div>
          <p class="text-sm text-slate-500 mb-2 leading-relaxed">{{ plainDescription(cat.label) }}</p>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="cat.status === 'pass' ? 'bg-green-500' : cat.status === 'warn' ? 'bg-amber-500' : 'bg-red-500'"
              :style="{ width: (cat.score / cat.maxScore * 100) + '%' }"
            />
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between text-base font-semibold border-t border-slate-200 mt-3 pt-3 px-1">
        <span class="text-slate-700">Total safety score</span>
        <span :class="scoreStyle[scoreLevel(props.result.trustScore)].text">
          {{ props.result.trustScore }} / 100
        </span>
      </div>
    </div>

  </div>
</template>
