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
  <q-card class="q-gutter-xs">
    <div class="column q-gutter-xs">
      <q-list bordered>
        <q-item v-for="(value, idx) in allValues" :key="idx">
          <q-item-section> {{ value.quantity }}&nbsp;{{ value.unit }} </q-item-section>
          <q-item-section side> {{ value.toLiters() }}&nbsp;L </q-item-section>
          <q-item-section side>
            <q-icon name="delete" color="red" @click="onDelete(idx)" />
          </q-item-section>
        </q-item>
      </q-list>
      <q-input v-model="totalValue" readonly filled outlined label="Total fuel" />
      <div class="row">
        <div class="col-9">
          <q-input
            v-model.number="inputValue"
            type="number"
            inputmode="numeric"
            filled
            :error="errorMessage != null"
            :error-message="errorMessage ?? undefined"
            @update:model-value="errorMessage = null"
          />
        </div>
        <div class="col-2">
          <q-select class="fit" v-model="inputUnit" :options="Object.values(FuelUnit)" filled />
        </div>
        <div class="col-1">
          <q-btn class="fit" icon="add" @click="onAdd" />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FuelQuantity, FuelUnit } from './fuelUtils'

const emit = defineEmits<{ (e: 'update', duration_s: number): void }>()
const allValues = ref<FuelQuantity[]>([new FuelQuantity(0)])
const inputValue = ref(0)
const inputUnit = ref(FuelUnit.LITER)
const errorMessage = ref<string | null>(null)
const totalValue = ref(new FuelQuantity(0).toString())

function onAdd() {
  const newValue = new FuelQuantity(inputValue.value, inputUnit.value)
  let localValues
  if (
    allValues.value.length == 0 ||
    (allValues.value.length == 1 && allValues.value[0]?.quantity == 0)
  ) {
    localValues = [newValue]
  } else {
    localValues = [...allValues.value, newValue]
  }

  recompute(localValues)
}

function onDelete(idx: number) {
  const currentValues = allValues.value ?? []
  const newValues = [...currentValues.slice(0, idx), ...currentValues.slice(idx + 1)]
  recompute(newValues)
}

function recompute(localValues: FuelQuantity[]) {
  if (localValues.length == 0) {
    localValues = [new FuelQuantity(0)]
  }

  const totalQuantity = localValues.reduce(
    (a, b) => new FuelQuantity(a.toLiters() + b.toLiters(), FuelUnit.LITER),
    new FuelQuantity(0),
  )

  allValues.value = localValues
  totalValue.value = totalQuantity.toString()
  emit('update', totalQuantity.quantity)
}

function setDefaultFuelUnit(newUnit: FuelUnit) {
  inputUnit.value = newUnit
}
defineExpose({ setDefaultFuelUnit })
</script>
