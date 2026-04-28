<script setup>
import { ref } from 'vue'

const started = ref(false)
const completed = ref(false)
const selectedAnswer = ref(null)
const answeredCorrectly = ref(false)

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
  if (selectedAnswer.value !== null) return
  selectedAnswer.value = index
}

function finishQuiz() {
  answeredCorrectly.value = selectedAnswer.value === sampleQuestion.correctIndex
  completed.value = true
}

function restartQuiz() {
  started.value = false
  completed.value = false
  selectedAnswer.value = null
  answeredCorrectly.value = false
}
</script>

<template>
  <!-- Compact navy hero band -->
  <section style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);">
    <div class="px-4 py-12 sm:py-16">
      <div class="text-center max-w-2xl mx-auto animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 bg-white/15">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          Scam Awareness Quiz
        </h1>
        <p class="text-xl text-white leading-relaxed" style="opacity: 0.92;">
          Test yourself with real-life scam scenarios. Eight short questions — no tech knowledge needed.
          Learn to spot the warning signs before scammers can exploit them.
        </p>
      </div>
    </div>
  </section>

  <!-- Main content -->
  <section class="py-12 px-4" style="background-color: var(--bg);">
    <div>
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
            <p class="text-xl text-slate-600 mb-8 leading-relaxed">
              8 questions · About 5 minutes · Real scam scenarios<br/>
              <span class="text-lg text-slate-500">No right or wrong — just learning</span>
            </p>

            <!-- Polished topic tags -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <span
                v-for="tag in ['Phishing', 'Bank Scams', 'Tech Support', 'Romance Scams', 'Fake Prizes']"
                :key="tag"
                class="text-base font-semibold px-5 py-2.5 rounded-full cursor-default"
                style="color: var(--navy); background-color: var(--navy-tint); border: 2px solid rgba(30,58,138,0.3);"
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

          <!-- Completion screen — warm and encouraging -->
          <div v-else-if="completed" class="bg-white border border-slate-200 rounded-2xl p-10 text-center animate-fade-in-up shadow-sm">
            <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style="background-color: var(--navy-tint);">
              <svg class="w-12 h-12" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 class="text-3xl font-bold text-slate-900 mb-4">Well done for completing the quiz!</h2>
            <p class="text-xl text-slate-600 leading-relaxed mb-6">
              Taking time to learn about scams is one of the most important steps you can take to protect yourself online.
              Every question you answer makes you harder to fool.
            </p>

            <div class="rounded-2xl p-6 mb-8 text-left" style="background-color: var(--navy-tint); border: 1px solid #bfdbfe;">
              <p class="text-lg font-bold mb-3" style="color: var(--navy);">Key lessons to remember:</p>
              <ul class="space-y-3">
                <li v-for="lesson in [
                  'Banks and government agencies never ask for your details via a text link',
                  'When in doubt, hang up and call back on an official number',
                  'Scammers always create urgency — slow down and take a breath',
                  'If a message feels wrong, trust that feeling — check it first',
                ]" :key="lesson" class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: var(--navy);">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-lg text-slate-700">{{ lesson }}</span>
                </li>
              </ul>
            </div>

            <button @click="restartQuiz" class="btn-navy text-xl px-10 py-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Take the quiz again
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
                  class="w-full text-left text-xl border-2 rounded-xl px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900"
                  :class="{
                    'border-slate-200 text-slate-700 hover:border-blue-900 hover:bg-blue-50 cursor-pointer': selectedAnswer === null,
                    'border-green-500 bg-green-50 text-green-900 cursor-default': selectedAnswer !== null && i === sampleQuestion.correctIndex,
                    'border-red-400 bg-red-50 text-red-900 cursor-default': selectedAnswer !== null && selectedAnswer === i && i !== sampleQuestion.correctIndex,
                    'border-slate-100 text-slate-400 cursor-default': selectedAnswer !== null && selectedAnswer !== i && i !== sampleQuestion.correctIndex,
                  }"
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

              <!-- Explanation after answering -->
              <div
                v-if="selectedAnswer !== null"
                class="mt-6 rounded-xl p-5 border animate-fade-in-up"
                :class="selectedAnswer === sampleQuestion.correctIndex
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'"
              >
                <p class="text-lg font-bold mb-1"
                  :class="selectedAnswer === sampleQuestion.correctIndex ? 'text-green-800' : 'text-amber-800'">
                  {{ selectedAnswer === sampleQuestion.correctIndex ? 'Correct! Well done.' : 'Not quite — but now you know what to do:' }}
                </p>
                <p class="text-lg leading-relaxed"
                  :class="selectedAnswer === sampleQuestion.correctIndex ? 'text-green-700' : 'text-amber-800'">
                  {{ sampleQuestion.explanation }}
                </p>
              </div>
            </div>

            <!-- Footer nav -->
            <div class="border-t border-slate-100 px-6 py-5 flex justify-between items-center">
              <button class="text-lg text-slate-500 hover:text-slate-700 transition focus-visible:outline-none focus-visible:underline">
                Skip
              </button>
              <button
                @click="finishQuiz"
                class="btn-navy text-lg px-8 py-3"
                :disabled="selectedAnswer === null"
                :class="selectedAnswer === null ? 'opacity-40 cursor-not-allowed' : ''"
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

          <!-- Score card — hidden until quiz starts -->
          <div v-if="started" class="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in-up shadow-sm">
            <p class="text-base font-semibold text-slate-600 uppercase tracking-wide mb-4">Your Score</p>
            <div v-if="!completed">
              <div class="flex items-end gap-2 mb-3">
                <div class="h-14 w-20 bg-slate-100 rounded-xl"></div>
                <span class="text-xl text-slate-500 mb-1">/ 8</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-3 mb-3">
                <div class="h-3 rounded-full w-0" style="background-color: var(--navy);"></div>
              </div>
              <p class="text-lg text-slate-500">Quiz in progress…</p>
            </div>
            <div v-else>
              <div class="flex items-end gap-2 mb-3">
                <span class="text-5xl font-bold" style="color: var(--navy);">{{ answeredCorrectly ? '1' : '0' }}</span>
                <span class="text-2xl text-slate-500 mb-2">/ 1</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-3 mb-4">
                <div class="h-3 rounded-full transition-all duration-700"
                  style="background-color: var(--navy);"
                  :style="{ width: answeredCorrectly ? '100%' : '0%' }"></div>
              </div>
              <p class="text-lg font-medium text-slate-700">
                {{ answeredCorrectly ? 'Correct answer — great work!' : 'Check the explanation above and you will know for next time.' }}
              </p>
            </div>
          </div>

          <!-- Quick tips — always visible -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in-up stagger-1 shadow-sm">
            <p class="text-base font-semibold text-slate-600 uppercase tracking-wide mb-4">Quick tips to remember</p>
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
