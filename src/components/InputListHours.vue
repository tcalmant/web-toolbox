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
          <q-item-section>
            {{ value }}
          </q-item-section>
          <q-item-section side>
            <q-icon name="delete" color="red" @click="onDelete(idx)" />
          </q-item-section>
        </q-item>
      </q-list>
      <q-input v-model="totalValue" disabled filled label="Total time" />
      <div class="row">
        <div class="col-11">
          <q-input
            v-model="inputValue"
            mask="N:NN"
            fill-mask="0"
            reverse-fill-mask
            filled
            :error="errorMessage != null"
            :error-message="errorMessage ?? undefined"
            @update:model-value="errorMessage = null"
          />
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

class TimePeriod {
  duration_s: number

  constructor(duration_s: number) {
    this.duration_s = duration_s
  }

  toString(): string {
    return `${Math.floor(this.duration_s / 3600)
      .toString()
      .padStart(1, '0')}:${(Math.floor(this.duration_s % 3600) / 60).toString().padStart(2, '0')}`
  }
}

const emit = defineEmits<{ (e: 'update', duration_s: number): void }>()
const allValues = ref<TimePeriod[]>([new TimePeriod(0)])
const inputValue = ref('0:30')
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
}

function onDelete(idx: number) {
  const currentValues = allValues.value ?? []
  const newValues = [...currentValues.slice(0, idx), ...currentValues.slice(idx + 1)]
  recompute(newValues)
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
  emit('update', totalPeriod.duration_s)
}
</script>
