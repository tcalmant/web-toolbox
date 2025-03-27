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
  <q-page padding class="col">
    <div class="q-gutter-md">
      <div class="row q-gutter-md print-hide">
        <q-input
          class="col"
          v-model="planeIdent"
          label="Immatriculation"
          hint="Immatriculation of the plane"
        />
        <q-select class="col-1" v-model="fuelUnit" :options="FUEL_UNITS" />
        <q-input
          class="col"
          v-model="fuelPerHour"
          label="Fuel consumption"
          :hint="`Fuel consumption per hour (${fuelPerMinutes.toFixed(2)} ${fuelUnit.label}/minute)`"
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
      <div class="row q-gutter-md print-only">
        <span v-if="planeIdent" class="col-1">{{ planeIdent }}</span>
        <span class="col"
          >Fuel Consumption: {{ fuelPerHour }} {{ fuelUnit.label }}/h ({{
            fuelPerMinutes.toFixed(2)
          }}
          {{ fuelUnit.label }}/min)</span
        >
        <span class="col">Fuel capacity: {{ fuelCapacity }}&nbsp;{{ fuelUnit.label }}</span>
        <span class="col">Consumable fuel: {{ fuelConsumable }}&nbsp;{{ fuelUnit.label }}</span>
      </div>
      <q-separator />
      <div class="q-gutter-md">
        <q-table
          class="col"
          :rows="resultRows"
          :rows-per-page-options="[0]"
          hide-header
          hide-pagination
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="q-tr--no-hover"
              :class="{
                'text-negative': props.row.showAlert,
                'text-warning': props.row.showWarning,
                'text-weight-medium': props.row.showAlert || props.row.showWarning,
              }"
            >
              <q-td key="label" :props="props">
                {{ props.row.label }}
              </q-td>
              <q-td key="value" :props="props" class="text-right">{{ props.row.value }} </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-separator />
      <q-checkbox class="print-hide" v-model="printInputTables" label="Print tables" />
      <div class="row q-gutter-md" :class="{ 'print-hide': !printInputTables }">
        <InputListHours class="col" v-model="totalFlightDuration" title="Flight times" />
        <InputListFuel
          class="col"
          v-model="totalAddedFuel"
          :global-fuel-unit="fuelUnit"
          title="Added fuel"
        />
      </div>
    </div>
  </q-page>
  <q-footer class="print-only">
    <p>Edited on {{ new Date().toLocaleString() }}</p>
  </q-footer>
</template>

<script setup lang="ts">
import { FUEL_UNITS, FuelQuantity, LITER } from 'src/components/fuelUtils'
import InputListFuel from 'src/components/InputListFuel.vue'
import InputListHours from 'src/components/InputListHours.vue'
import { TimePeriod } from 'src/components/timeUtils'
import { computed, ref } from 'vue'

class ResultRow {
  label: string
  value: string
  showWarning: boolean
  showAlert: boolean

  constructor(
    label: string,
    value: string | number | null | undefined,
    showWarning: boolean = false,
    showAlert: boolean = false,
  ) {
    this.label = label
    if (value === null || value === undefined) {
      this.value = 'n/a'
    } else if (typeof value === 'number') {
      this.value = Math.ceil(value).toString()
    } else {
      this.value = value.toString()
    }

    this.showAlert = showAlert
    this.showWarning = !showAlert && showWarning
  }
}

// Plane description
const planeIdent = ref('')
const fuelUnit = ref(LITER)
const fuelPerHour = ref(25.0)
const fuelCapacity = ref(110)
const fuelConsumable = ref(109)

// ... typed description
const typedFuelCapacity = computed(() => new FuelQuantity(fuelCapacity.value, fuelUnit.value))
const typedFuelConsumable = computed(() => new FuelQuantity(fuelConsumable.value, fuelUnit.value))
const typedNonUsableFuel = computed(() => typedFuelCapacity.value.sub(typedFuelConsumable.value))

// Informative
const fuelPerMinutes = computed(() => fuelPerHour.value / 60)

// Flight duration
const totalFlightDuration = ref<TimePeriod>(new TimePeriod(0))

// Fuel computation
const totalAddedFuel = ref<FuelQuantity>(new FuelQuantity(0))
const totalConsumedFuel = computed(
  () =>
    new FuelQuantity(
      Math.ceil((fuelPerMinutes.value * totalFlightDuration.value.duration_s) / 60),
      fuelUnit.value,
    ),
)
const totalRemainingFuel = computed(() =>
  FuelQuantity.min(totalAddedFuel.value.sub(totalConsumedFuel.value), typedFuelCapacity.value),
)
const usableRemainingFuel = computed(() =>
  FuelQuantity.max(
    new FuelQuantity(0),
    FuelQuantity.min(
      totalRemainingFuel.value.sub(typedNonUsableFuel.value),
      typedFuelConsumable.value,
    ),
  ),
)
const usableRemainingTime = computed(
  () => new TimePeriod((usableRemainingFuel.value.value.scalar / fuelPerMinutes.value) * 60),
)

// Result display
const resultRows = computed((): ResultRow[] => {
  // Warning if less than 1h of fuel
  const fuelLevelWarning = usableRemainingTime.value.duration_s < 3600

  // Danger if less than 30min of fuel
  const noFuelAlert = usableRemainingTime.value.duration_s < 30 * 60

  return [
    new ResultRow('Total flight time', `${totalFlightDuration.value.toString()}`),
    new ResultRow('Total consumed fuel', `${totalConsumedFuel.value.toString(fuelUnit.value)}`),
    new ResultRow('Total added fuel', `${totalAddedFuel.value.toString(fuelUnit.value)}`),
    new ResultRow(
      'Estimated remaining fuel',
      `${totalRemainingFuel.value.toString(fuelUnit.value)}`,
      fuelLevelWarning,
      noFuelAlert,
    ),
    new ResultRow(
      'Estimated usable fuel',
      `${usableRemainingFuel.value.toString(fuelUnit.value)}`,
      fuelLevelWarning,
      noFuelAlert,
    ),
    new ResultRow(
      'Estimated remaining flight time',
      usableRemainingTime.value.toString()?.toString() || null,
      fuelLevelWarning,
      noFuelAlert,
    ),
  ]
})

// Print tables switch
const printInputTables = ref(false)
</script>
