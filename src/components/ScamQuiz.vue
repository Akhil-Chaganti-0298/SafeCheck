<script setup>
import { ref } from 'vue'

// Tracks whether the user has clicked "Start Quiz" yet
const started = ref(false)

// Sample question used to show the quiz UI layout
// The real question set will be wired up when the backend is ready
const sampleQuestion = {
  number: 1,
  total: 8,
  text: 'You receive an email saying your bank account has been locked. It asks you to click a link and verify your details immediately or your account will be closed. What do you do?',
  options: [
    'Click the link and follow the instructions immediately',
    'Call your bank directly using the number on your card',
    'Reply to the email asking for more information',
    'Forward the email to friends to see if they got it too',
  ],
}
</script>

<template>
  <!-- Amber is the Scam Quiz colour — it carries through the whole page -->
  <section id="scam-quiz" class="py-20 bg-white border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="mb-10 animate-fade-in-up">
        <h2 class="text-5xl font-bold text-gray-900 mb-4">Scam Awareness Quiz</h2>
        <p class="text-2xl text-gray-500 max-w-xl leading-relaxed">
          Test yourself with real-world scam scenarios. Learn to spot red flags before scammers can exploit them.
          Great for all ages — no tech knowledge required.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left: quiz area -->
        <div class="lg:col-span-2">

          <!-- Start screen — shown before the user begins -->
          <div v-if="!started" class="bg-gray-50 border border-amber-200 rounded-xl p-10 text-center animate-fade-in-up">
            <div class="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 mb-3">Ready to test your awareness?</h3>
            <p class="text-2xl text-gray-500 mb-6">8 questions · ~5 minutes · Real scam scenarios</p>
            <!-- Category tags give people a preview of what to expect -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <span
                v-for="tag in ['Phishing', 'Bank Scams', 'Tech Support', 'Romance Scams', 'Fake Prizes']"
                :key="tag"
                class="text-xl bg-white border border-amber-200 text-gray-600 px-5 py-2 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <button
              @click="started = true"
              class="bg-amber-500 text-white text-xl font-semibold px-12 py-4 rounded-xl hover:bg-amber-600 active:scale-[0.97] transition-all"
            >
              Start Quiz
            </button>
          </div>

          <!-- Question view — shown once the user clicks Start -->
          <div v-else class="border border-amber-200 rounded-xl overflow-hidden animate-fade-in-up">

            <!-- Amber progress bar at the top -->
            <div class="bg-gray-50 border-b border-amber-100 px-6 py-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xl text-gray-500">Question {{ sampleQuestion.number }} of {{ sampleQuestion.total }}</span>
                <span class="text-xl text-gray-500">{{ Math.round((sampleQuestion.number / sampleQuestion.total) * 100) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div
                  class="bg-amber-500 h-4 rounded-full transition-all duration-500"
                  :style="{ width: `${(sampleQuestion.number / sampleQuestion.total) * 100}%` }"
                ></div>
              </div>
            </div>

            <div class="px-6 py-7">
              <div class="flex items-start gap-3 mb-7">
                <!-- Question number badge in amber -->
                <span class="flex-shrink-0 w-9 h-9 bg-amber-100 text-amber-700 rounded-full text-xl font-semibold flex items-center justify-center">
                  {{ sampleQuestion.number }}
                </span>
                <p class="text-2xl text-gray-800 leading-relaxed">{{ sampleQuestion.text }}</p>
              </div>

              <!-- Answer options — highlight amber on hover -->
              <div class="space-y-3">
                <button
                  v-for="(option, i) in sampleQuestion.options"
                  :key="i"
                  class="w-full text-left text-xl border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:bg-amber-50 active:scale-[0.99] transition-all text-gray-700"
                >
                  <span class="font-semibold text-gray-400 mr-2">{{ String.fromCharCode(65 + i) }}.</span>
                  {{ option }}
                </button>
              </div>
            </div>

            <div class="border-t border-gray-100 px-6 py-5 bg-gray-50 flex justify-between">
              <button class="text-xl text-gray-500 hover:text-gray-700 px-2 transition">Skip</button>
              <button class="text-xl bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium">Next</button>
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="space-y-4">

          <!-- Score placeholder — fills in once the user finishes -->
          <div class="bg-gray-50 border border-amber-200 rounded-xl p-6 animate-fade-in-up">
            <p class="text-lg font-medium text-gray-400 uppercase tracking-wide mb-4">Your Score</p>
            <div class="flex items-end gap-2 mb-3">
              <div class="h-14 w-20 bg-gray-200 rounded animate-pulse"></div>
              <span class="text-xl text-gray-400">/ 8</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div class="bg-gray-300 h-4 rounded-full w-0"></div>
            </div>
            <p class="text-xl text-gray-400">Complete the quiz to see your score</p>
          </div>

          <!-- Quick tips — useful even without doing the quiz -->
          <div class="bg-gray-50 border border-amber-200 rounded-xl p-6 animate-fade-in-up stagger-1">
            <p class="text-lg font-medium text-gray-400 uppercase tracking-wide mb-4">Quick Tips</p>
            <ul class="space-y-4">
              <li
                v-for="tip in [
                  'Never click links in unsolicited emails',
                  'Banks never ask for passwords via email',
                  'Verify unexpected prize claims by phone',
                  'If it feels urgent, take a breath first',
                ]"
                :key="tip"
                class="flex items-start gap-3"
              >
                <svg class="w-7 h-7 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd" />
                </svg>
                <span class="text-xl text-gray-600">{{ tip }}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
