<script setup>
import { ref } from 'vue'

const props = defineProps({
  checkGroups: { type: Array, default: () => [] },
})

// Track which groups are expanded. Use an object for better Vue reactivity.
const expanded = ref({})

function toggle(id) {
  expanded.value[id] = !expanded.value[id]
}

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
</script>

<template>
  <div class="space-y-3">
    <p class="text-base font-semibold text-slate-400 uppercase tracking-wide px-1">What we found</p>

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
</template>
