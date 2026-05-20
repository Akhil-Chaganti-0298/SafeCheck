<script setup>
import { ref } from 'vue'

const props = defineProps({
  result:       { type: Object, required: true },
  vc:           { type: Object, required: true },
  verdictLabel: { type: String, required: true },
})

const showClickedHelp = ref(false)

const boldTheme = {
  safe:    { bg: '#f0fdf4', border: '#16a34a', icon: '#16a34a', iconBg: '#dcfce7', text: '#14532d', badge: '#16a34a' },
  warning: { bg: '#fffbeb', border: '#d97706', icon: '#d97706', iconBg: '#fef3c7', text: '#78350f', badge: '#d97706' },
  unsafe:  { bg: '#fef2f2', border: '#dc2626', icon: '#dc2626', iconBg: '#fee2e2', text: '#7f1d1d', badge: '#dc2626' },
}

const theme = props.result?.verdict ? boldTheme[props.result.verdict] : boldTheme.warning

const borderWidth = props.result?.verdict === 'unsafe' ? 'border-4' : 'border-4'
</script>

<template>
  <div
    class="rounded-2xl animate-slide-in-right"
    :class="[borderWidth, props.result.verdict === 'unsafe' ? 'verdict-banner-unsafe' : 'p-6']"
    :style="{
      background: theme.bg,
      borderColor: theme.border,
    }"
  >

    <!-- Icon + verdict badge row -->
    <div
      class="flex items-center justify-between"
      :class="props.result.verdict === 'unsafe' ? 'mb-3' : 'mb-4'"
    >
      <div
        class="rounded-full flex items-center justify-center flex-shrink-0"
        :class="props.result.verdict === 'unsafe' ? 'w-12 h-12' : 'w-16 h-16'"
        :style="{ background: theme.iconBg }"
      >
        <svg
          :class="props.result.verdict === 'unsafe' ? 'w-7 h-7' : 'w-9 h-9'"
          :style="{ color: theme.icon }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path v-if="props.result.verdict === 'safe'"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          <path v-else-if="props.result.verdict === 'unsafe'"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          <path v-else
            stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01" />
        </svg>
      </div>

      <span
        class="font-bold rounded-full text-white uppercase tracking-wide"
        :class="props.result.verdict === 'unsafe' ? 'text-base px-4 py-1.5' : 'text-lg px-5 py-2'"
        :style="{ background: theme.badge }"
      >
        {{ props.verdictLabel }}
      </span>
    </div>

    <!-- Primary verdict headline - size scales by urgency -->
    <p
      class="font-bold leading-tight mb-3"
      :class="props.result.verdict === 'unsafe'
        ? 'verdict-unsafe-headline'
        : props.result.verdict === 'warning'
          ? 'text-3xl sm:text-4xl'
          : 'text-3xl sm:text-4xl'"
      :style="{ color: theme.text }"
    >
      <span v-if="props.result.verdict === 'safe'">This website looks safe to visit</span>
      <span v-else-if="props.result.verdict === 'unsafe'">This website is NOT safe. Do not click any links on it</span>
      <span v-else>Be careful before visiting this website</span>
    </p>

    <p
      :class="props.result.verdict === 'unsafe' ? 'text-lg mb-3' : 'text-xl mb-4'"
      :style="{ color: theme.text, opacity: 0.85 }"
    >
      Website checked: <strong>{{ props.result.hostname }}</strong>
    </p>

    <!-- Risk factors -->
    <div
      v-if="props.result.riskFactors.length"
      class="mt-3 rounded-xl"
      :class="props.result.verdict === 'unsafe' ? 'p-2.5' : 'p-4'"
      :style="{ background: 'rgba(0,0,0,0.04)' }"
    >
      <p
        class="font-semibold"
        :class="props.result.verdict === 'unsafe' ? 'text-base mb-1.5' : 'text-lg mb-2'"
        :style="{ color: theme.text }"
      >
        Warning signs found:
      </p>
      <ul :class="props.result.verdict === 'unsafe' ? 'space-y-1' : 'space-y-2'">
        <li
          v-for="rf in props.result.riskFactors"
          :key="rf"
          class="flex items-start gap-2 font-medium"
          :class="props.result.verdict === 'unsafe' ? 'text-base' : 'text-lg'"
          :style="{ color: theme.text }"
        >
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {{ rf }}
        </li>
      </ul>
    </div>

    <!-- Safe reassurance -->
    <div v-if="props.result.verdict === 'safe'" class="mt-4 text-lg" :style="{ color: theme.text, opacity: 0.85 }">
      Our checks found no known threats. See the details below for the full picture.
    </div>

    <!-- Unsafe action prompt -->
    <div v-if="props.result.verdict === 'unsafe'" class="mt-3 rounded-xl p-2.5" :style="{ background: 'rgba(220,38,38,0.08)' }">
      <p class="text-lg font-bold" :style="{ color: theme.text }">What to do:</p>
      <ul class="mt-1.5 space-y-1">
        <li class="text-base" :style="{ color: theme.text }">· Do not click any links on this website</li>
        <li class="text-base" :style="{ color: theme.text }">· Do not enter any personal or banking details</li>
        <li class="text-base" :style="{ color: theme.text }">· If you received this link by text or email, report it to Scamwatch</li>
      </ul>
    </div>

    <div
      v-if="props.result.verdict === 'unsafe'"
      class="unsafe-clicked-help mt-3 rounded-xl px-3 py-2"
    >
      <button
        type="button"
        class="unsafe-clicked-help-trigger flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
        :aria-expanded="showClickedHelp"
        aria-controls="unsafe-clicked-help-panel"
        @click="showClickedHelp = !showClickedHelp"
      >
        <span>Already clicked the link or entered your details?</span>
        <svg
          class="w-5 h-5 flex-shrink-0"
          :class="showClickedHelp ? 'rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="showClickedHelp" id="unsafe-clicked-help-panel" class="mt-4">
        <h3 class="text-lg font-bold text-slate-900 mb-3">Act quickly. Here is what to do.</h3>
        <ol class="space-y-3 text-base text-slate-800 leading-relaxed">
          <li>1. Call your bank immediately and tell them what happened. Ask them to watch your account.</li>
          <li>2. Report the scam to Scamwatch at scamwatch.gov.au or call 1300 795 995.</li>
          <li>3. If your identity or personal details may be at risk, contact IDCARE at idcare.org or call 1800 595 160.</li>
        </ol>
      </div>
    </div>

  </div>
</template>

<style scoped>
.unsafe-clicked-help {
  background: #FFFBEB;
  border-left: 3px solid #F59E0B;
}

.verdict-banner-unsafe {
  padding: 1.05rem;
}

.verdict-unsafe-headline {
  font-size: clamp(1.8rem, 2.85vw, 2.85rem);
}

.unsafe-clicked-help-trigger {
  color: #1B2B5E;
  font-size: 15px;
  font-weight: 700;
}
</style>
