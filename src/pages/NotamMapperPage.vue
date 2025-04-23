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
  <q-page v-if="!isPortrait" class="row q-gutter-md q-pa-md no-wrap" :style-fn="pageStyleFn">
    <div class="col-6">
      <div class="map-container">
        <MapView
          v-model:notam-list="selectedNotams as NOTAM[] | undefined"
          v-model:notam-focus="focusedNotam"
          v-model:aip="parsedAIP"
          v-model:show-area-of-influence="showAreaOfInfluence"
          v-model:hovered-notam="hoveredNotam"
        />
      </div>
    </div>
    <div class="col-5 col column no-wrap">
      <NotamOptions
        v-model:ignore-large-notams="ignoreLargeNotams"
        v-model:max-notam-radius="maxNotamRadius"
        v-model:only-with-positions="onlyWithPositions"
        v-model:show-area-of-influence="showAreaOfInfluence"
        @show-notam-edit="showNotamEdit = true"
        @show-aip-edit="showAipEdit = true"
      />
      <NotamTable
        v-model:focused-notam="focusedNotam"
        v-model:hovered-notam="hoveredNotam"
        v-model:notam-columns="notamColumns"
        v-model:parsed-notams="parsedNotams"
        v-model:selected-notams="selectedNotams"
      />
    </div>
  </q-page>
  <q-page v-else :style-fn="pageStyleFn">
    <q-tabs v-model="tab">
      <q-tab name="map" :label="$t('notamTabMapTitle')" />
      <q-tab name="mapConfig" :label="$t('notamTabConfigurationTitle')" />
    </q-tabs>
    <q-separator />
    <div
      class="scroll"
      style="position: absolute; bottom: 0; left: 0; right: 0; max-height: 85vh; height: 100%"
    >
      <q-tab-panels v-model="tab">
        <q-tab-panel name="map" style="height: 85vh">
          <div class="map-container">
            <MapView
              v-model:notam-list="selectedNotams as NOTAM[] | undefined"
              v-model:notam-focus="focusedNotam"
              v-model:aip="parsedAIP"
              v-model:show-area-of-influence="showAreaOfInfluence"
              v-model:hovered-notam="hoveredNotam"
            />
          </div>
        </q-tab-panel>
        <q-tab-panel name="mapConfig">
          <div class="col column no-wrap">
            <NotamOptions
              v-model:ignore-large-notams="ignoreLargeNotams"
              v-model:max-notam-radius="maxNotamRadius"
              v-model:only-with-positions="onlyWithPositions"
              v-model:show-area-of-influence="showAreaOfInfluence"
              @show-notam-edit="showNotamEdit = true"
              @show-aip-edit="showAipEdit = true"
            />
            <NotamTable
              v-model:focused-notam="focusedNotam"
              v-model:hovered-notam="hoveredNotam"
              v-model:notam-columns="notamColumns"
              v-model:parsed-notams="parsedNotams"
              v-model:selected-notams="selectedNotams"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>

  <NotamTextAreaDialog
    v-model="inputAIPText"
    v-model:show-dialog="showAipEdit"
    :input-label="$t('aipEntriesLabel')"
    :title="$t('aipEditTitle')"
  />

  <NotamTextAreaDialog
    v-model="inputNOTAMText"
    v-model:show-dialog="showNotamEdit"
    :input-label="$t('notamEntriesLabel')"
    :title="$t('notamEditTitle')"
  />
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import { useQuasar } from 'quasar'
import { AIP } from 'src/components/aipUtils'
import MapView from 'src/components/MapView.vue'
import NotamOptions from 'src/components/NotamOptions.vue'
import NotamTable from 'src/components/NotamTable.vue'
import NotamTextAreaDialog from 'src/components/NotamTextAreaDialog.vue'
import { NOTAM } from 'src/components/notamUtils'
import { findFirstRegex } from 'src/components/stringUtils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const tab = ref('mapConfig')

function pageStyleFn(offset: number, height: number) {
  return { height: `${height - offset}px` }
}

// Display configuration
const showAipEdit = ref<boolean>(false)
const showNotamEdit = ref<boolean>(false)

const isPortrait = ref(window.innerHeight > window.innerWidth)

const updateOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth
}

onMounted(() => window.addEventListener('resize', updateOrientation))
onUnmounted(() => window.removeEventListener('resize', updateOrientation))

// AIP
const inputAIPText = ref('')
const parsedAIP = ref<AIP>()

// NOTAMs
const parsedNotams = ref<NOTAM[]>()
const selectedNotams = ref<NOTAM[]>()
const hoveredNotam = ref<NOTAM>()
const focusedNotam = ref<NOTAM>()
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

// Handle setup and updates
onMounted(() => {
  // Reload data from session storage
  inputAIPText.value = $q.sessionStorage.getItem('notam.input.aip') ?? inputAIPText.value
  inputNOTAMText.value = $q.sessionStorage.getItem('notam.input.notam') ?? inputNOTAMText.value

  handleAIPInput(inputAIPText.value)
  handleNOTAMInput(inputNOTAMText.value)
})
watch(inputAIPText, (newValue: string) => {
  $q.sessionStorage?.setItem('notam.input.aip', newValue)
  handleAIPInput(newValue)
})
watch(inputNOTAMText, (newValue: string) => {
  $q.sessionStorage?.setItem('notam.input.notam', newValue)
  handleNOTAMInput(newValue)
})

watch([onlyWithPositions, ignoreLargeNotams, maxNotamRadius], () => updateSelectedNotams())

watch(focusedNotam, () => {
  tab.value = tab.value == 'mapConfig' ? 'map' : 'mapConfig'
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
  let notams = parsedNotams.value ?? []
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
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
