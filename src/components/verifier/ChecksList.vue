<script setup>
import StatusIcon from '../StatusIcon.vue'

const props = defineProps({
  checks: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5">
    <p class="text-base font-semibold text-gray-400 uppercase tracking-wide mb-4">What we checked</p>
    <div class="space-y-4">
      <div v-for="check in props.checks" :key="check.label" class="flex items-start gap-3">
        <StatusIcon :status="check.status" class="mt-0.5" />
        <div>
          <p class="text-lg font-semibold text-gray-800">{{ check.label }}</p>
          <p class="text-base text-gray-500 mt-0.5">{{ check.detail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
