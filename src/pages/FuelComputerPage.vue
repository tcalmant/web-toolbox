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
    <div class="flex-break q-py-md"></div>
    <div class="q-gutter-md row">
      <div class="col">
        <InputListHours @update="onDurationUpdate" />
      </div>
      <div class="col">
        <InputListFuel ref="fuelList" :global-fuel-unit="fuelUnit" @update="onFuelUpdate" />
      </div>
    </div>
    <div class="flex-break q-py-md"></div>
    <div class="row">
      <q-table class="col" :rows="resultRows" hide-header hide-pagination />
    </div>
  </q-page>
  <q-footer class="print-only">
    <p>Edited on {{ new Date().toLocaleString() }}</p>
  </q-footer>
</template>

<script setup lang="ts">
import type { FuelOption } from 'src/components/fuelUtils'
import { FUEL_UNITS, FuelQuantity, LITER } from 'src/components/fuelUtils'
import InputListFuel from 'src/components/InputListFuel.vue'
import InputListHours from 'src/components/InputListHours.vue'
import { TimePeriod } from 'src/components/timeUtils'
import { computed, ref, useTemplateRef, watch } from 'vue'

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
const fuelUnit = ref(LITER)
const fuelPerHour = ref(25.0)
const fuelCapacity = ref(110)
const fuelConsumable = ref(109)

const typedFuelCapacity = computed(() => new FuelQuantity(fuelCapacity.value, fuelUnit.value))
const typedFuelConsumable = computed(() => new FuelQuantity(fuelConsumable.value, fuelUnit.value))
const typedNonUsableFuel = computed(() => typedFuelCapacity.value.sub(typedFuelConsumable.value))

// Informative
const fuelPerMinutes = computed(() => fuelPerHour.value / 60)

// Fuel computation
const totalConsumedFuel = ref<FuelQuantity>(new FuelQuantity(0))
const totalAddedFuel = ref<FuelQuantity>(new FuelQuantity(0))
const totalRemainingFuel = ref<FuelQuantity>(new FuelQuantity(0))
const usableRemainingFuel = ref<FuelQuantity>(new FuelQuantity(0))
const usableRemainingTime = ref<TimePeriod>(new TimePeriod(0))

// Template references
const fuelList = useTemplateRef('fuelList')

// Result display
const resultRows = computed((): ResultRow[] => {
  return [
    new ResultRow('Total consumed fuel', `${totalConsumedFuel.value.toString(fuelUnit.value)}`),
    new ResultRow('Total added fuel', `${totalAddedFuel.value.toString(fuelUnit.value)}`),
    new ResultRow(
      'Estimated remaining fuel',
      `${totalRemainingFuel.value.toString(fuelUnit.value)}`,
    ),
    new ResultRow('Estimated usable fuel', `${usableRemainingFuel.value.toString(fuelUnit.value)}`),
    new ResultRow(
      'Estimated remaining flight time',
      usableRemainingTime.value.toString()?.toString() || null,
    ),
  ]
})

// Propagate fuel unit change
watch(fuelUnit, (newValue: FuelOption) => {
  if (fuelList.value != null) {
    fuelList.value.setDefaultFuelUnit(newValue)
  }
})

function onDurationUpdate(duration_s: number): void {
  totalConsumedFuel.value = new FuelQuantity(
    Math.ceil((fuelPerMinutes.value * duration_s) / 60),
    fuelUnit.value,
  )
  updateRemainingFuel()
}

function onFuelUpdate(addedFuel: FuelQuantity): void {
  totalAddedFuel.value = addedFuel.floor()
  updateRemainingFuel()
}

function updateRemainingFuel() {
  totalRemainingFuel.value = FuelQuantity.min(
    totalAddedFuel.value.sub(totalConsumedFuel.value),
    typedFuelCapacity.value,
  )

  usableRemainingFuel.value = FuelQuantity.max(
    new FuelQuantity(0),
    FuelQuantity.min(
      totalRemainingFuel.value.sub(typedNonUsableFuel.value),
      typedFuelConsumable.value,
    ),
  )
  usableRemainingTime.value = new TimePeriod(
    (usableRemainingFuel.value.value.scalar / fuelPerMinutes.value) * 60,
  )
}
</script>
