<script setup>
// This panel shows real Australian scam statistics — it loads independently of the URL check
const props = defineProps({
  scamStats: {
    type: Object,
    default: null,
  },
  // Highest report count in the list — used to scale the bar chart bars
  maxReports: {
    type: Number,
    default: 1,
  },
  // Adds a top margin when the URL result is also showing above this panel
  withTopMargin: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <!-- Green border matches the URL Verifier colour scheme -->
  <div class="bg-white rounded-2xl border border-green-200 p-6 animate-fade-in-up" :class="props.withTopMargin ? 'mt-4' : ''">

    <p class="text-lg font-semibold uppercase tracking-widest text-gray-400 mb-1">
      Real reports from Australia
    </p>
    <h3 class="text-2xl font-bold text-gray-900 mb-2">
      Why checking links matters for people over 65
    </h3>
    <p class="text-xl text-gray-500 mb-6 leading-relaxed">
      These numbers come from real scam reports filed with Scamwatch and the
      National Anti-Scam Centre — so you can see what is actually happening.
    </p>

    <!-- Live stats — shown once the API data has loaded -->
    <div v-if="props.scamStats">

      <!-- Two headline numbers at the top -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 rounded-xl p-5">
          <p class="text-3xl font-bold text-red-600">
            ${{ (Number(props.scamStats.summary.total_lost) / 1_000_000).toFixed(1) }}M+
          </p>
          <p class="text-xl text-gray-500 mt-1 leading-snug">
            lost by Australians 65+ through online scams
          </p>
        </div>
        <div class="bg-gray-50 rounded-xl p-5">
          <p class="text-3xl font-bold text-amber-600">
            {{ Number(props.scamStats.summary.total_reports).toLocaleString() }}
          </p>
          <p class="text-xl text-gray-500 mt-1 leading-snug">
            online scam reports from seniors on record
          </p>
        </div>
      </div>

      <p class="text-lg font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Most common online scams targeting seniors
      </p>

      <!-- Horizontal bar chart — bar width is proportional to the top scam type's count -->
      <div
        v-for="row in props.scamStats.topScamTypes"
        :key="row.scam_type"
        class="flex items-center gap-3 mb-3"
      >
        <span class="text-lg text-gray-500 w-44 text-right shrink-0">
          {{ row.scam_type }}
        </span>
        <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-red-500 transition-all duration-700"
            :style="{ width: (Number(row.total_reports) / props.maxReports * 100) + '%' }"
          />
        </div>
        <span class="text-lg text-gray-400 w-8 text-right shrink-0">
          {{ row.total_reports }}
        </span>
      </div>

      <p class="text-lg text-gray-300 mt-4">
        Source: Scamwatch &amp; NASC — 65+ age group, online contact method only
      </p>
    </div>

    <!-- Loading skeleton — shown while the stats are being fetched -->
    <div v-else class="space-y-3">
      <div v-for="i in 5" :key="i" class="flex gap-3 items-center">
        <div class="w-44 h-4 bg-gray-100 rounded animate-pulse shrink-0" />
        <div class="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>

  </div>
</template>
