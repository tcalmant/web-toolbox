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
  <q-card class="q-pa-md" style="min-width: min-content">
    <div class="column q-gutter-md">
      <span v-if="title" class="text-subtitle1 text-center">{{ title }}</span>
      <q-form class="print-hide" @submit.prevent="onAdd">
        <div class="row q-gutter-xs">
          <div class="col">
            <q-input
              ref="fuelInputField"
              :label="$t('fuelInputLabel')"
              :hint="$t('fuelInputHint')"
              v-model.number="inputValue"
              type="number"
              min="0"
              inputmode="decimal"
              filled
              @update:model-value="errorMessage = null"
            />
            <span v-show="errorMessage" class="text-negative" role="alert">{{ errorMessage }}</span>
          </div>
          <div class="col-3">
            <q-select
              class="fit"
              v-model="inputUnit"
              :options="FUEL_UNITS"
              :option-label="(opt) => $t(opt.label)"
              :aria-label="$t('fuelUnitLabel')"
              filled
            />
          </div>
          <q-btn class="col-1" icon="add" type="submit" :title="$t('addEntry')" />
          <q-btn class="col-1" @mousedown.prevent @click="onDeleteAll()" :title="$t('deleteAll')">
            <q-icon name="delete_forever" color="negative" />
          </q-btn>
        </div>
      </q-form>
      <q-input
        v-if="showTotal"
        class="col"
        v-model="totalValueString"
        readonly
        filled
        outlined
        :label="$t('tableFuelTotal')"
      />
      <q-list bordered>
        <q-item v-for="(value, idx) in allValues" :key="idx">
          <q-item-section> {{ value.toString() }} </q-item-section>
          <q-item-section v-if="value.unit !== globalFuelUnit" side>
            {{ value.toString(globalFuelUnit) }}
          </q-item-section>
          <q-item-section side class="print-hide">
            <div class="row no-wrap q-gutter-xs">
              <q-icon
                name="edit"
                style="cursor: pointer"
                @click="onEdit(idx)"
                :title="$t('editEntry')"
              />
              <q-icon
                name="delete"
                color="negative"
                style="cursor: pointer"
                @click="onDelete(idx)"
                :title="$t('deleteRow')"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { QInput } from 'quasar'
import { useDeletableList } from '@/composables/useDeletableList'
import type { FuelOption } from '@/domain/fuel'
import { FUEL_UNITS, FuelQuantity } from '@/domain/fuel'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    globalFuelUnit: FuelOption
    fuelCapacity: FuelQuantity
    title?: string
    showTotal?: boolean
  }>(),
  {
    showTotal: false,
  },
)
const totalQuantity = defineModel<FuelQuantity>()

const allValues = defineModel<FuelQuantity[]>('entries', {
  default: () => [new FuelQuantity(0)],
  required: false,
})
const inputValue = ref<number | string>('')
const inputUnit = ref(props.globalFuelUnit)
const fuelInputField = ref<QInput>()
const totalValueString = computed(
  () => totalQuantity.value?.toString(props.globalFuelUnit) ?? t('notAvailable'),
)
const errorMessage = ref<string | null>(null)

watch(
  () => props.globalFuelUnit,
  (newUnit) => {
    inputUnit.value = newUnit
  },
)

const { onDelete, onDeleteAll } = useDeletableList({
  values: allValues,
  inputField: fuelInputField,
  recompute,
})

function focusInput() {
  fuelInputField.value?.focus()
  fuelInputField.value?.select()
}

function onAdd() {
  // An empty field gives '' with v-model.number
  const amount = typeof inputValue.value === 'number' ? inputValue.value : NaN
  if (!Number.isFinite(amount) || amount <= 0) {
    errorMessage.value = t('fuelInvalidAmount')
    focusInput()
    return
  }

  const newValue = new FuelQuantity(amount, inputUnit.value)
  const hasRealEntries = allValues.value.some((v) => v.valueOf() > 0)
  const currentTotal = hasRealEntries
    ? allValues.value.reduce((a, b) => a.add(b), new FuelQuantity(0, props.globalFuelUnit))
    : new FuelQuantity(0, props.globalFuelUnit)

  // The tanks cannot hold more than their capacity, whatever the number of entries
  if (currentTotal.add(newValue).valueOf() > props.fuelCapacity.valueOf() + 1e-9) {
    errorMessage.value = t('fuelExceedsCapacity')
  } else {
    recompute(hasRealEntries ? [...allValues.value, newValue] : [newValue])
  }

  focusInput()
}

/** Puts an entry back in the form, to be corrected and added again. */
function onEdit(idx: number) {
  const entry = allValues.value[idx]
  if (!entry) {
    return
  }
  inputValue.value = entry.value.scalar
  inputUnit.value = entry.unit
  errorMessage.value = null
  onDelete(idx)
  focusInput()
}

function recompute(localValues: FuelQuantity[]) {
  if (localValues.length == 0) {
    localValues = [new FuelQuantity(0, props.globalFuelUnit)]
  }

  allValues.value = localValues
  // Seed in the displayed unit: the sum keeps the unit of its left-hand side
  totalQuantity.value = localValues.reduce(
    (a, b) => a.add(b),
    new FuelQuantity(0, props.globalFuelUnit),
  )
}
</script>
