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
    <q-card-section class="row items-center no-wrap">
      <h2 class="text-h6 q-my-none col">{{ $t('worldClockTitle') }}</h2>
      <q-btn
        flat
        dense
        round
        icon="restart_alt"
        :aria-label="$t('resetZones')"
        @click="emit('reset')"
      >
        <q-tooltip>{{ $t('resetZones') }}</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-list v-if="zones.length > 0" separator>
      <q-item v-for="zone in zones" :key="zone">
        <q-item-section>
          <q-item-label>{{ zoneName(zone) }}</q-item-label>
          <q-item-label caption>{{ zone }}, UTC{{ formatOffset(now, zone) }}</q-item-label>
        </q-item-section>
        <q-item-section side class="text-right">
          <q-item-label class="text-h6 clock-digits">
            {{ formatClock(now, zone, true) }}
          </q-item-label>
          <q-item-label caption>{{ formatDay(now, zone) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            dense
            round
            icon="close"
            :aria-label="$t('removeZoneAria', { zone: zoneName(zone) })"
            @click="emit('remove', zone)"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-section v-else class="text-grey">{{ $t('worldClockEmpty') }}</q-card-section>

    <q-card-section>
      <div class="text-caption text-grey-7 q-mb-xs">{{ $t('presetsLabel') }}</div>
      <div class="row q-gutter-xs q-mb-md">
        <q-chip
          v-for="zone in availablePresets"
          :key="zone"
          clickable
          outline
          color="primary"
          icon="add"
          @click="emit('add', zone)"
        >
          {{ zoneName(zone) }}
        </q-chip>
        <q-chip
          v-if="localZone && !zones.includes(localZone)"
          clickable
          outline
          color="primary"
          icon="my_location"
          @click="emit('add', localZone)"
        >
          {{ $t('addLocalZone') }}
        </q-chip>
      </div>
      <TimezoneSelect
        :model-value="null"
        :label="$t('addZoneLabel')"
        @update:model-value="(zone: string) => emit('add', zone)"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import TimezoneSelect from '@/components/TimezoneSelect.vue'
import { useZoneName } from '@/composables/useZoneName'
import {
  formatClock,
  formatDay,
  formatOffset,
  isValidTimeZone,
  localTimeZone,
  PRESET_ZONES,
} from '@/domain/timezones'
import { computed } from 'vue'

const props = defineProps<{ zones: string[]; now: Date }>()
const emit = defineEmits<{ add: [zone: string]; remove: [zone: string]; reset: [] }>()

const { zoneName } = useZoneName()

const localZone = isValidTimeZone(localTimeZone()) ? localTimeZone() : ''
const availablePresets = computed(() => PRESET_ZONES.filter((z) => !props.zones.includes(z)))
</script>

<style scoped>
.clock-digits {
  font-variant-numeric: tabular-nums;
}
</style>
