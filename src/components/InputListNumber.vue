/*
* Copyright (c) 2025 Thomas Calmant
* All rights reserved.

* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at

* http://www.apache.org/licenses/LICENSE-2.0

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

<template>
  <q-card>
    <q-list bordered>
      <q-item v-for="value in allValues" :key="value">{{ value.toFixed(2) }}</q-item>
    </q-list>
    <div class="row">
      <q-input v-model.number="addedValue" type="number" filled />
      <q-btn icon="add" @click="onAdd" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const allValues = ref<number[]>([0])
const addedValue = ref(0)

function onAdd() {
  if (allValues.value.length == 0 || (allValues.value.length == 1 && allValues.value[0] === 0)) {
    console.log("New value:", [addedValue.value])
    allValues.value = [addedValue.value]
  } else {
    console.log("New value:", [...allValues.value, addedValue.value])
    allValues.value = [...allValues.value, addedValue.value]
  }
}
</script>
