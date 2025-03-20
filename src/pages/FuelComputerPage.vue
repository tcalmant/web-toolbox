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
    <div class="q-gutter-md row">
      <q-input
        class="col"
        v-model="planeIdent"
        label="Immatriculation"
        hint="Immatriculation of the plane"
      />
      <q-select class="col-1" v-model="fuelUnit" :options="Object.values(FuelUnit)" />
      <q-input
        class="col"
        v-model="fuelPerHour"
        label="Fuel consumption"
        :hint="`Fuel consumption per hour (${fuelPerMinutes.toFixed(2)} ${fuelUnit}/minute)`"
      />
      <q-input
        class="col"
        v-model="fuelCapacity"
        label="Fuel capacity"
        hint="Total fuel capacity"
      />
      <q-input
        class="col"
        v-model="fuelConsumable"
        label="Consumable fuel"
        hint="Total consumable fuel"
      />
    </div>
    <div class="flex-break q-py-md"></div>
    <div class="q-gutter-md row">
      <div class="col">
        <InputListHours @update="onDurationUpdate" />
      </div>
      <div class="col">
        <InputListFuel />
      </div>
    </div>
    <div class="flex-break q-py-md"></div>
    <div class="row">
      <q-table class="col" title="Result" :rows="resultRows" hide-header hide-pagination />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import InputListHours from 'src/components/InputListHours.vue'
import InputListFuel from 'src/components/InputListFuel.vue'
import { computed, ref } from 'vue'
import { FuelUnit } from 'src/components/fuelUtils'

class ResultRow {
  label: string
  value: string

  constructor(label: string, value: string | number | null | undefined) {
    this.label = label
    if (value === null || value === undefined) {
      this.value = 'n/a'
    } else if (typeof value === 'number') {
      this.value = Math.ceil(value).toString()
    } else {
      this.value = value.toString()
    }
  }
}

// Plane description
const planeIdent = ref('')
const fuelUnit = ref(FuelUnit.LITER)
const fuelPerHour = ref(25.0)
const fuelCapacity = ref(110)
const fuelConsumable = ref(109)

// Informative
const fuelPerMinutes = computed(() => fuelPerHour.value / 60)

// Fuel computation
const totalConsumedFuel = ref<number>(0)
const totalAddedFuel = ref<number | null>(null)
const totalRemainingFuel = ref<number | null>(null)
const usableRemainingFuel = ref<number | null>(null)

// Result display
const resultRows = computed((): ResultRow[] => {
  return [
    new ResultRow('Total consumed fuel', totalConsumedFuel.value),
    new ResultRow('Total added fuel', totalAddedFuel.value),
    new ResultRow('Estimated remaining fuel', totalRemainingFuel.value),
    new ResultRow('Estimated usable fuel', usableRemainingFuel.value),
  ]
})

function onDurationUpdate(duration_s: number): void {
  totalConsumedFuel.value = Math.ceil((fuelPerMinutes.value * duration_s) / 60)
}
</script>
