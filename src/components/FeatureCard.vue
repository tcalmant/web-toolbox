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
