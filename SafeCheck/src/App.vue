<script setup>
import Navbar from './components/Navbar.vue'
import HeroSection from './components/HeroSection.vue'
import UrlVerifier from './components/UrlVerifier.vue'
import TncSimplifier from './components/TncSimplifier.vue'
import ScamQuiz from './components/ScamQuiz.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <Navbar />
    <main>
      <HeroSection />
      <UrlVerifier />
      <TncSimplifier />
      <ScamQuiz />
    </main>
    <FooterSection />
  </div>
</template>
