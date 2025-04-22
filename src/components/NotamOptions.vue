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
  <div class="row q-gutter-xl">
    <q-btn class="col" color="secondary" icon="edit" @click.prevent="emit('showAipEdit')">
      {{ $t('aipEditLabel') }}
    </q-btn>
    <q-btn class="col" color="primary" icon="edit" @click.prevent="emit('showNotamEdit')">
      {{ $t('notamEditLabel') }}
    </q-btn>
  </div>
  <div :class="{ row: !isPortrait, col: isPortrait }">
    <q-checkbox
      :class="{ col: !isPortrait, row: isPortrait }"
      v-model="ignoreLargeNotams"
      :label="$t('notamFilterLarge')"
    />
    <q-slider
      :class="{ 'col-5': !isPortrait, row: isPortrait }"
      v-model="maxNotamRadius"
      :min="1"
      :max="999"
      label
      switch-label-side
      :label-always="ignoreLargeNotams"
      :label-value="maxNotamRadius + ' NM'"
    />
  </div>
  <div class="row">
    <q-checkbox v-model="onlyWithPositions" :label="$t('notamFilterLocated')" />
  </div>
  <div class="row">
    <q-checkbox v-model="showAreaOfInfluence" :label="$t('notamFilterShowArea')" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const ignoreLargeNotams = defineModel<boolean>('ignoreLargeNotams', { default: true })
const maxNotamRadius = defineModel<number>('maxNotamRadius', { default: 100 })
const onlyWithPositions = defineModel<boolean>('onlyWithPositions', { default: true })
const showAreaOfInfluence = defineModel<boolean>('showAreaOfInfluence', { default: true })
const emit = defineEmits(['showNotamEdit', 'showAipEdit'])

const isPortrait = ref(window.innerHeight > window.innerWidth)

const updateOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth
}

onMounted(() => window.addEventListener('resize', updateOrientation))
onUnmounted(() => window.removeEventListener('resize', updateOrientation))
</script>
