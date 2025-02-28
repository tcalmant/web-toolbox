<!--
Copyright (c) 2025 Thomas Calmant
All rights reserved.

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

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
