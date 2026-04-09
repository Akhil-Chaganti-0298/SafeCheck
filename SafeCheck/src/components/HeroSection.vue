<template>
  <section class="bg-white border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <!-- Badge -->
      <span class="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
        Free · No account required
      </span>

      <!-- Headline -->
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
        Stay safe online.<br />
        <span class="text-blue-600">Know before you click.</span>
      </h1>

      <p class="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
        SafeCheck helps you verify suspicious links, understand confusing Terms &amp; Conditions,
        and build scam awareness — all in plain English.
      </p>

      <!-- CTA buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="#url-verifier"
          class="w-full sm:w-auto bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Check a Link
        </a>
        <a href="#scam-quiz"
          class="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
          Take the Quiz
        </a>
      </div>

      <!-- Feature cards row -->
      <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Link Verifier</h3>
          <p class="text-sm text-gray-500">Scan any URL against phishing, malware, and scam databases instantly.</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">T&amp;C Simplifier</h3>
          <p class="text-sm text-gray-500">Paste any Terms &amp; Conditions and get the key risks in plain English.</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Scam Quiz</h3>
          <p class="text-sm text-gray-500">Test your awareness with real-world scam scenarios and learn to spot red flags.</p>
        </div>
      </div>
    </div>
  </section>
</template>
