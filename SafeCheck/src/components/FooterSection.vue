<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
        <!-- Brand -->
        <div class="sm:col-span-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span class="font-semibold text-gray-900">SafeCheck</span>
          </div>
          <p class="text-sm text-gray-500 max-w-xs">
            Helping everyday people stay safe online — free, simple, and no account required.
          </p>
        </div>

        <!-- Tools -->
        <div>
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Tools</p>
          <ul class="space-y-2">
            <li v-for="link in ['Link Verifier', 'T&C Simplifier', 'Scam Quiz']" :key="link">
              <a href="#" class="text-sm text-gray-500 hover:text-blue-600 transition-colors">{{ link }}</a>
            </li>
          </ul>
        </div>

        <!-- About -->
        <div>
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">About</p>
          <ul class="space-y-2">
            <li v-for="link in ['About Us', 'Privacy Policy', 'Report an Issue']" :key="link">
              <a href="#" class="text-sm text-gray-500 hover:text-blue-600 transition-colors">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-gray-400">© 2025 SafeCheck. Built for digital safety education.</p>
        <p class="text-xs text-gray-400">Not affiliated with any government agency.</p>
      </div>
    </div>
  </footer>
</template>
