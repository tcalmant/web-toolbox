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
  <q-card flat bordered>
    <q-card-section>
      <h2 class="text-h6 q-my-none">{{ $t('densityTitle') }}</h2>
    </q-card-section>

    <q-card-section class="row q-col-gutter-md">
      <q-input
        v-model.number="elevation"
        class="col-12 col-sm-4"
        type="number"
        inputmode="numeric"
        :label="$t('densityElevationLabel')"
        :hint="$t('densityElevationHint')"
      />
      <q-input
        v-model.number="qnh"
        class="col-6 col-sm-4"
        type="number"
        inputmode="numeric"
        :label="$t('densityQnhLabel')"
      />
      <q-input
        v-model.number="temperature"
        class="col-6 col-sm-4"
        type="number"
        inputmode="numeric"
        :label="$t('densityTempLabel')"
      />
    </q-card-section>

    <q-separator />

    <q-card-section v-if="!result" class="text-grey">{{ $t('densityNeedInput') }}</q-card-section>
    <q-list v-else separator>
      <q-item>
        <q-item-section>{{ $t('densityPressureAlt') }}</q-item-section>
        <q-item-section side class="text-right">
          {{ Math.round(result.pressureAltitudeFt) }} ft
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>{{ $t('densityIsaDeviation') }}</q-item-section>
        <q-item-section side class="text-right">
          {{ signed(result.isaDeviationC) }} °C
          <q-item-label caption>ISA {{ Math.round(result.isaTemperatureC) }} °C</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="text-weight-medium">{{ $t('densityDensityAlt') }}</q-item-section>
        <q-item-section side class="text-right text-h6">
          {{ Math.round(result.densityAltitudeFt) }} ft
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { densityAltitude } from '@/domain/wind'
import { computed } from 'vue'

const elevation = defineModel<number | null>('elevation', { default: null })
const qnh = defineModel<number | null>('qnh', { default: null })
const temperature = defineModel<number | null>('temperature', { default: null })

const result = computed(() =>
  typeof elevation.value === 'number' &&
  typeof qnh.value === 'number' &&
  qnh.value > 800 &&
  qnh.value < 1100 &&
  typeof temperature.value === 'number'
    ? densityAltitude(elevation.value, qnh.value, temperature.value)
    : null,
)

const signed = (value: number) => `${value > 0 ? '+' : ''}${Math.round(value)}`
</script>
