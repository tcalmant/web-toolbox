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
          <q-item-section> {{ value }} </q-item-section>
          <q-item-section side> {{ value.toString(LITER) }} </q-item-section>
          <q-item-section side class="print-hide">
            <q-icon name="delete" color="red" @click="onDelete(idx)" />
          </q-item-section>
        </q-item>
      </q-list>
      <div class="row items-center">
        <div class="col-10">
          <q-input v-model="totalValueString" readonly filled outlined label="Total fuel" />
        </div>
        <div class="col q-px-md print-hide">
          <q-btn @mousedown.prevent @click="onDeleteAll()">
            <q-icon name="delete_forever" color="red" />
            <span>Clear&nbsp;all</span>
          </q-btn>
        </div>
      </div>
      <q-form class="row print-hide" @submit.prevent="onAdd">
        <div class="col-9">
          <q-input
            ref="fuelInputField"
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
          <q-select class="fit" v-model="inputUnit" :options="FUEL_UNITS" filled />
        </div>
        <div class="col-1">
          <q-btn class="fit" icon="add" type="submit" />
        </div>
      </q-form>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { QInput, useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import type { FuelOption } from './fuelUtils'
import { FUEL_UNITS, FuelQuantity, LITER } from './fuelUtils'

const $q = useQuasar()
const emit = defineEmits<{ (e: 'update', quantity: FuelQuantity): void }>()
const props = defineProps<{ globalFuelUnit: FuelOption }>()

const allValues = ref<FuelQuantity[]>([new FuelQuantity(0)])
const inputValue = ref(0)
const inputUnit = ref(LITER)
const errorMessage = ref<string | null>(null)
const totalQuantity = ref<FuelQuantity>(new FuelQuantity(0))
const fuelInputField = ref<QInput>()
const totalValueString = computed(() =>
  totalQuantity.value.toString(props.globalFuelUnit ?? inputValue.value),
)

function onAdd() {
  const newValue = new FuelQuantity(inputValue.value, inputUnit.value)
  let localValues
  if (
    allValues.value.length == 0 ||
    (allValues.value.length == 1 && allValues.value[0]?.value.scalar == 0)
  ) {
    localValues = [newValue]
  } else {
    localValues = [...allValues.value, newValue]
  }

  recompute(localValues)
  fuelInputField.value?.focus()
}

function onDelete(idx: number) {
  const currentValues = allValues.value ?? []
  const newValues = [...currentValues.slice(0, idx), ...currentValues.slice(idx + 1)]
  recompute(newValues)
}

function onDeleteAll() {
  if (allValues.value?.length > 1) {
    $q.dialog({
      title: 'Confirm',
      message: 'Delete all entries?',
      cancel: true,
      persistent: false,
    })
      .onOk(() => {
        recompute([])
      })
      .onDismiss(() => {
        fuelInputField.value?.focus()
      })
  } else {
    recompute([])
    fuelInputField.value?.focus()
  }
}

function recompute(localValues: FuelQuantity[]) {
  if (localValues.length == 0) {
    localValues = [new FuelQuantity(0)]
  }

  totalQuantity.value = localValues.reduce((a, b) => a.add(b), new FuelQuantity(0))
  allValues.value = localValues
  emit('update', totalQuantity.value)
}

function setDefaultFuelUnit(newUnit: FuelOption) {
  inputUnit.value = newUnit
}
defineExpose({ setDefaultFuelUnit })
</script>
