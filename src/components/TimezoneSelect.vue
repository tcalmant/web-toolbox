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
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    :option-label="zoneLabel"
    use-input
    input-debounce="0"
    @filter="onFilter"
    @update:model-value="(zone: string) => emit('update:modelValue', zone)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">{{ $t('noResults') }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { allTimeZones } from '@/domain/timezones'
import { ref } from 'vue'

defineProps<{ modelValue: string | null; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [zone: string] }>()

const allZones = allTimeZones()
const options = ref<string[]>(allZones)

// Shown as the IANA name: unambiguous, and what users type to search
const zoneLabel = (zone: string) => zone

function onFilter(value: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = value.toLowerCase().replace(/ /g, '_')
    options.value = needle ? allZones.filter((z) => z.toLowerCase().includes(needle)) : allZones
  })
}
</script>
