<template>
  <router-view />
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { onBeforeMount } from 'vue'

const { initLocale } = useLocale()

onBeforeMount(() => void initLocale())
</script>
