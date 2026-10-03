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
  <q-page padding>
    <div class="column q-gutter-y-md">
      <WeatherDecoderCard @use-wind="onUseWind" @use-density="onUseDensity" />
      <WindCalculatorCard
        v-model:direction="windDirection"
        v-model:speed="windSpeed"
        v-model:gust="windGust"
        v-model:unit="windUnit"
      />
      <DensityAltitudeCard
        v-model:elevation="elevation"
        v-model:qnh="qnh"
        v-model:temperature="temperature"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import KnownAirfields from '@/adapters/data/airfieldsRepository'
import DensityAltitudeCard from '@/components/DensityAltitudeCard.vue'
import WeatherDecoderCard from '@/components/WeatherDecoderCard.vue'
import WindCalculatorCard from '@/components/WindCalculatorCard.vue'
import { type Metar, windSpeedKt } from '@/domain/metar'
import { ref } from 'vue'

const windDirection = ref<number | null>(null)
const windSpeed = ref<number | null>(null)
const windGust = ref<number | null>(null)
const windUnit = ref<'kt' | 'kmh'>('kt')

const elevation = ref<number | null>(null)
const qnh = ref<number | null>(null)
const temperature = ref<number | null>(null)

function onUseWind(metar: Metar) {
  if (!metar.wind) {
    return
  }
  // METAR speeds are converted to knots, so the calculator must be in knots too
  windUnit.value = 'kt'
  windDirection.value = metar.wind.directionDeg
  windSpeed.value = Math.round(windSpeedKt(metar.wind))
  windGust.value =
    metar.wind.gust === null ? null : Math.round(windSpeedKt(metar.wind, metar.wind.gust))
}

function onUseDensity(metar: Metar) {
  qnh.value = metar.qnhHpa
  temperature.value = metar.temperatureC
  const airfield = KnownAirfields[metar.station]
  if (airfield?.elevation != null) {
    elevation.value = Math.round(airfield.elevation)
  }
}
</script>
