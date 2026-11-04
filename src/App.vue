<template>
  <router-view />
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { onBeforeMount } from 'vue'

const { initLocale } = useLocale()

// A tab still running a replaced version no longer finds its lazy chunks (new
// deployment, or old precache cleaned up): reload it on the current version, at
// most once in a while so that a chunk missing for another reason cannot loop
const RELOAD_KEY = 'app.chunkReloadAt'
window.addEventListener('vite:preloadError', () => {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
  if (Date.now() - last > 10_000) {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    window.location.reload()
  }
})

onBeforeMount(() => void initLocale())
</script>
