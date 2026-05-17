<script setup>
import { computed } from 'vue'

const props = defineProps({
  scamStats:     { type: Object,  default: null  },
  maxReports:    { type: Number,  default: 1     },
  withTopMargin: { type: Boolean, default: false },
})

const chartRows = computed(() => props.scamStats?.topScamTypes?.slice(0, 5) || [])

const summaryStats = computed(() => {
  const totalLost = Number(props.scamStats?.summary?.total_lost) || 0
  const totalReports = Number(props.scamStats?.summary?.total_reports) || 0

  return [
    {
      label: 'Reported losses',
      value: `$${(totalLost / 1_000_000).toFixed(1)}M+`,
      helper: 'from online scams affecting Australians 65+',
    },
    {
      label: 'Senior reports',
      value: totalReports.toLocaleString('en-AU'),
      helper: 'online scam reports in the dataset',
    },
  ]
})

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-AU')
}

function getBarWidth(value) {
  return `${((Number(value) || 0) / Math.max(props.maxReports, 1)) * 100}%`
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 animate-fade-in-up"
    :class="props.withTopMargin ? 'mt-4' : ''"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Real Australian data
        </p>
        <h3 class="text-2xl font-bold text-slate-900">
          Online scams affecting people over 65
        </h3>
      </div>
      <p class="text-sm text-slate-400">
        Scamwatch &amp; NASC
      </p>
    </div>

    <div v-if="props.scamStats">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div
          v-for="stat in summaryStats"
          :key="stat.label"
          class="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {{ stat.label }}
          </p>
          <p class="text-3xl font-bold mt-1" style="color: var(--navy);">
            {{ stat.value }}
          </p>
          <p class="text-base text-slate-600 leading-snug mt-1">
            {{ stat.helper }}
          </p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 p-4">
        <div class="flex items-center justify-between gap-3 mb-4">
          <p class="text-base font-semibold uppercase tracking-widest text-slate-400">
            Most reported scam types
          </p>
          <p class="text-sm text-slate-400 shrink-0">
            Reports
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="row in chartRows"
            :key="row.scam_type"
            class="grid gap-2"
          >
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-base font-semibold text-slate-700 leading-tight">{{ row.scam_type }}</span>
              <span class="text-base font-bold shrink-0" style="color: var(--navy);">
                {{ formatNumber(row.total_reports) }}
              </span>
            </div>
            <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                style="background-color: var(--navy);"
                :style="{ width: getBarWidth(row.total_reports) }"
              />
            </div>
          </div>
        </div>
      </div>

      <p class="text-sm text-slate-400 mt-4 leading-relaxed">
        65+ age group, online contact method only.
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-else class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="i in 2" :key="i" class="h-24 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-for="i in 5" :key="`bar-${i}`" class="grid gap-2">
        <div class="w-2/3 h-4 bg-slate-100 rounded animate-pulse" />
        <div class="h-3 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>

  </div>
</template>
