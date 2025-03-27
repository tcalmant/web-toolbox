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
              ref="valueInputField"
              v-model="inputValue"
              inputmode="numeric"
              mask="#:##"
              fill-mask="0"
              reverse-fill-mask
              filled
              @update:model-value="errorMessage = null"
            />
            <span v-show="errorMessage" class="text-negative">{{ errorMessage }}</span>
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
        v-model="totalValue"
        readonly
        filled
        outlined
        label="Total time"
      />
      <q-list bordered>
        <q-item v-for="(value, idx) in allValues" :key="idx">
          <q-item-section>
            {{ value }}
          </q-item-section>
          <q-item-section side> {{ Math.ceil(value.duration_s / 60) }}&nbsp;min </q-item-section>
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
import { ref } from 'vue'
import { TimePeriod } from './timeUtils'

const $q = useQuasar()
const totalDuration = defineModel<TimePeriod>()
withDefaults(defineProps<{ title?: string; showTotal?: boolean }>(), { showTotal: false })

const allValues = ref<TimePeriod[]>([new TimePeriod(0)])
const inputValue = ref('0:30')
const valueInputField = ref<QInput>()
const errorMessage = ref<string | null>(null)
const totalValue = ref(new TimePeriod(0).toString())

function onAdd() {
  const [strHours, strMinutes] = (inputValue.value ?? '0').split(':')
  const hours = parseInt(strHours ?? '0')
  const minutes = parseInt(strMinutes ?? '0')

  if (minutes < 0 || minutes >= 60) {
    errorMessage.value = 'Invalid number of minutes'
    return
  }

  const duration_s = hours * 3600 + minutes * 60
  let localValues
  if (
    allValues.value.length == 0 ||
    (allValues.value.length == 1 && allValues.value[0]?.duration_s == 0)
  ) {
    localValues = [new TimePeriod(duration_s)]
  } else {
    localValues = [...allValues.value, new TimePeriod(duration_s)]
  }

  recompute(localValues)
  valueInputField.value?.focus()
  valueInputField.value?.select()
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
        valueInputField.value?.focus()
        valueInputField.value?.select()
      })
  } else {
    recompute([])
    valueInputField.value?.focus()
    valueInputField.value?.select()
  }
}

function recompute(localValues: TimePeriod[]) {
  if (localValues.length == 0) {
    localValues = [new TimePeriod(0)]
  }

  const totalPeriod = localValues.reduce(
    (a, b) => new TimePeriod(a.duration_s + b.duration_s),
    new TimePeriod(0),
  )

  allValues.value = localValues
  totalValue.value = totalPeriod.toString()
  totalDuration.value = totalPeriod
}
</script>
