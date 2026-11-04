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
  <q-list>
    <q-item-label header> {{ t('dataSources') }} </q-item-label>
    <q-item>
      <q-item-section avatar>
        <q-icon
          :name="airfieldsStale ? 'warning' : 'flight_land'"
          :color="airfieldsStale ? 'warning' : undefined"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ t('dataAirfields', { source: AirfieldsMetadata.source }) }}</q-item-label>
        <q-item-label caption>
          {{ t('dataGenerated', { date: AirfieldsMetadata.generated }) }},
          {{
            airfieldsCycle ? t('dataAiracCycle', { cycle: airfieldsCycle }) : t('dataAiracUnknown')
          }},
          {{ t('dataCyclesOld', airfieldsAge) }}
        </q-item-label>
        <q-item-label v-if="airfieldsStale" caption class="text-orange-10">
          {{ t('dataStale') }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section avatar>
        <q-icon name="border_style" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{
            t('dataBorders', { source: BordersMetadata.source, licence: BordersMetadata.licence })
          }}
        </q-item-label>
        <q-item-label caption>
          {{ t('dataGenerated', { date: BordersMetadata.generated }) }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { AirfieldsMetadata } from '@/adapters/data/airfieldsRepository'
import { BordersMetadata } from '@/adapters/data/bordersRepository'
import { airacCycle, airacCyclesBetween } from '@/domain/time'
import { useI18n } from 'vue-i18n'

// Aeronautical data changes every cycle: warn (never block) from this age on
const STALE_AFTER_CYCLES = 2

const { t } = useI18n()

// Date only: a date-time without offset would be read as local time (ECMA-262
// Date Time String Format) and could fall in the previous cycle
const effective = AirfieldsMetadata.effective?.slice(0, 10) ?? null
const airfieldsCycle = effective ? airacCycle(new Date(effective)).id : null
// Without the effective date, the generation date gives a lower bound of the age.
// Data published ahead of its effective date counts as current, not as older
const airfieldsAge = Math.max(
  0,
  airacCyclesBetween(new Date(effective ?? AirfieldsMetadata.generated), new Date()),
)
const airfieldsStale = airfieldsAge >= STALE_AFTER_CYCLES
</script>
