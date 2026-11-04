<!--
Copyright (c) 2026 Thomas Calmant
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
      <h2 class="text-h6 q-my-none">{{ $t('sunTitle') }}</h2>
    </q-card-section>

    <q-card-section class="row q-col-gutter-md">
      <q-input
        :model-value="icao"
        class="col-12 col-sm-6"
        :label="$t('sunAirfield')"
        maxlength="4"
        stack-label
        @update:model-value="icao = String($event ?? '').toUpperCase()"
      />
      <q-input
        v-model="day"
        class="col-12 col-sm-6"
        type="date"
        :label="$t('sunDate')"
        stack-label
      />
    </q-card-section>

    <q-banner v-if="icao.length === 4 && !airfield" class="text-negative" role="alert">
      {{ $t('sunUnknownAirfield', { icao }) }}
    </q-banner>
    <template v-else-if="times">
      <q-list separator>
        <q-item v-for="row in rows" :key="row.label">
          <q-item-section>
            <q-item-label>{{ row.label }}</q-item-label>
            <q-item-label v-if="row.note" caption>{{ row.note }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="row.at" side class="text-right">
            <q-item-label class="text-h6 clock-digits">{{ clock(row.at, 'UTC') }} UTC</q-item-label>
            <q-item-label v-if="zone" caption>
              {{ $t('sunLocalTime', { time: clock(row.at, zone) }) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-section class="text-caption text-grey-8">
        <p class="q-mb-xs">{{ $t('sunNightSera') }}</p>
        <p class="q-mb-none">{{ $t('sunNightFormer') }}</p>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import KnownAirfields from '@/adapters/data/airfieldsRepository'
import { type SunCrossing, sunTimes } from '@/domain/sun'
import { formatClock, formatDay } from '@/domain/timezones'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Only the zones that are certain from the ICAO prefix, longest prefix first
const LOCAL_ZONES: [string, string][] = [
  ['LFV', 'America/Miquelon'],
  ['LF', 'Europe/Paris'],
]

// Former French night limits, kept for comparison
const FORMER_NIGHT_OFFSET_MS = 30 * 60000

const { t } = useI18n()

const icao = ref('')
const day = ref(formatDay(new Date(), 'UTC'))

const airfield = computed(() => KnownAirfields[icao.value] ?? null)
const zone = computed(() => LOCAL_ZONES.find(([prefix]) => icao.value.startsWith(prefix))?.[1])

const times = computed(() => {
  const date = new Date(`${day.value}T00:00:00Z`)
  if (!airfield.value || isNaN(date.getTime())) {
    return null
  }
  return sunTimes(airfield.value.latitude, airfield.value.longitude, date)
})

interface Row {
  label: string
  at?: Date
  note?: string
}

function polarNote(c: SunCrossing): string {
  return c.kind === 'alwaysAbove' ? t('sunAlwaysAbove') : t('sunAlwaysBelow')
}

const rows = computed<Row[]>(() => {
  if (!times.value) {
    return []
  }
  const { sun, civil } = times.value
  const civilRows: Row[] =
    civil.kind === 'crossing'
      ? [
          { label: t('sunCivilDawn'), at: civil.rise, note: t('sunNightEndSera') },
          { label: t('sunCivilDusk'), at: civil.set, note: t('sunNightStartSera') },
        ]
      : [{ label: t('sunCivilTwilight'), note: polarNote(civil) }]
  const sunRows: Row[] =
    sun.kind === 'crossing'
      ? [
          { label: t('sunrise'), at: sun.rise },
          { label: t('sunset'), at: sun.set },
          {
            label: t('sunNightEndFormer'),
            at: new Date(sun.rise.getTime() - FORMER_NIGHT_OFFSET_MS),
          },
          {
            label: t('sunNightStartFormer'),
            at: new Date(sun.set.getTime() + FORMER_NIGHT_OFFSET_MS),
          },
        ]
      : [{ label: t('sunriseSunset'), note: polarNote(sun) }]
  return [...civilRows, ...sunRows].sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0))
})

// Shows the date when the event falls outside the chosen UTC date
function clock(at: Date, tzName: string): string {
  const time = formatClock(at, tzName)
  return formatDay(at, 'UTC') === day.value ? time : `${formatDay(at, tzName)} ${time}`
}
</script>

<style scoped>
.clock-digits {
  font-variant-numeric: tabular-nums;
}
</style>
