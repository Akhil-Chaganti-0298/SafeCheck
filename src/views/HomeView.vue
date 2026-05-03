<script setup>
import { useRouter } from 'vue-router'
import HomeForm from '../components/HomeForm.vue'

const router = useRouter()

const pageToPath = {
  home: '/',
  'url-verifier': '/url-verifier',
  'tnc-simplifier': '/tnc-simplifier',
  'scam-quiz': '/scam-quiz',
}

function go(page) {
  router.push(pageToPath[page] || '/')
}
</script>

<template>
  <HomeForm @navigate="go" />
</template> 