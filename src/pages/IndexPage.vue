<template>
  <q-page class="row items-center justify-evenly">
    <FeatureCard v-for="feature in featuresList" :key="feature.title" v-bind="feature" />
  </q-page>
</template>

<script setup lang="ts">
import type { Feature } from 'src/components/FeatureCard.vue';
import FeatureCard from 'src/components/FeatureCard.vue';

const featuresList: Feature[] = [
  {
    title: 'Timestamp',
    page: 'timestamp',
    description: 'A tool to convert between timestamps and dates'
  },
  {
    title: 'Fuel Computer',
    page: 'fuel-computer',
    description: 'A tool to compute remaining fuel'
  },
  {
    title: 'Notam Mapper',
    page: 'notam-mapper',
    description: 'A tool to put NOTAM on a map'
  }
];
</script>
