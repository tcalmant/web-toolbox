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
      <h2 class="text-h6 q-my-none">{{ $t('windCalcTitle') }}</h2>
    </q-card-section>

    <q-card-section class="column q-gutter-y-md">
      <div class="row q-col-gutter-md">
        <q-input
          v-model="runway"
          class="col-12 col-sm-4"
          :label="$t('windRunwayLabel')"
          :hint="$t('windRunwayHint')"
          :error="runway !== '' && heading === null"
          :error-message="$t('windRunwayInvalid')"
          maxlength="4"
          autocapitalize="characters"
        />
        <q-input
          v-model.number="direction"
          class="col-6 col-sm-4"
          type="number"
          inputmode="numeric"
          min="0"
          max="360"
          :label="$t('windDirectionLabel')"
          :hint="$t('windDirectionHint')"
        />
        <div class="col-6 col-sm-4 row items-center justify-end">
          <q-btn-toggle
            v-model="unit"
            no-caps
            unelevated
            toggle-color="primary"
            :options="[
              { label: 'kt', value: 'kt' },
              { label: 'km/h', value: 'kmh' },
            ]"
            :aria-label="$t('windUnitLabel')"
            @update:model-value="onUnitChange"
          />
        </div>
      </div>
      <div class="row q-col-gutter-md">
        <q-input
          v-model.number="speed"
          class="col-4"
          type="number"
          inputmode="numeric"
          min="0"
          :label="$t('windSpeedLabel')"
        />
        <q-input
          v-model.number="gust"
          class="col-4"
          type="number"
          inputmode="numeric"
          min="0"
          :label="$t('windGustLabel')"
        />
        <q-input
          v-model.number="limit"
          class="col-4"
          type="number"
          inputmode="numeric"
          min="0"
          :label="$t('windLimitLabel')"
          :hint="$t('windLimitHint')"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="!ready" class="text-grey">{{ $t('windNeedInput') }}</q-card-section>
    <q-list v-else separator>
      <q-item v-for="end in ends" :key="end.heading" :class="{ 'bg-green-1': end.best }">
        <q-item-section>
          <q-item-label>
            {{ $t('windRunwayEnd', { runway: end.designator, heading: end.heading }) }}
            <q-badge v-if="end.best" color="green-8" class="q-ml-xs">
              {{ $t('windBestRunway') }}
            </q-badge>
          </q-item-label>
          <q-item-label caption>{{ end.caption }}</q-item-label>
        </q-item-section>
        <q-item-section side class="text-right">
          <q-item-label :class="end.crossClass">
            <q-icon v-if="end.crossLevel !== 'ok'" name="warning" class="q-mr-xs" />
            {{ $t('windCrosswind') }} {{ format(end.main.crosswind) }} {{ unitLabel }}
          </q-item-label>
          <q-item-label :class="end.main.headwind < 0 ? 'text-negative' : ''">
            {{ end.main.headwind < 0 ? $t('windTailwind') : $t('windHeadwind') }}
            {{ format(Math.abs(end.main.headwind)) }} {{ unitLabel }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import {
  KMH_PER_KNOT,
  parseRunwayHeading,
  reciprocalHeading,
  windComponents,
  type WindComponents,
} from '@/domain/wind'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const direction = defineModel<number | null>('direction', { default: null })
const speed = defineModel<number | null>('speed', { default: null })
const gust = defineModel<number | null>('gust', { default: null })
const unit = defineModel<'kt' | 'kmh'>('unit', { default: 'kt' })

const { t } = useI18n()

const runway = ref('')
// 40 km/h (22 kt) is the demonstrated crosswind of the club's DR400s
const limit = ref<number | null>(22)

const unitLabel = computed(() => (unit.value === 'kt' ? 'kt' : 'km/h'))
const format = (value: number) => Math.round(value).toString()

const heading = computed(() => parseRunwayHeading(runway.value))

function onUnitChange(newUnit: 'kt' | 'kmh') {
  // Convert the entered speeds so that the physical values stay the same
  const factor = newUnit === 'kmh' ? KMH_PER_KNOT : 1 / KMH_PER_KNOT
  for (const model of [speed, gust, limit]) {
    if (typeof model.value === 'number') {
      model.value = Math.round(model.value * factor)
    }
  }
}

const ready = computed(
  () =>
    heading.value !== null &&
    typeof direction.value === 'number' &&
    direction.value >= 0 &&
    direction.value <= 360 &&
    typeof speed.value === 'number' &&
    speed.value >= 0,
)

const designator = (deg: number) => (Math.round(deg / 10) || 36).toString().padStart(2, '0')

type Level = 'ok' | 'warning' | 'over'

function crossLevel(crosswind: number): Level {
  const max = limit.value
  if (typeof max !== 'number' || max <= 0) {
    return 'ok'
  }
  if (crosswind > max) {
    return 'over'
  }
  return crosswind > 0.75 * max ? 'warning' : 'ok'
}

const ends = computed(() => {
  if (!ready.value || heading.value === null || direction.value === null || speed.value === null) {
    return []
  }
  const dir = direction.value
  const spd = speed.value
  const gst = typeof gust.value === 'number' && gust.value > spd ? gust.value : null

  const rows = [heading.value, reciprocalHeading(heading.value)].map((h) => {
    const main: WindComponents = windComponents(h, dir, gst ?? spd)
    const steady: WindComponents = windComponents(h, dir, spd)
    const level = crossLevel(main.crosswind)
    const side =
      main.crosswindSide === 'none'
        ? ''
        : t(main.crosswindSide === 'left' ? 'windFromLeft' : 'windFromRight')
    const gustNote = gst === null ? '' : t('windWithGust', { cross: format(steady.crosswind) })
    return {
      heading: h,
      designator: designator(h),
      main,
      best: false,
      crossLevel: level,
      crossClass: level === 'over' ? 'text-negative' : level === 'warning' ? 'text-orange-9' : '',
      caption: [side, gustNote].filter((s) => s.length > 0).join(', '),
    }
  })
  // Best end: the most headwind (least tailwind)
  const best = rows[0]!.main.headwind >= rows[1]!.main.headwind ? 0 : 1
  rows[best]!.best = true
  return rows
})
</script>
