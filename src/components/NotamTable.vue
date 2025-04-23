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
  <q-table
    class="col notam-table"
    row-key="idx"
    :rows="parsedNotams ?? []"
    :columns="notamColumns"
    selection="multiple"
    v-model:selected="selectedNotams"
    :rows-per-page-options="[0]"
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th>
          <q-checkbox
            indeterminate-value="null"
            v-model="notamSelectAll"
            :aria-label="$t('toggleSelectAll')"
          />
        </q-th>
        <q-th></q-th>
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body="props">
      <q-tr
        :id="notamRowId(props.row)"
        :props="props"
        :class="
          props.row.id === focusedNotam?.id || props.row.id === hoveredNotam?.id ? 'bg-info' : ''
        "
      >
        <q-td>
          <q-checkbox
            v-model="props.selected"
            :aria-label="$t('toggleSelectNotam', { notam: (props.row as NOTAM).id })"
          />
        </q-td>
        <q-td auto-width>
          <q-btn
            size="sm"
            color="primary"
            round
            dense
            @click="
              () => {
                if (props.row != focusedNotam) {
                  props.expand = !props.expand
                }
              }
            "
            :icon="
              props.row == focusedNotam ? 'radio_button_unchecked' : props.expand ? 'remove' : 'add'
            "
          />
        </q-td>
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          @click="
            focusedNotam?.id === props.row.id
              ? (focusedNotam = undefined)
              : (focusedNotam = props.row)
          "
        >
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-if="props.expand || props.row == focusedNotam" :props="props">
        <q-td colspan="100%">
          <pre>{{ (props.row as NOTAM).text }}</pre>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { type QTableColumn } from 'quasar'
import { onMounted, ref, watch } from 'vue'
import { type NOTAM } from './notamUtils'

const notamColumns = defineModel<QTableColumn[]>('notamColumns')
const parsedNotams = defineModel<NOTAM[] | undefined>('parsedNotams')
const selectedNotams = defineModel<NOTAM[] | undefined>('selectedNotams')
const hoveredNotam = defineModel<NOTAM | undefined>('hoveredNotam')
const focusedNotam = defineModel<NOTAM | undefined>('focusedNotam')

const notamSelectAll = ref<boolean | null>(true)

onMounted(() => {
  if (focusedNotam.value) {
    document
      .getElementById(notamRowId(focusedNotam.value))
      ?.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'start' })
  }
})

watch(notamSelectAll, (newState, oldState) => {
  if (newState === true && oldState !== true) {
    selectedNotams.value = parsedNotams.value
    focusedNotam.value = undefined
  } else if (newState === false && oldState !== false) {
    selectedNotams.value = []
    focusedNotam.value = undefined
  }
})

watch(selectedNotams, (newSelection) => {
  if (!newSelection || newSelection?.length == 0) {
    notamSelectAll.value = false
  } else if (newSelection.length === parsedNotams.value?.length) {
    notamSelectAll.value = true
  } else {
    notamSelectAll.value = null
  }
})

watch(focusedNotam, (newSelection) => {
  if (newSelection) {
    document
      .getElementById(notamRowId(newSelection))
      ?.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'start' })
  }
})

function notamRowId(notam: NOTAM): string {
  return `notam-row-${notam.id}`
}
</script>

<style scoped>
.notam-table {
  overflow: auto;
}

.notam-table .q-table__top,
.notam-table .q-table__bottom,
.notam-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #ffffff;
}

.notam-table thead tr th {
  position: sticky;
  z-index: 1;
}

.notam-table thead tr:first-child th {
  top: 0;
}
</style>
