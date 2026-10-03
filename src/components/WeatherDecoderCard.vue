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
      <h2 class="text-h6 q-my-none">{{ $t('decoderTitle') }}</h2>
    </q-card-section>

    <q-card-section>
      <q-input
        v-model="text"
        type="textarea"
        autogrow
        filled
        clearable
        input-class="monospace"
        :label="$t('decoderLabel')"
        :hint="$t('decoderHint')"
        :placeholder="'METAR LFLB 031700Z AUTO 35001KT 9999 NSC 20/17 Q1027'"
      />
    </q-card-section>

    <q-separator v-if="text" />
    <q-card-section v-if="text && reports.length === 0" class="text-grey">
      {{ $t('decoderEmpty') }}
    </q-card-section>

    <q-list separator>
      <template v-for="(report, idx) in reports" :key="idx">
        <q-item v-if="!isTaf(report)">
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ report.kind }} {{ report.station }}
              <span class="text-caption text-grey-7">
                {{ dayTimeText(report.time) }}
                <template v-if="report.auto"> {{ $t('decoderAuto') }}</template>
              </span>
            </q-item-label>
            <q-item-label v-if="report.wind">
              {{ $t('decoderWind') }}: {{ windText(report.wind) }}
              <template v-if="report.windVariation">
                ({{ report.windVariation.fromDeg }}° - {{ report.windVariation.toDeg }}°)
              </template>
            </q-item-label>
            <q-item-label>{{ $t('decoderVisibility') }}: {{ visibilityText(report) }}</q-item-label>
            <q-item-label v-if="weatherListText(report)">
              {{ $t('decoderWeather') }}: {{ weatherListText(report) }}
            </q-item-label>
            <q-item-label v-if="skyText(report)">
              {{ $t('decoderSky') }}: {{ skyText(report) }}
            </q-item-label>
            <q-item-label v-if="report.temperatureC !== null">
              {{ $t('decoderTemperature') }}: {{ report.temperatureC }} °C
              <template v-if="report.dewPointC !== null"> / {{ report.dewPointC }} °C </template>
            </q-item-label>
            <q-item-label v-if="report.qnhHpa !== null">
              {{ $t('decoderQnh') }}: {{ report.qnhHpa }} hPa
            </q-item-label>
            <q-item-label v-if="report.trend" caption class="monospace">
              {{ report.trend }}
            </q-item-label>
            <q-item-label v-if="report.unparsed.length" caption class="text-orange-9">
              {{ $t('decoderUnparsed') }}: {{ report.unparsed.join(' ') }}
            </q-item-label>
            <div class="row q-gutter-xs q-mt-xs">
              <q-btn
                v-if="report.wind && report.wind.directionDeg !== null"
                outline
                dense
                no-caps
                color="primary"
                icon="air"
                :label="$t('decoderUseWind')"
                @click="emit('useWind', report)"
              />
              <q-btn
                v-if="report.qnhHpa !== null && report.temperatureC !== null"
                outline
                dense
                no-caps
                color="primary"
                icon="height"
                :label="$t('decoderUseDensity')"
                @click="emit('useDensity', report)"
              />
            </div>
          </q-item-section>
        </q-item>

        <q-item v-else>
          <q-item-section>
            <q-item-label class="text-weight-medium">
              TAF {{ report.station }}
              <span class="text-caption text-grey-7">
                {{ dayTimeText(report.validFrom) }} - {{ dayTimeText(report.validTo) }}
                <template v-if="report.amended"> AMD</template>
                <template v-if="report.corrected"> COR</template>
              </span>
            </q-item-label>
            <q-item-label v-if="report.extras.length" caption class="monospace">
              {{ $t('decoderTemperatureGroups') }}: {{ report.extras.join(' ') }}
            </q-item-label>
            <div v-for="(group, gidx) in report.groups" :key="gidx" class="q-mt-sm">
              <div class="text-weight-medium">
                {{ $t(`tafGroup_${group.kind}`) }}
                <template v-if="group.probability !== null"> {{ group.probability }}%</template>
                <span v-if="group.from" class="text-caption text-grey-7">
                  {{ dayTimeText(group.from) }}
                  <template v-if="group.to"> - {{ dayTimeText(group.to) }}</template>
                </span>
              </div>
              <div v-if="group.wind">{{ $t('decoderWind') }}: {{ windText(group.wind) }}</div>
              <div v-if="group.cavok || group.visibilityM !== null">
                {{ $t('decoderVisibility') }}: {{ visibilityText(group) }}
              </div>
              <div v-if="weatherListText(group)">
                {{ $t('decoderWeather') }}: {{ weatherListText(group) }}
              </div>
              <div v-if="group.clouds.length || group.skyClear">
                {{ $t('decoderSky') }}: {{ skyText(group) }}
              </div>
              <div v-if="group.unparsed.length" class="text-caption text-orange-9">
                {{ $t('decoderUnparsed') }}: {{ group.unparsed.join(' ') }}
              </div>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { useWeatherFormat } from '@/composables/useWeatherFormat'
import { isTaf, type Metar, parseReports } from '@/domain/metar'
import { computed, ref } from 'vue'

const emit = defineEmits<{ useWind: [metar: Metar]; useDensity: [metar: Metar] }>()

const { windText, visibilityText, skyText, weatherListText, dayTimeText } = useWeatherFormat()

const text = ref('')
const reports = computed(() => parseReports(text.value ?? ''))
</script>

<style scoped>
.monospace,
:deep(.monospace) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
</style>
