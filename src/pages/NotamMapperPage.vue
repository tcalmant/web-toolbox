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
  <q-page class="row q-gutter-md q-pa-md no-wrap" :style-fn="pageStyleFn">
    <div class="col-6">
      <MapView
        v-show="shownPanel === 'map'"
        v-model:notam-list="selectedNotams as NOTAM[] | undefined"
        v-model:notam-focus="focusedNotam"
        v-model:aip="parsedAIP"
        v-model:show-area-of-influence="showAreaOfInfluence"
        v-model:hovered-notam="hoveredNotam"
      />
      <q-form v-if="shownPanel === 'notamInput'" class="fit">
        <q-scroll-area class="fit">
          <q-input
            v-model="inputNOTAMText"
            :label="$t('notamEntriesLabel')"
            filled
            type="textarea"
            :autofocus="shownPanel === 'notamInput'"
            autogrow
          >
            <template v-slot:append>
              <div class="fixed-right">
                <div style="background: rgba(255, 255, 255, 0.75)">
                  <q-btn
                    icon="map"
                    color="green"
                    flat
                    round
                    unelevated
                    @click.prevent="shownPanel = 'map'"
                  />
                  <q-btn icon="cancel" flat round unelevated @click.prevent="inputNOTAMText = ''" />
                </div>
              </div>
            </template>
          </q-input>
        </q-scroll-area>
      </q-form>
    </div>
    <div class="col-5 col column no-wrap">
      <q-tabs v-model="selectedTab">
        <q-tab name="notamTab" label="NOTAM" icon="timer" />
        <q-tab name="aipTab" label="AIP" icon="menu_book" />
      </q-tabs>
      <q-tab-panels v-model="selectedTab" animated>
        <q-tab-panel name="notamTab" class="q-pa-md col column no-wrap">
          <div class="row">
            <q-btn
              class="col"
              color="secondary"
              icon="edit"
              @click.prevent="shownPanel = shownPanel === 'map' ? 'notamInput' : 'map'"
            >
              {{ $t('notamEditLabel') }}
            </q-btn>
          </div>
          <div class="row">
            <q-checkbox class="col" v-model="ignoreLargeNotams" :label="$t('notamFilterLarge')" />
            <q-slider
              class="col-5"
              v-model="maxNotamRadius"
              :min="1"
              :max="999"
              label
              switch-label-side
              :label-always="ignoreLargeNotams"
              :label-value="maxNotamRadius + ' NM'"
            />
          </div>
          <div class="row">
            <q-checkbox v-model="onlyWithPositions" :label="$t('notamFilterLocated')" />
          </div>
          <div class="row">
            <q-checkbox v-model="showAreaOfInfluence" :label="$t('notamFilterShowArea')" />
          </div>
          <q-table
            ref="tableRef"
            class="col notam-table"
            virtual-scroll
            row-key="idx"
            :rows="parsedNotams"
            :columns="notamColumns"
            selection="multiple"
            v-model:selected="selectedNotams"
            :rows-per-page-options="[0]"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th>
                  <q-checkbox indeterminate-value="null" v-model="notamSelectAll" />
                </q-th>
                <q-th></q-th>
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                :class="
                  props.row.id === focusedNotam?.id || props.row.id === hoveredNotam?.id
                    ? 'bg-info'
                    : ''
                "
              >
                <q-td>
                  <q-checkbox v-model="props.selected" />
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
                      props.row == focusedNotam
                        ? 'radio_button_unchecked'
                        : props.expand
                          ? 'remove'
                          : 'add'
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
        </q-tab-panel>
        <q-tab-panel name="aipTab">
          <q-input
            v-model="inputAIPText"
            :label="$t('aipEntriesLabel')"
            filled
            type="textarea"
            autofocus
            autogrow
          >
            <template v-slot:append>
              <q-icon name="close" @click="inputAIPText = ''" class="cursor-pointer" />
            </template>
          </q-input>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { QTable, QTableColumn } from 'quasar'
import { AIP } from 'src/components/aipUtils'
import MapView from 'src/components/MapView.vue'
import { NOTAM } from 'src/components/notamUtils'
import { findFirstRegex } from 'src/components/stringUtils'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

function pageStyleFn(offset: number, height: number) {
  return { height: `${height - offset}px` }
}

// Display configuration
const shownPanel = ref<'map' | 'notamInput' | 'aipInput'>('map')
const selectedTab = ref('notamTab')

// AIP
const inputAIPText = ref('')
const parsedAIP = ref<AIP>()

// NOTAMs
const tableRef = ref<QTable>()
const parsedNotams = ref<NOTAM[]>([])
const selectedNotams = ref<NOTAM[]>([])
const hoveredNotam = ref<NOTAM>()
const focusedNotam = ref<NOTAM>()
const notamSelectAll = ref<boolean | null>(true)
const inputNOTAMText = ref()
const ignoreLargeNotams = ref<boolean>(true)
const maxNotamRadius = ref<number>(100)
const onlyWithPositions = ref<boolean>(true)
const showAreaOfInfluence = ref<boolean>(true)

// ... table
const notamColumns = computed<QTableColumn[]>(() => [
  {
    name: 'id',
    label: 'N°',
    field: (r: NOTAM) => r.id,
    required: true,
    sortable: true,
  },
  {
    name: 'fir',
    label: 'FIR',
    field: (r: NOTAM) => r.sectionQ?.fir,
    required: true,
    sortable: true,
  },
  {
    name: 'qcode',
    label: 'QCode',
    field: (r: NOTAM) => r.sectionQ?.qCode,
    required: true,
    sortable: true,
  },
  {
    name: 'limitLow',
    label: t('notamLimitLow'),
    field: (r: NOTAM) => r.sectionQ?.limitLow,
    sortable: true,
  },
  {
    name: 'limitHigh',
    label: t('notamLimitHigh'),
    field: (r: NOTAM) => r.sectionQ?.limitHigh,
    sortable: true,
  },
  {
    name: 'radius',
    label: t('notamRadius'),
    field: (r: NOTAM) => r.sectionQ?.radiusNM,
    sortable: true,
  },
  {
    name: 'trafic',
    label: t('notamTrafic'),
    field: (r: NOTAM) => r.sectionQ?.trafic,
    sortable: true,
  },
  {
    name: 'object',
    label: t('notamObject'),
    field: (r: NOTAM) => r.sectionQ?.object,
    sortable: true,
  },
  {
    name: 'scope',
    label: t('notamScope'),
    field: (r: NOTAM) => r.sectionQ?.scope,
    sortable: true,
  },
])

// Handle updates
onMounted(() => {
  handleAIPInput(inputAIPText.value)
  handleNOTAMInput(inputNOTAMText.value)
})
watch(inputAIPText, (newValue: string) => handleAIPInput(newValue))
watch(inputNOTAMText, (newValue: string) => handleNOTAMInput(newValue))

watch(notamSelectAll, (newState, oldState) => {
  if (newState === true && oldState !== true) {
    selectedNotams.value = parsedNotams.value
    focusedNotam.value = undefined
  } else if (newState === false && oldState !== false) {
    selectedNotams.value = []
    focusedNotam.value = undefined
  }
})

watch([onlyWithPositions, ignoreLargeNotams, maxNotamRadius], () => updateSelectedNotams())

watch(selectedNotams, (newSelection) => {
  if (newSelection.length === parsedNotams.value.length) {
    notamSelectAll.value = true
  } else if (newSelection.length === 0) {
    notamSelectAll.value = false
  } else {
    notamSelectAll.value = null
  }
})

watch(focusedNotam, (newSelection) => {
  const table = tableRef.value
  if (newSelection && table) {
    const sortedIdx = table.computedRows.findIndex((r: NOTAM) => r.idx === newSelection.idx)
    if (sortedIdx != -1) {
      table.scrollTo(sortedIdx, 'center')
    }
  }
})

function handleAIPInput(fullText: string): void {
  parsedAIP.value = fullText ? new AIP(fullText) : undefined
}

function handleNOTAMInput(fullText: string): void {
  let notams = (parsedNotams.value = fullText ? parseNotams(fullText) : [])

  if (ignoreLargeNotams.value && maxNotamRadius.value !== undefined) {
    notams = notams.filter(
      (n) => n.sectionQ?.radiusNM == null || n.sectionQ.radiusNM <= maxNotamRadius.value,
    )
  }

  if (onlyWithPositions.value) {
    notams = notams.filter((n) => n.polygons.length != 0)
  }

  selectedNotams.value = notams
}

function updateSelectedNotams() {
  let notams = parsedNotams.value
  if (!notams) {
    selectedNotams.value = []
  }

  if (ignoreLargeNotams.value && maxNotamRadius.value !== undefined) {
    notams = notams.filter(
      (n) => n.sectionQ?.radiusNM == null || n.sectionQ.radiusNM <= maxNotamRadius.value,
    )
  }

  if (onlyWithPositions.value) {
    notams = notams.filter((n) => n.polygons.length != 0)
  }

  selectedNotams.value = notams
}

function parseNotams(fullText: string): NOTAM[] {
  let lastEndIdx = -1
  let sectionStartIdx = -1
  const notams: NOTAM[] = []
  let notamIdx = 0
  while ((sectionStartIdx = findFirstRegex(fullText, lastEndIdx + 1, /[A-GQ]\)/)) != -1) {
    // Look for the "real" start of the NOTAM
    let notamStartIdx = fullText.lastIndexOf('\n\n', sectionStartIdx)
    if (notamStartIdx == -1) {
      notamStartIdx = 0
    } else if (notamStartIdx < lastEndIdx) {
      notamStartIdx = lastEndIdx
    }

    // Look for the end of the NOTAM
    lastEndIdx = fullText.indexOf('\n\n', sectionStartIdx)
    if (lastEndIdx == -1) {
      lastEndIdx = fullText.length
    }

    const notamContent = fullText.substring(notamStartIdx, lastEndIdx).trim()
    const notam = new NOTAM(notamContent, ++notamIdx)
    if (notam.sectionQ != null) {
      notams.push(notam)
    }
  }

  parsedNotams.value = notams
  return notams
}
</script>

<style lang="css">
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
