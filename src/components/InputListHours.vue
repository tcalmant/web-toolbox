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
  <q-card>
    <q-list bordered>
      <q-item v-for="(value, idx) in allValues" :key="idx">{{ value }}</q-item>
    </q-list>
    <div class="row">
      <q-input v-model="addedValue" filled />
      <q-btn icon="add" @click="onAdd" />
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
    return `${Math.floor(this.duration_s / 60)
      .toString()
      .padStart(1, '0')}:${(this.duration_s % 60).toString().padStart(2, '0')}`
  }
}

const allValues = ref<TimePeriod[]>([new TimePeriod(0)])
const addedValue = ref('')

function onAdd() {
  if (
    allValues.value.length == 0 ||
    (allValues.value.length == 1 && allValues.value[0]?.duration_s == 0)
  ) {
    allValues.value = [new TimePeriod(parseFloat(addedValue.value))]
  } else {
    allValues.value = [...allValues.value, new TimePeriod(parseFloat(addedValue.value))]
  }
}
</script>
