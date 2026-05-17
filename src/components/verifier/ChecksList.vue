<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  checkGroups: { type: Array, default: () => [] },
})

// Track which groups are expanded. Use an object for better Vue reactivity.
const expanded = ref({})
const viewMode = ref('cards')
const cardIndexes = ref({
  danger: 0,
  warn: 0,
  pass: 0,
})

function toggle(id) {
  expanded.value[id] = !expanded.value[id]
}

function setViewMode(mode) {
  viewMode.value = mode
}

const statusOrder = ['danger', 'warn', 'pass']

const statusLabels = {
  danger: 'High concern',
  warn: 'Worth noting',
  pass: 'Passed checks',
}

const cardGroups = computed(() => {
  return statusOrder
    .map((status) => ({
      status,
      groups: props.checkGroups.filter((group) => group.status === status),
    }))
    .filter((group) => group.groups.length > 0)
})

function currentCard(group) {
  const index = cardIndexes.value[group.status] || 0
  return group.groups[Math.min(index, group.groups.length - 1)]
}

function setCardIndex(status, index, total) {
  cardIndexes.value = {
    ...cardIndexes.value,
    [status]: Math.min(Math.max(index, 0), total - 1),
  }
}

watch(
  () => props.checkGroups,
  () => {
    viewMode.value = 'cards'
    cardIndexes.value = { danger: 0, warn: 0, pass: 0 }
    expanded.value = {}
  },
)

// Colour mappings for group status
const headerBg = {
  pass:   'bg-white',
  warn:   'bg-amber-50',
  danger: 'bg-red-50',
}

const badgeClasses = {
  pass:   'bg-green-100 text-green-800',
  warn:   'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
}

const iconBg = {
  pass:   'bg-green-100',
  warn:   'bg-amber-100',
  danger: 'bg-red-100',
}

const iconStroke = {
  pass:   'text-green-600',
  warn:   'text-amber-600',
  danger: 'text-red-600',
}

const dotBg = {
  pass:   'bg-green-500',
  warn:   'bg-amber-500',
  danger: 'bg-red-500',
}

const cardBorder = {
  pass:   '#86efac',
  warn:   '#fde68a',
  danger: '#fca5a5',
}

const cardBg = {
  pass:   '#f0fdf4',
  warn:   '#fffbeb',
  danger: '#fef2f2',
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
      <p class="text-base font-semibold text-slate-400 uppercase tracking-wide">What we found</p>
      <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          @click="setViewMode('full')"
          class="px-4 py-2 rounded-lg text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
          :class="viewMode === 'full' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
          :style="viewMode === 'full' ? 'background-color: var(--navy);' : ''"
        >
          Full summary
        </button>
        <button
          type="button"
          @click="setViewMode('cards')"
          class="px-4 py-2 rounded-lg text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
          :class="viewMode === 'cards' ? 'text-white' : 'text-slate-600 hover:text-slate-800'"
          :style="viewMode === 'cards' ? 'background-color: var(--navy);' : ''"
        >
          Risk cards
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'full'" class="space-y-3">
      <div
        v-for="group in props.checkGroups"
        :key="group.id"
        class="rounded-2xl border border-slate-200 overflow-hidden animate-slide-in-right"
      >
        <!-- Group summary row -->
        <div class="flex items-center gap-4 p-5" :class="headerBg[group.status]">

          <!-- Status icon -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="iconBg[group.status]"
          >
            <svg v-if="group.status === 'pass'" class="w-5 h-5" :class="iconStroke[group.status]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="group.status === 'danger'" class="w-5 h-5" :class="iconStroke[group.status]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else class="w-5 h-5" :class="iconStroke[group.status]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
            </svg>
          </div>

          <!-- Summary text -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <p class="text-lg font-semibold text-slate-800">{{ group.summary }}</p>
              <span
                class="text-sm font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                :class="badgeClasses[group.status]"
              >
                {{ group.badge }}
              </span>
            </div>
            <p class="text-base text-slate-500 leading-relaxed">{{ group.detail }}</p>
          </div>
        </div>

        <!-- Expanded detail rows -->
        <div v-if="expanded[group.id] && group.items.length > 0" class="border-t border-slate-100">
          <div
            v-for="(item, index) in group.items"
            :key="index"
            class="flex items-start gap-3 px-5 py-4"
            :class="index < group.items.length - 1 ? 'border-b border-slate-100' : ''"
          >
            <!-- Small dot indicator -->
            <div
              class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
              :class="dotBg[item.status]"
            />
            <div>
              <p class="text-base font-semibold text-slate-700">{{ item.label }}</p>
              <p class="text-base text-slate-500 mt-0.5 leading-relaxed">{{ item.detail }}</p>
            </div>
          </div>
        </div>

        <!-- Toggle button (only show if there are items to expand) -->
        <button
          v-if="group.items.length > 0"
          @click="toggle(group.id)"
          class="w-full flex items-center gap-2 px-5 py-3 text-base text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
        >
          <svg
            class="w-4 h-4 transition-transform duration-200 flex-shrink-0"
            :class="expanded[group.id] ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          {{ expanded[group.id] ? 'Hide detail' : 'Show more detail' }}
        </button>
      </div>
    </div>

    <div v-else class="space-y-5">
      <section
        v-for="group in cardGroups"
        :key="group.status"
        class="rounded-2xl border p-5 animate-slide-in-right"
        :style="{
          background: cardBg[group.status],
          borderColor: cardBorder[group.status],
        }"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="iconBg[group.status]"
            >
              <svg v-if="group.status === 'pass'" class="w-5 h-5" :class="iconStroke[group.status]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="group.status === 'danger'" class="w-5 h-5" :class="iconStroke[group.status]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else class="w-5 h-5" :class="iconStroke[group.status]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <div>
              <p class="text-lg font-bold text-slate-800">{{ statusLabels[group.status] }}</p>
              <p class="text-sm font-semibold text-slate-600">
                {{ (cardIndexes[group.status] || 0) + 1 }} of {{ group.groups.length }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              :aria-label="`Previous ${statusLabels[group.status]} risk card`"
              :disabled="(cardIndexes[group.status] || 0) === 0"
              @click="setCardIndex(group.status, (cardIndexes[group.status] || 0) - 1, group.groups.length)"
              class="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              :aria-label="`Next ${statusLabels[group.status]} risk card`"
              :disabled="(cardIndexes[group.status] || 0) >= group.groups.length - 1"
              @click="setCardIndex(group.status, (cardIndexes[group.status] || 0) + 1, group.groups.length)"
              class="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="currentCard(group)" class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 data-testid="url-risk-card-title" class="text-2xl font-bold text-slate-900 leading-tight">
                {{ currentCard(group).summary }}
              </h3>
              <p class="text-lg text-slate-700 leading-relaxed mt-2">
                {{ currentCard(group).detail }}
              </p>
            </div>
            <span
              class="text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0"
              :class="badgeClasses[currentCard(group).status]"
            >
              {{ currentCard(group).badge }}
            </span>
          </div>

          <div v-if="currentCard(group).items.length > 0" class="space-y-3">
            <div
              v-for="(item, index) in currentCard(group).items"
              :key="index"
              class="flex items-start gap-3 rounded-xl bg-white/75 border border-white px-4 py-3"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                :class="dotBg[item.status]"
              />
              <div>
                <p class="text-base font-semibold text-slate-800">{{ item.label }}</p>
                <p class="text-base text-slate-600 mt-0.5 leading-relaxed">{{ item.detail }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>
