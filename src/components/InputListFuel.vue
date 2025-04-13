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
  <q-card class="q-pa-md">
    <div class="column q-gutter-md">
      <span v-if="title" class="text-subtitle1 text-center">{{ title }}</span>
      <q-form class="print-hide" @submit.prevent="onAdd">
        <div class="row q-gutter-xs">
          <div class="col">
            <q-input
              ref="fuelInputField"
              v-model.number="inputValue"
              type="number"
              inputmode="numeric"
              filled
              @update:model-value="errorMessage = null"
            />
            <span v-show="errorMessage" class="text-negative">{{ errorMessage }}</span>
          </div>
          <div class="col-2">
            <q-select
              class="fit"
              v-model="inputUnit"
              :options="FUEL_UNITS"
              :option-label="(opt) => $t(opt.label)"
              filled
            />
          </div>
          <q-separator />
          <q-btn class="col-1" icon="add" type="submit" />
          <q-separator />
          <q-btn class="col-1" @mousedown.prevent @click="onDeleteAll()">
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
          <q-item-section> {{ value }} </q-item-section>
          <q-item-section side> {{ value.toString(LITER) }} </q-item-section>
          <q-item-section side class="print-hide">
            <q-icon name="delete" color="negative" @click="onDelete(idx)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { QInput, useQuasar } from 'quasar'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FuelOption } from './fuelUtils'
import { FUEL_UNITS, FuelQuantity, LITER } from './fuelUtils'

const { t } = useI18n()

const $q = useQuasar()
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

const allValues = ref<FuelQuantity[]>([new FuelQuantity(0)])
const inputValue = ref(0)
const inputUnit = ref(LITER)
const fuelInputField = ref<QInput>()
const totalValueString = computed(
  () => totalQuantity.value?.toString(props.globalFuelUnit ?? inputValue.value) ?? 'N/A',
)
const errorMessage = ref<string | null>(null)

watch(props, (newProps) => {
  inputUnit.value = newProps.globalFuelUnit
})

function onAdd() {
  const newValue = new FuelQuantity(inputValue.value, inputUnit.value)

  if (newValue > props.fuelCapacity) {
    errorMessage.value = 'Trying to add more fuel than possible'
  } else {
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
  }

  fuelInputField.value?.focus()
  fuelInputField.value?.select()
}

function onDelete(idx: number) {
  const currentValues = allValues.value ?? []
  const newValues = [...currentValues.slice(0, idx), ...currentValues.slice(idx + 1)]
  recompute(newValues)
}

function onDeleteAll() {
  if (allValues.value?.length > 1) {
    $q.dialog({
      title: t('confirmTitle'),
      message: t('confirmDeleteAllMessage'),
      cancel: true,
      persistent: false,
    })
      .onOk(() => {
        recompute([])
      })
      .onDismiss(() => {
        fuelInputField.value?.focus()
        fuelInputField.value?.select()
      })
  } else {
    recompute([])
    fuelInputField.value?.focus()
    fuelInputField.value?.select()
  }
}

function recompute(localValues: FuelQuantity[]) {
  if (localValues.length == 0) {
    localValues = [new FuelQuantity(0)]
  }

  allValues.value = localValues
  totalQuantity.value = localValues.reduce((a, b) => a.add(b), new FuelQuantity(0))
}
</script>
