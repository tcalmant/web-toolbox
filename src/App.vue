<template>
  <router-view />
</template>

<script setup lang="ts">
import type { QuasarLanguage } from 'quasar'
import { useQuasar } from 'quasar'
import languages from 'quasar/lang/index.json'
import messages from 'src/i18n'
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'

// Auto-select locale
const $q = useQuasar()
const { locale } = useI18n({ useScope: 'global' })

function findBestMatch(name: string, allowed: string[]): string | undefined {
  return allowed.filter((m) => m.includes(name)).sort((a, b) => a.length - b.length)[0]
}

// Try to find the closest locale
const baseLocale = $q.lang.getLocale() || 'en-US'

// Find i18n locale
let detectedLocale = baseLocale
if (!Object.keys(messages).includes(detectedLocale)) {
  // No direct match
  detectedLocale = findBestMatch(detectedLocale, Object.keys(messages)) ?? 'en-US'
}

// Set the overall locale
locale.value = detectedLocale

async function setQuasarLanguagePack(baseLocale: string) {
  try {
    // Find Quasar language pack
    const detectedLanguagePack = findBestMatch(
      baseLocale,
      languages.map((lng) => lng.isoName),
    )

    // Set the quasar language pack
    const modules = import.meta.glob<{ default: QuasarLanguage }>(
      '../node_modules/quasar/lang/*.js',
    )
    const langModule = modules[`../node_modules/quasar/lang/${detectedLanguagePack}.js`]
    if (langModule) {
      const lang = await langModule()
      $q.lang.set(lang.default)
    }
  } catch {
    console.error('Error loading Quasar language pack for %s', baseLocale)
  }
}

onBeforeMount(async () => await setQuasarLanguagePack(baseLocale))
</script>
