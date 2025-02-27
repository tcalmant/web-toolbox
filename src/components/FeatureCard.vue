<template>
  <div class="q-pa-md row items-start q-gutter-md">

    <q-card v-ripple dark bordered class="bg-grey-9 cursor-pointer q-hoverable card-width" @click="$router.push(page)">
      <span class="q-focus-helper"></span>
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        {{ description }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
export interface Feature {
  title: string
  page: string
  icon?: string
  description?: string
}

defineProps<Feature>()
</script>

<style lang="sass" scoped>
.card-width
  width: 100%
  max-width: 250px
</style>
