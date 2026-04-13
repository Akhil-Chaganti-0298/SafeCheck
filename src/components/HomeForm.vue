<script setup>
const emit = defineEmits(['navigate'])

const features = [
  {
    page: 'url-verifier',
    icon: 'link',
    color: 'green',
    title: 'Check a Link',
    desc: 'Is this website safe to visit? Paste the link and we will check it for you.',
    cta: 'Check a link',
  },
  {
    page: 'tnc-simplifier',
    icon: 'doc',
    color: 'purple',
    title: 'Understand Terms & Conditions',
    desc: 'Confused by the fine print? We will explain it in plain, simple English.',
    cta: 'Simplify T&Cs',
  },
  {
    page: 'scam-quiz',
    icon: 'bulb',
    color: 'amber',
    title: 'Scam Awareness Quiz',
    desc: 'Learn how to spot scams with easy, real-life examples.',
    cta: 'Take the quiz',
  },
]
</script>

<template>
  <section class="flex-1 bg-gray-50 flex flex-col items-center justify-center px-6 overflow-hidden">

    <!-- Shield icon -->
    <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
      <svg class="w-13 h-13 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>

    <h1 class="text-4xl font-bold text-gray-900 mb-3 text-center leading-snug">
      Welcome to SafeCheck
    </h1>
    <p class="text-xl text-gray-600 text-center max-w-lg mb-10 leading-relaxed">
      A free tool to help you stay safe online. No sign-up required.
    </p>

    <!-- Feature cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
      <button
        v-for="f in features"
        :key="f.page"
        @click="emit('navigate', f.page)"
        class="bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:shadow-lg hover:border-green-400 transition-all group focus:outline-none focus:ring-4 focus:ring-green-300"
      >
        <!-- Icon -->
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          :class="{
            'bg-green-100': f.color === 'green',
            'bg-purple-100': f.color === 'purple',
            'bg-amber-100': f.color === 'amber',
          }">
          <svg v-if="f.icon === 'link'" class="w-9 h-9 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <svg v-else-if="f.icon === 'doc'" class="w-9 h-9 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else class="w-9 h-9 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <p class="text-xl font-bold text-gray-900 mb-3 leading-snug">{{ f.title }}</p>
        <p class="text-lg text-gray-600 leading-relaxed mb-5">{{ f.desc }}</p>

        <div class="flex items-center gap-2 text-lg font-semibold group-hover:gap-3 transition-all"
          :class="{
            'text-green-700': f.color === 'green',
            'text-purple-700': f.color === 'purple',
            'text-amber-700': f.color === 'amber',
          }">
          {{ f.cta }}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  </section>
</template>