<script setup>
import { computed, nextTick, ref } from 'vue'
import { scamQuizCategories, scamQuizQuestions } from '../data/scamQuizData.js'

const selectedCategory = ref(null)
const quizPanelRef = ref(null)
const finalScoreRef = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const answersByQuestionIndex = ref({})
const score = ref(0)
const quizFinished = ref(false)

function getQuestionsForCategory(categoryId) {
  if (!categoryId) {
    return []
  }

  if (categoryId === 'all') {
    return scamQuizQuestions
  }

  return scamQuizQuestions.filter(question => question.category === categoryId)
}

function shuffleArray(items) {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffleQuestionOptions(question, previousCorrectIndex) {
  const correctOption = question.options[question.correctIndex]
  const incorrectOptions = question.options.filter((_, index) => index !== question.correctIndex)
  const optionCount = question.options.length
  const allowedCorrectIndexes = Array.from({ length: optionCount }, (_, index) => index)
    .filter(index => index !== previousCorrectIndex)
  const correctIndex = randomItem(allowedCorrectIndexes.length ? allowedCorrectIndexes : [question.correctIndex])
  const shuffledIncorrectOptions = shuffleArray(incorrectOptions)
  const options = []

  for (let index = 0; index < optionCount; index += 1) {
    options[index] = index === correctIndex ? correctOption : shuffledIncorrectOptions.shift()
  }

  return {
    ...question,
    options,
    correctIndex,
  }
}

function buildShuffledQuestions(categoryId = selectedCategory.value) {
  let previousCorrectIndex = null

  return shuffleArray(getQuestionsForCategory(categoryId)).map((question) => {
    const shuffledQuestion = shuffleQuestionOptions(question, previousCorrectIndex)
    previousCorrectIndex = shuffledQuestion.correctIndex
    return shuffledQuestion
  })
}

const quizQuestions = ref(buildShuffledQuestions())

const allCategory = computed(() => scamQuizCategories.find(category => category.id === 'all'))

const topicCategories = computed(() => scamQuizCategories.filter(category => category.id !== 'all'))

const categoryCounts = computed(() => scamQuizCategories.reduce((counts, category) => {
  counts[category.id] = getQuestionsForCategory(category.id).length
  return counts
}, {}))

const selectedCategoryLabel = computed(() => (
  scamQuizCategories.find(category => category.id === selectedCategory.value)?.label || 'Choose a category'
))

const knowledgeTips = [
  {
    title: 'Pause before acting',
    text: 'If a message makes you feel worried or rushed, stop. Scammers use urgency on purpose.',
  },
  {
    title: 'Use official websites and apps',
    text: 'Never use a link from a text or email. Type the address yourself or open the official app.',
  },
  {
    title: 'Never share passwords or banking codes',
    text: 'Your bank, myGov, and service providers will never ask for these over the phone or by message.',
  },
  {
    title: 'Hang up on unexpected callers asking for computer access',
    text: 'No real company should call you first and ask to control your device.',
  },
]

const currentQuestion = computed(() => quizQuestions.value[currentQuestionIndex.value])
const totalQuestions = computed(() => quizQuestions.value.length)
const isCorrect = computed(() => currentQuestion.value && selectedAnswer.value === currentQuestion.value.correctIndex)
const progressPercent = computed(() => (
  totalQuestions.value ? ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100 : 0
))

const scoreMessage = computed(() => {
  const scorePercent = totalQuestions.value ? score.value / totalQuestions.value : 0

  if (scorePercent < 0.5) {
    return 'You may need more practice. Read the tips below before clicking links or sharing your details with anyone.'
  }

  if (scorePercent < 0.8) {
    return 'Good start. You recognised some warning signs. A few scams can still be hard to spot, so keep reading the tips.'
  }

  return 'Great work. You recognised most warning signs. Keep pausing before you click, pay, or share any details.'
})

function hasStoredAnswer(questionIndex) {
  return Object.prototype.hasOwnProperty.call(answersByQuestionIndex.value, questionIndex)
}

function syncCurrentQuestionState() {
  if (hasStoredAnswer(currentQuestionIndex.value)) {
    selectedAnswer.value = answersByQuestionIndex.value[currentQuestionIndex.value]
    showFeedback.value = true
    return
  }

  selectedAnswer.value = null
  showFeedback.value = false
}

function selectAnswer(index) {
  if (showFeedback.value || !currentQuestion.value || hasStoredAnswer(currentQuestionIndex.value)) return

  answersByQuestionIndex.value = {
    ...answersByQuestionIndex.value,
    [currentQuestionIndex.value]: index,
  }
  selectedAnswer.value = index
  showFeedback.value = true

  if (index === currentQuestion.value.correctIndex) {
    score.value += 1
  }
}

function resetQuiz(categoryId = selectedCategory.value) {
  quizQuestions.value = buildShuffledQuestions(categoryId)
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showFeedback.value = false
  answersByQuestionIndex.value = {}
  score.value = 0
  quizFinished.value = false
}

function scrollElementIntoView(element, block = 'start') {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  element?.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block,
  })
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
  resetQuiz(categoryId)

  nextTick(() => {
    scrollElementIntoView(quizPanelRef.value)
  })
}

function goToQuestion(questionIndex) {
  currentQuestionIndex.value = questionIndex
  syncCurrentQuestionState()
}

function previousQuestion() {
  if (currentQuestionIndex.value === 0) return
  goToQuestion(currentQuestionIndex.value - 1)
}

function finishQuiz() {
  quizFinished.value = true

  nextTick(() => {
    scrollElementIntoView(finalScoreRef.value || quizPanelRef.value, 'center')
  })
}

function nextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    goToQuestion(currentQuestionIndex.value + 1)
  } else {
    finishQuiz()
  }
}

function tryAgain() {
  resetQuiz()
}
</script>

<template>
  <section style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);">
    <div class="px-8 sm:px-16 py-12 sm:py-16">
      <div class="text-center max-w-3xl mx-auto animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 bg-white/15">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          Scam Quiz
        </h1>
        <p class="text-xl text-white leading-relaxed" style="opacity: 0.92;">
          Practise spotting scam warning signs in common messages, calls, and emails.
          Choose what you would do, then read the plain-English explanation.
        </p>
      </div>
    </div>
  </section>

  <section class="py-12 px-8 sm:px-16" style="background-color: var(--bg);">
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
          <div>
            <p class="text-base font-semibold text-slate-500 uppercase tracking-wide mb-2">Choose a category</p>
            <h2 class="text-3xl font-bold text-slate-900 mb-2">Practise the scams you are most likely to see</h2>
            <p class="text-lg text-slate-600 leading-relaxed">
              Pick one topic, or choose all scenarios for a broader practice quiz.
            </p>
          </div>
          <p class="text-lg font-semibold" style="color: var(--navy);">
            {{ selectedCategory ? `${totalQuestions} questions selected` : 'Select one to begin' }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="category in topicCategories"
            :key="category.id"
            type="button"
            class="text-left rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            :class="selectedCategory === category.id
              ? 'bg-blue-50 border-blue-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-blue-900 hover:bg-blue-50'"
            @click="selectCategory(category.id)"
          >
            <span class="block text-lg font-bold text-slate-900 mb-1">{{ category.label }}</span>
            <span class="block text-sm text-slate-600 leading-snug mb-3">{{ category.description }}</span>
            <span class="inline-flex rounded-full px-3 py-1 text-sm font-bold" style="color: var(--navy); background-color: var(--navy-tint);">
              {{ categoryCounts[category.id] }} questions
            </span>
          </button>
        </div>

        <button
          v-if="allCategory"
          type="button"
          class="mt-4 w-full text-left rounded-xl border-2 p-5 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:flex sm:items-center sm:justify-between sm:gap-5"
          :class="selectedCategory === allCategory.id
            ? 'bg-blue-50 border-blue-900 shadow-sm'
            : 'bg-white border-slate-200 hover:border-blue-900 hover:bg-blue-50'"
          @click="selectCategory(allCategory.id)"
        >
          <span>
            <span class="block text-xl font-bold text-slate-900 mb-1">{{ allCategory.label }}</span>
            <span class="block text-base text-slate-600 leading-snug">{{ allCategory.description }}</span>
          </span>
          <span class="mt-3 inline-flex rounded-full px-4 py-2 text-base font-bold sm:mt-0" style="color: var(--navy); background-color: var(--navy-tint);">
            {{ categoryCounts[allCategory.id] }} questions
          </span>
        </button>
      </div>

      <div ref="quizPanelRef" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up scroll-mt-24">
        <div v-if="!selectedCategory" class="p-8 sm:p-10 text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style="background-color: var(--navy-tint);">
            <svg class="w-10 h-10" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0m-5 8 2 2 4-4" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-slate-900 mb-3">Select a category to begin</h2>
          <p class="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Choose one scam topic above, or use the All Scenarios bar if you want the full practice set.
          </p>
        </div>

        <div v-else-if="!quizFinished" class="p-6 sm:p-8">
          <div class="mb-7">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <p class="text-lg font-semibold" style="color: var(--navy);">
                {{ selectedCategoryLabel }} · Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
              </p>
              <button
                type="button"
                class="rounded-xl border-2 border-slate-200 px-4 py-2 text-base font-bold text-slate-700 transition hover:border-blue-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                @click="finishQuiz"
              >
                End this quiz
              </button>
            </div>
            <div class="w-full bg-blue-100 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-500"
                style="background-color: var(--navy);"
                :style="{ width: `${progressPercent}%` }"
              ></div>
            </div>
          </div>

          <div class="mb-7">
            <div class="flex flex-wrap items-center gap-3 mb-3">
              <p class="text-base font-semibold text-slate-500 uppercase tracking-wide">Scenario</p>
              <span class="rounded-full px-3 py-1 text-sm font-bold" style="color: var(--navy); background-color: var(--navy-tint);">
                {{ currentQuestion.categoryLabel }}
              </span>
            </div>
            <p class="text-2xl text-slate-800 leading-relaxed">
              {{ currentQuestion.scenario }}
            </p>
          </div>

          <div class="space-y-3">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="option"
              type="button"
              :disabled="showFeedback"
              @click="selectAnswer(index)"
              class="w-full text-left text-xl border-2 rounded-xl px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-default"
              :class="{
                'border-slate-200 text-slate-700 hover:border-blue-900 hover:bg-blue-50': !showFeedback,
                'border-green-500 bg-green-50 text-green-900': showFeedback && index === currentQuestion.correctIndex,
                'border-red-400 bg-red-50 text-red-900': showFeedback && selectedAnswer === index && index !== currentQuestion.correctIndex,
                'border-slate-100 text-slate-500 bg-slate-50': showFeedback && selectedAnswer !== index && index !== currentQuestion.correctIndex,
              }"
            >
              <span class="font-bold mr-2">{{ String.fromCharCode(65 + index) }}.</span>
              {{ option }}
            </button>
          </div>

          <div
            v-if="showFeedback"
            class="mt-7 rounded-xl border p-5 animate-fade-in-up"
            :class="isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
          >
            <p
              class="text-xl font-bold mb-3"
              :class="isCorrect ? 'text-green-800' : 'text-red-800'"
            >
              {{ isCorrect ? 'Correct answer' : 'Incorrect answer' }}
            </p>
            <p class="text-lg text-slate-800 leading-relaxed mb-4">
              {{ currentQuestion.explanation }}
            </p>
            <div class="rounded-lg bg-white/70 border border-slate-200 p-4">
              <p class="text-base font-bold text-slate-700 uppercase tracking-wide mb-1">Warning sign</p>
              <p class="text-lg text-slate-700 leading-relaxed">{{ currentQuestion.warningSign }}</p>
            </div>
          </div>

          <div class="mt-8 flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:items-center">
            <button
              type="button"
              class="rounded-xl border-2 border-slate-200 px-8 py-3 text-lg font-bold text-slate-700 transition hover:border-blue-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentQuestionIndex === 0"
              @click="previousQuestion"
            >
              <svg class="w-5 h-5 inline-block mr-2 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous Question
            </button>

            <p class="text-center text-xl font-black" style="color: var(--navy);">
              Score: {{ score }} / {{ totalQuestions }}
            </p>

            <button
              type="button"
              class="btn-navy justify-self-end text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!showFeedback"
              @click="nextQuestion"
            >
              {{ currentQuestionIndex === totalQuestions - 1 ? 'See my score' : 'Next Question' }}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div v-else ref="finalScoreRef" class="p-8 sm:p-10 text-center animate-fade-in-up scroll-mt-24">
          <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style="background-color: var(--navy-tint);">
            <svg class="w-12 h-12" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-base font-semibold text-slate-500 uppercase tracking-wide mb-2">Final score</p>
          <h2 class="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            {{ score }} out of {{ totalQuestions }}
          </h2>
          <p class="text-lg font-semibold mb-3" style="color: var(--navy);">
            Category: {{ selectedCategoryLabel }}
          </p>
          <p class="text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto mb-8">
            {{ scoreMessage }}
          </p>
          <button type="button" class="btn-navy text-xl px-10 py-4" @click="tryAgain">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Knowledge Tips</h2>
        <p class="text-lg text-slate-600 leading-relaxed mb-6">
          Keep these simple checks in mind before you click a link, pay money, or share personal details.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="tip in knowledgeTips"
            :key="tip.title"
            class="rounded-xl border border-slate-200 p-5"
            style="background-color: var(--navy-tint);"
          >
            <p class="text-xl font-bold mb-2" style="color: var(--navy);">{{ tip.title }}</p>
            <p class="text-lg text-slate-700 leading-relaxed">{{ tip.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
