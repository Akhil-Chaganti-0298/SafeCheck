<script setup>
const emit = defineEmits(['navigate'])

const features = [
  {
    page: 'url-verifier',
    icon: 'link',
    title: 'Check a Link',
    desc: 'Not sure if a website is safe to visit? Paste the address and we will check it for warning signs in seconds.',
    cta: 'Check a link now',
  },
  {
    page: 'tnc-simplifier',
    icon: 'doc',
    title: 'Understand Terms & Conditions',
    desc: 'Confused by the fine print before signing up to something? We translate legal language into plain English.',
    cta: 'Simplify the fine print',
  },
  {
    page: 'scam-quiz',
    icon: 'bulb',
    title: 'Scam Awareness Quiz',
    desc: 'Test yourself with real scam scenarios. Eight short questions — no tech knowledge needed.',
    cta: 'Take the quiz',
  },
]
</script>

<template>

  <!-- ============================================================
       HERO — full-bleed navy gradient, no max-width constraint
       ============================================================ -->
  <section
    class="relative overflow-hidden"
    style="background: linear-gradient(135deg, var(--navy) 0%, #1d4ed8 100%);"
  >
    <!-- Subtle grid pattern for depth -->
    <div class="absolute inset-0 opacity-5" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <!-- Content — padding only, no max-width box -->
    <div class="relative px-4 py-16 sm:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <!-- Left: headline + CTAs -->
        <div class="animate-fade-in-up">

          <!-- Trust badge -->
          <div class="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-base font-medium text-white">Free · No sign-up required · Nothing stored</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Stay safe online —<br/>
            <span class="text-white">simply and for free</span>
          </h1>

          <p class="text-xl text-blue-100 leading-relaxed mb-8 max-w-xl">
            SafeCheck helps you check suspicious links, understand confusing Terms &amp; Conditions,
            and learn to spot online scams — all in plain English.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="emit('navigate', 'url-verifier')"
              class="btn-navy text-xl px-8 py-4 font-bold shadow-lg"
            >
              Check a link now
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              @click="emit('navigate', 'scam-quiz')"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white"
            >
              Take the scam quiz
            </button>
          </div>
        </div>

        <!-- Right: illustration — hidden on small screens -->
        <div class="hidden lg:flex justify-center animate-fade-in-up stagger-2">
          <div class="relative">
            <div class="w-80 h-80 rounded-3xl flex items-center justify-center" style="background-color: rgba(255,255,255,0.08);">
              <svg viewBox="0 0 320 300" class="w-72 h-72" fill="none" xmlns="http://www.w3.org/2000/svg"
                aria-label="Illustration of an older person checking a website safely on a laptop">
                <!-- Desk -->
                <rect x="40" y="220" width="240" height="12" rx="6" fill="rgba(255,255,255,0.15)"/>
                <!-- Laptop base -->
                <rect x="80" y="210" width="160" height="14" rx="4" fill="rgba(255,255,255,0.25)"/>
                <!-- Laptop screen -->
                <rect x="90" y="100" width="140" height="115" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                <rect x="98" y="108" width="124" height="95" rx="4" fill="rgba(255,255,255,0.08)"/>
                <!-- Browser bar -->
                <rect x="98" y="108" width="124" height="16" rx="4" fill="rgba(255,255,255,0.2)"/>
                <circle cx="108" cy="116" r="3" fill="rgba(255,100,100,0.6)"/>
                <circle cx="118" cy="116" r="3" fill="rgba(255,200,50,0.6)"/>
                <circle cx="128" cy="116" r="3" fill="rgba(50,200,100,0.6)"/>
                <!-- Green checkmark on screen -->
                <circle cx="160" cy="148" r="22" fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.6)" stroke-width="2"/>
                <path d="M149 148 l8 8 l14-14" stroke="rgba(74,222,128,1)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="110" y="178" width="60" height="6" rx="3" fill="rgba(74,222,128,0.5)"/>
                <rect x="120" y="190" width="40" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
                <!-- Person head + silver hair -->
                <circle cx="160" cy="62" r="28" fill="rgba(255,220,180,0.9)"/>
                <path d="M132 62 Q132 34 160 34 Q188 34 188 62" fill="rgba(180,180,190,0.8)"/>
                <!-- Glasses -->
                <rect x="142" y="60" width="14" height="9" rx="4" fill="none" stroke="rgba(80,80,100,0.8)" stroke-width="2"/>
                <rect x="164" y="60" width="14" height="9" rx="4" fill="none" stroke="rgba(80,80,100,0.8)" stroke-width="2"/>
                <path d="M156 64 L164 64" stroke="rgba(80,80,100,0.8)" stroke-width="2"/>
                <!-- Smile -->
                <path d="M150 74 Q160 82 170 74" stroke="rgba(160,100,60,0.8)" stroke-width="2" stroke-linecap="round" fill="none"/>
                <!-- Body / shoulders -->
                <path d="M120 210 Q120 160 140 155 L160 150 L180 155 Q200 160 200 210" fill="rgba(100,130,180,0.5)"/>
                <!-- Arms -->
                <path d="M125 175 Q105 185 100 200" stroke="rgba(255,220,180,0.8)" stroke-width="10" stroke-linecap="round" fill="none"/>
                <path d="M195 175 Q215 185 220 200" stroke="rgba(255,220,180,0.8)" stroke-width="10" stroke-linecap="round" fill="none"/>
                <!-- Shield badge -->
                <circle cx="248" cy="68" r="22" fill="rgba(74,222,128,0.25)" stroke="rgba(74,222,128,0.6)" stroke-width="2"/>
                <path d="M248 56 Q248 56 238 60 L238 68 Q238 76 248 80 Q258 76 258 68 L258 60 Z" fill="rgba(74,222,128,0.5)"/>
                <path d="M243 68 l3 3 l6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Floating "safe" badge -->
            <div class="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">Link checked</p>
                <p class="text-xs text-green-600 font-semibold">This site is safe ✓</p>
              </div>
            </div>

            <!-- Floating "warning" badge -->
            <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: #fef3c7;">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">T&amp;C flagged</p>
                <p class="text-xs text-amber-700 font-semibold">Data sharing clause found</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       HOW WE CAN HELP — full-bleed, no max-width wrapper
       ============================================================ -->
  <section class="py-16 sm:py-20 px-4" style="background-color: var(--bg);">

    <div class="text-center mb-12 animate-fade-in-up">
      <h2 class="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">How can we help you today?</h2>
      <p class="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
        Three free tools — each designed to be simple, no matter your tech experience.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <button
        v-for="(f, index) in features"
        :key="f.page"
        @click="emit('navigate', f.page)"
        class="bg-white rounded-2xl p-8 text-left border-2 border-slate-100 hover:border-blue-900 hover:shadow-xl transition-all duration-200 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900 animate-fade-in-up"
        :class="index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : 'stagger-3'"
        style="box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
      >
        <!-- Navy icon -->
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-200"
          style="background-color: var(--navy-tint);"
        >
          <svg v-if="f.icon === 'link'" class="w-8 h-8" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <svg v-else-if="f.icon === 'doc'" class="w-8 h-8" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else class="w-8 h-8" style="color: var(--navy);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <p class="text-2xl font-bold text-slate-900 mb-3 leading-snug">{{ f.title }}</p>
        <p class="text-lg text-slate-600 leading-relaxed mb-6">{{ f.desc }}</p>

        <div class="flex items-center gap-2 text-lg font-semibold group-hover:gap-3 transition-all" style="color: var(--navy);">
          {{ f.cta }}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  </section>

  <!-- ============================================================
       WHO IS THIS FOR — full-bleed white, no max-width wrapper
       ============================================================ -->
  <section class="py-16 px-4 bg-white">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      <!-- Illustrated vignettes -->
      <div class="grid grid-cols-2 gap-4 animate-fade-in-up">

        <!-- Large tile: person on phone -->
        <div class="col-span-2 rounded-2xl p-8 flex items-center gap-6" style="background-color: var(--navy-tint); border: 1px solid #bfdbfe;">
          <div class="flex-shrink-0">
            <svg viewBox="0 0 120 120" class="w-24 h-24" fill="none" aria-label="Illustration of a person reading on a phone">
              <rect x="38" y="25" width="44" height="72" rx="7" fill="#1e3a8a" />
              <rect x="42" y="31" width="36" height="58" rx="4" fill="#e8f4fd" />
              <rect x="46" y="36" width="28" height="3" rx="1.5" fill="#1e3a8a" opacity="0.5"/>
              <rect x="46" y="42" width="24" height="3" rx="1.5" fill="#93c5fd" opacity="0.7"/>
              <rect x="46" y="48" width="28" height="3" rx="1.5" fill="#93c5fd" opacity="0.5"/>
              <circle cx="60" cy="68" r="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
              <path d="M55 68 l3 3 l7-7" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="60" cy="92" r="4" fill="#374151" opacity="0.3"/>
              <!-- Person -->
              <circle cx="22" cy="50" r="14" fill="#fde68a" opacity="0.9"/>
              <path d="M10 50 Q10 36 22 36 Q34 36 34 50" fill="#d1d5db"/>
              <path d="M17 54 Q22 59 27 54" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              <rect x="15" y="48" width="6" height="4" rx="2" fill="none" stroke="#374151" stroke-width="1.2"/>
              <rect x="23" y="48" width="6" height="4" rx="2" fill="none" stroke="#374151" stroke-width="1.2"/>
              <path d="M21 50 L23 50" stroke="#374151" stroke-width="1.2"/>
              <path d="M30 60 Q36 65 38 72" stroke="#fde68a" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <p class="text-xl font-bold text-slate-900 mb-2">Received a suspicious link by text?</p>
            <p class="text-lg text-slate-600 leading-relaxed">Paste it into SafeCheck before you tap. Takes just a few seconds.</p>
          </div>
        </div>

        <!-- Laptop tile -->
        <div class="rounded-2xl p-6 flex flex-col items-center text-center" style="background-color: var(--navy-tint); border: 1px solid #bfdbfe;">
          <svg viewBox="0 0 100 80" class="w-20 h-16 mb-3" fill="none" aria-label="Illustration of a person at a laptop">
            <rect x="15" y="30" width="70" height="40" rx="4" fill="#1e3a8a"/>
            <rect x="19" y="34" width="62" height="32" rx="2" fill="#bfdbfe"/>
            <rect x="23" y="38" width="40" height="3" rx="1.5" fill="#1e3a8a" opacity="0.4"/>
            <rect x="23" y="44" width="30" height="3" rx="1.5" fill="#93c5fd" opacity="0.6"/>
            <rect x="10" y="70" width="80" height="6" rx="3" fill="#374151" opacity="0.5"/>
            <circle cx="50" cy="18" r="12" fill="#fde68a" opacity="0.9"/>
            <path d="M38 18 Q38 6 50 6 Q62 6 62 18" fill="#d1d5db"/>
          </svg>
          <p class="text-base font-bold text-slate-900">Confused by fine print?</p>
          <p class="text-sm text-slate-600 mt-1">We translate it for you</p>
        </div>

        <!-- Quiz tile -->
        <div class="rounded-2xl p-6 flex flex-col items-center text-center" style="background-color: var(--navy); ">
          <div class="w-14 h-14 rounded-full mb-3 flex items-center justify-center bg-white/10">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p class="text-base font-bold text-white">Test your scam radar</p>
          <p class="text-sm text-blue-200 mt-1">8 quick questions</p>
        </div>

      </div>

      <!-- Copy column -->
      <div class="animate-fade-in-up stagger-2">
        <p class="text-sm font-semibold uppercase tracking-widest mb-3" style="color: var(--navy);">Designed for everyday Australians</p>
        <h2 class="text-4xl font-bold text-slate-900 mb-6 leading-tight">
          You shouldn't need to be a tech expert to stay safe online
        </h2>
        <p class="text-xl text-slate-600 leading-relaxed mb-6">
          Online scams cost Australians over 65 more than a billion dollars every year.
          SafeCheck gives you the same tools the experts use — in language everyone can understand.
        </p>

        <div class="space-y-4">
          <div v-for="point in [
            'Results in plain English — no technical jargon',
            'No account, no password, no personal details needed',
            'Works on phones, tablets, and computers',
            'Completely free — always',
          ]" :key="point" class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: var(--navy);">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-lg text-slate-700">{{ point }}</p>
          </div>
        </div>

        <button
          @click="emit('navigate', 'url-verifier')"
          class="btn-navy mt-8 text-xl px-8 py-4"
        >
          Get started — it's free
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  </section>

  <!-- ============================================================
       TRUST STATS — full-bleed, no max-width wrapper
       ============================================================ -->
  <section class="py-12 px-4 border-t border-slate-100" style="background-color: var(--bg);">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
      <div v-for="stat in [
        { value: 'Free',  label: 'Always free to use'        },
        { value: '3',     label: 'Tools in one place'        },
        { value: '0',     label: 'Personal details needed'   },
        { value: '24/7',  label: 'Available any time'        },
      ]" :key="stat.label" class="flex flex-col items-center gap-1">
        <span class="text-4xl font-bold" style="color: var(--navy);">{{ stat.value }}</span>
        <span class="text-base text-slate-500">{{ stat.label }}</span>
      </div>
    </div>
  </section>

</template>
