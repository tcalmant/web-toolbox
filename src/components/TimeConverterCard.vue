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
      <h2 class="text-h6 q-my-none">{{ $t('converterTitle') }}</h2>
    </q-card-section>

    <q-card-section class="column q-gutter-y-md">
      <TimezoneSelect v-model="sourceZone" :label="$t('converterSourceZone')" />
      <div class="row q-col-gutter-md">
        <q-input
          v-model="day"
          class="col-12 col-sm-6"
          type="date"
          :label="$t('converterDate')"
          stack-label
        />
        <q-input
          v-model="time"
          class="col-12 col-sm-6"
          type="time"
          step="60"
          :label="$t('converterTime')"
          stack-label
        >
          <template v-slot:append>
            <q-btn flat dense no-caps :label="$t('converterNow')" @click="setNow" />
          </template>
        </q-input>
      </div>
    </q-card-section>

    <q-separator />

    <q-banner v-if="!instant" class="text-negative" role="alert">
      {{ $t('converterInvalid') }}
    </q-banner>
    <q-list v-else separator>
      <q-item v-for="row in rows" :key="row.zone" :class="{ 'bg-blue-1': row.isSource }">
        <q-item-section>
          <q-item-label>{{ zoneName(row.zone) }}</q-item-label>
          <q-item-label caption>{{ row.zone }}, UTC{{ row.offset }}</q-item-label>
        </q-item-section>
        <q-item-section side class="text-right">
          <q-item-label class="text-h6 clock-digits">
            {{ row.clock }}
            <q-badge v-if="row.shift !== 0" color="orange-8" class="q-ml-xs">
              {{ shiftLabel(row.shift) }}
            </q-badge>
          </q-item-label>
          <q-item-label caption>{{ row.day }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import TimezoneSelect from '@/components/TimezoneSelect.vue'
import { useZoneName } from '@/composables/useZoneName'
import {
  dayShift,
  formatClock,
  formatDay,
  formatOffset,
  isValidTimeZone,
  localTimeZone,
  parseDayAndTime,
  zonedTimeToInstant,
} from '@/domain/timezones'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ zones: string[] }>()

const { t } = useI18n()
const { zoneName } = useZoneName()

const sourceZone = ref<string>(isValidTimeZone(localTimeZone()) ? localTimeZone() : 'UTC')
const day = ref('')
const time = ref('')

function setNow() {
  const now = new Date()
  day.value = formatDay(now, sourceZone.value)
  time.value = formatClock(now, sourceZone.value)
}
setNow()

const instant = computed<Date | null>(() => {
  const parts = parseDayAndTime(day.value, time.value)
  return parts ? zonedTimeToInstant(parts, sourceZone.value) : null
})

const rows = computed(() => {
  const at = instant.value
  if (!at) {
    return []
  }
  const zones = [sourceZone.value, ...props.zones.filter((z) => z !== sourceZone.value)]
  return zones.map((zone) => ({
    zone,
    isSource: zone === sourceZone.value,
    clock: formatClock(at, zone),
    day: formatDay(at, zone),
    offset: formatOffset(at, zone),
    shift: dayShift(at, zone, sourceZone.value),
  }))
})

function shiftLabel(shift: number): string {
  return t('dayShiftBadge', { shift: shift > 0 ? `+${shift}` : `${shift}` })
}
</script>

<style scoped>
.clock-digits {
  font-variant-numeric: tabular-nums;
}
</style>
