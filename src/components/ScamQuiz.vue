<script setup>
import { ref } from 'vue'

const started = ref(false)
const selectedAnswer = ref(null)

const sampleQuestion = {
  number: 1,
  total: 8,
  text: 'You receive a text message saying your bank account has been locked. It asks you to click a link and verify your details immediately or your account will be closed. What do you do?',
  options: [
    'Click the link and follow the instructions immediately',
    'Call your bank directly using the number on your card',
    'Reply to the text asking for more information',
    'Forward the message to friends to see if they got it too',
  ],
  correctIndex: 1,
  explanation: 'Banks never ask you to verify your account through a text link. Always call your bank directly using the number printed on the back of your card — never the number in the message.',
}

function selectAnswer(index) {
  selectedAnswer.value = index
}
</script>

<template>
  <section class="py-16 px-4" style="background-color: var(--bg);">
    <div>

      <!-- Page heading -->
      <div class="text-center mb-10 animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style="background-color: var(--navy-tint);">
          <svg class="w-10 h-10" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 class="text-5xl sm:text-6xl font-bold text-slate-900 mb-4 animate-fade-in-up stagger-1">
          Scam Awareness Quiz
        </h1>
        <p class="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
          Test yourself with real-life scam scenarios. Eight short questions — no tech knowledge needed.
          Learn to spot the warning signs before scammers can exploit them.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left: quiz area -->
        <div class="lg:col-span-2">

          <!-- Start screen -->
          <div v-if="!started" class="bg-white border border-slate-200 rounded-2xl p-10 text-center animate-fade-in-up shadow-sm">
            <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style="background-color: var(--navy-tint);">
              <svg class="w-12 h-12" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <h2 class="text-3xl font-bold text-slate-900 mb-3">Ready to test your scam radar?</h2>
            <p class="text-xl text-slate-500 mb-8 leading-relaxed">
              8 questions · About 5 minutes · Real scam scenarios<br/>
              <span class="text-lg text-slate-400">No right or wrong — just learning</span>
            </p>

            <!-- Topic tags -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <span
                v-for="tag in ['Phishing', 'Bank Scams', 'Tech Support', 'Romance Scams', 'Fake Prizes']"
                :key="tag"
                class="text-base font-medium border border-slate-200 text-slate-600 bg-slate-50 px-5 py-2 rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <button
              @click="started = true"
              class="btn-navy text-xl px-12 py-4"
            >
              Start the quiz
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Question view -->
          <div v-else class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">

            <!-- Progress bar -->
            <div class="px-6 py-4 border-b border-slate-100" style="background-color: var(--navy-tint);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-lg font-medium" style="color: var(--navy);">
                  Question {{ sampleQuestion.number }} of {{ sampleQuestion.total }}
                </span>
                <span class="text-lg font-bold" style="color: var(--navy);">
                  {{ Math.round((sampleQuestion.number / sampleQuestion.total) * 100) }}%
                </span>
              </div>
              <div class="w-full bg-blue-100 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all duration-500"
                  style="background-color: var(--navy);"
                  :style="{ width: `${(sampleQuestion.number / sampleQuestion.total) * 100}%` }"
                ></div>
              </div>
            </div>

            <div class="px-6 py-7">
              <!-- Question number badge + text -->
              <div class="flex items-start gap-4 mb-7">
                <span
                  class="flex-shrink-0 w-10 h-10 rounded-full text-white text-xl font-bold flex items-center justify-center"
                  style="background-color: var(--navy);"
                >
                  {{ sampleQuestion.number }}
                </span>
                <p class="text-2xl text-slate-800 leading-relaxed">{{ sampleQuestion.text }}</p>
              </div>

              <!-- Answer options -->
              <div class="space-y-3">
                <button
                  v-for="(option, i) in sampleQuestion.options"
                  :key="i"
                  @click="selectAnswer(i)"
                  class="w-full text-left text-xl border-2 rounded-xl px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-4"
                  :class="{
                    'border-slate-200 text-slate-700 hover:border-blue-900 hover:bg-blue-50': selectedAnswer === null,
                    'border-green-500 bg-green-50 text-green-900': selectedAnswer !== null && i === sampleQuestion.correctIndex,
                    'border-red-400 bg-red-50 text-red-900': selectedAnswer !== null && selectedAnswer === i && i !== sampleQuestion.correctIndex,
                    'border-slate-100 text-slate-400': selectedAnswer !== null && selectedAnswer !== i && i !== sampleQuestion.correctIndex,
                  }"
                  style="focus-visible:ring-color: var(--navy);"
                >
                  <span
                    class="font-bold mr-2"
                    :class="selectedAnswer === null ? 'text-slate-400' : i === sampleQuestion.correctIndex ? 'text-green-600' : selectedAnswer === i ? 'text-red-500' : 'text-slate-300'"
                  >
                    {{ String.fromCharCode(65 + i) }}.
                  </span>
                  {{ option }}
                </button>
              </div>

              <!-- Explanation — shown after answering -->
              <div
                v-if="selectedAnswer !== null"
                class="mt-6 rounded-xl p-5 border animate-fade-in-up"
                :class="selectedAnswer === sampleQuestion.correctIndex
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'"
              >
                <p class="text-lg font-bold mb-1"
                  :class="selectedAnswer === sampleQuestion.correctIndex ? 'text-green-800' : 'text-amber-800'">
                  {{ selectedAnswer === sampleQuestion.correctIndex ? 'Correct!' : 'Not quite — here\'s why:' }}
                </p>
                <p class="text-lg leading-relaxed"
                  :class="selectedAnswer === sampleQuestion.correctIndex ? 'text-green-700' : 'text-amber-800'">
                  {{ sampleQuestion.explanation }}
                </p>
              </div>
            </div>

            <!-- Footer nav -->
            <div class="border-t border-slate-100 px-6 py-5 flex justify-between items-center">
              <button class="text-lg text-slate-400 hover:text-slate-600 transition focus-visible:outline-none focus-visible:underline">
                Skip
              </button>
              <button
                class="btn-navy text-lg px-8 py-3"
                :disabled="selectedAnswer === null"
                :style="selectedAnswer === null ? 'opacity: 0.4; cursor: not-allowed;' : ''"
              >
                Next question
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="space-y-5">

          <!-- Score card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in-up shadow-sm">
            <p class="text-base font-semibold text-slate-400 uppercase tracking-wide mb-4">Your Score</p>
            <div class="flex items-end gap-2 mb-3">
              <div class="h-14 w-20 bg-slate-100 rounded-xl animate-pulse"></div>
              <span class="text-xl text-slate-400 mb-1">/ 8</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 mb-3">
              <div class="h-3 rounded-full w-0" style="background-color: var(--navy);"></div>
            </div>
            <p class="text-lg text-slate-400">Complete the quiz to see your score</p>
          </div>

          <!-- Quick tips -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in-up stagger-1 shadow-sm">
            <p class="text-base font-semibold text-slate-400 uppercase tracking-wide mb-4">Quick tips to remember</p>
            <ul class="space-y-4">
              <li
                v-for="tip in [
                  'Never click links in unexpected texts or emails',
                  'Banks never ask for passwords by email or text',
                  'If a prize feels too good to be true, it probably is',
                  'Scammers create urgency — take a breath before acting',
                  'When in doubt, hang up and call back on an official number',
                ]"
                :key="tip"
                class="flex items-start gap-3"
              >
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: var(--navy);">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-lg text-slate-700 leading-snug">{{ tip }}</span>
              </li>
            </ul>
          </div>

          <!-- Reassurance note -->
          <div class="rounded-2xl p-6 animate-fade-in-up stagger-2" style="background-color: var(--navy-tint);">
            <p class="text-lg font-bold mb-2" style="color: var(--navy);">You are not alone</p>
            <p class="text-base text-slate-600 leading-relaxed">
              Scammers are professionals. Anyone can be targeted. Taking this quiz already puts you
              ahead of most people — well done for being cautious.
            </p>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
