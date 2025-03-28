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
  <q-page>
    <div class="row q-gutter-md q-pa-md" style="min-height: inherit; height: 100%">
      <div class="col-6">
        <MapView
          v-show="shownPanel === 'map'"
          v-model:notam-list="shownNotams"
          v-model:notam-focus="focusedNotam"
          v-model:aip="parsedAIP"
          v-model:show-area-of-influence="showAreaOfInfluence"
        />
        <q-form
          v-if="shownPanel === 'notamInput'"
          class="fit"
          style="min-height: inherit; height: 100%"
        >
          <q-scroll-area class="fit" style="min-height: 100%; height: 100%">
            <q-input
              v-model="inputNOTAMText"
              class="fit"
              label="NOTAM entries"
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
                    <q-btn
                      icon="cancel"
                      flat
                      round
                      unelevated
                      @click.prevent="inputNOTAMText = ''"
                    />
                  </div>
                </div>
              </template>
            </q-input>
          </q-scroll-area>
        </q-form>
      </div>
      <div class="col-5 full-height">
        <q-tabs v-model="selectedTab">
          <q-tab name="notamTab" label="NOTAM" icon="timer" />
          <q-tab name="aipTab" label="AIP" icon="menu_book" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="selectedTab" animated>
          <q-tab-panel name="notamTab">
            <div class="col">
              <q-form>
                <div class="row">
                  <q-btn
                    class="col"
                    color="secondary"
                    icon="edit"
                    @click.prevent="shownPanel = shownPanel === 'map' ? 'notamInput' : 'map'"
                    >Set NOTAM</q-btn
                  >
                </div>
                <q-separator />
                <div class="row">
                  <q-checkbox class="col" v-model="ignoreLargeNotams" label="Ignore large NOTAM" />
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
                  <q-checkbox
                    v-model="onlyWithPositions"
                    label="Only show NOTAM with located items"
                  />
                </div>
                <div class="row">
                  <q-checkbox v-model="showAreaOfInfluence" label="Show area of influence" />
                </div>
                <q-separator />
                <q-table
                  class="col"
                  row-key="idx"
                  :rows="parsedNotams"
                  :columns="notamColumns"
                  :table-row-class-fn="(row) => (row.id === focusedNotam?.id ? 'bg-accent' : '')"
                  selection="multiple"
                  v-model:selected="selectedNotams"
                  @row-click="(_, row) => (focusedNotam = row)"
                ></q-table>
              </q-form>
            </div>
          </q-tab-panel>
          <q-tab-panel name="aipTab">
            <q-input
              v-model="inputAIPText"
              label="AIP entries"
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import { AIP } from 'src/components/aipUtils'
import MapView from 'src/components/MapView.vue'
import { NOTAM } from 'src/components/notamUtils'
import { findFirstRegex } from 'src/components/stringUtils'
import { computed, onMounted, ref, watch } from 'vue'

// Display configuration
const shownPanel = ref<'map' | 'notamInput' | 'aipInput'>('map')
const selectedTab = ref('notamTab')

// AIP
const inputAIPText = ref('')
const parsedAIP = ref<AIP>()

// NOTAMs
const parsedNotams = ref<NOTAM[]>([])
const selectedNotams = ref<Array<NOTAM>>([])
const focusedNotam = ref<NOTAM>()

const inputNOTAMText = ref()
const ignoreLargeNotams = ref<boolean>(true)
const maxNotamRadius = ref<number>(100)
const onlyWithPositions = ref<boolean>(true)
const showAreaOfInfluence = ref<boolean>(true)

// ... table
const notamColumns: QTableColumn[] = [
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
    name: 'trafic',
    label: 'Trafic',
    field: (r: NOTAM) => r.sectionQ?.trafic,
    sortable: true,
  },
  {
    name: 'object',
    label: 'Object',
    field: (r: NOTAM) => r.sectionQ?.object,
    sortable: true,
  },
  {
    name: 'scope',
    label: 'Scope',
    field: (r: NOTAM) => r.sectionQ?.scope,
    sortable: true,
  },
  {
    name: 'limitLow',
    label: 'LOW',
    field: (r: NOTAM) => r.sectionQ?.limitLow,
    sortable: true,
  },
  {
    name: 'limitHigh',
    label: 'HIGH',
    field: (r: NOTAM) => r.sectionQ?.limitHigh,
    sortable: true,
  },
  {
    name: 'radius',
    label: 'Radius (NM)',
    field: (r: NOTAM) => r.sectionQ?.radiusNM,
    sortable: true,
  },
]

// Handle updates
onMounted(() => {
  handleAIPInput(inputAIPText.value)
  handleNOTAMInput(inputNOTAMText.value)
})
watch(inputAIPText, (newValue: string) => handleAIPInput(newValue))
watch(inputNOTAMText, (newValue: string) => handleNOTAMInput(newValue))

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

const shownNotams = computed<NOTAM[]>(() => {
  let notams = selectedNotams.value as NOTAM[]
  if (ignoreLargeNotams.value && maxNotamRadius.value !== undefined) {
    notams = notams.filter(
      (n) => n.sectionQ?.radiusNM == null || n.sectionQ.radiusNM <= maxNotamRadius.value,
    )
  }

  if (onlyWithPositions.value) {
    notams = notams.filter((n) => n.polygons.length != 0)
  }

  return notams
})

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
    notams.push(notam)
  }

  parsedNotams.value = notams
  return notams
}
</script>
