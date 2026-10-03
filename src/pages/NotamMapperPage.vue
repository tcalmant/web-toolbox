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
        v-model:hide-expired="hideExpired"
        :total-count="totalCount"
        :shown-count="parsedNotams?.length ?? 0"
        v-model:show-area-of-influence="showAreaOfInfluence"
        v-model:search-query="searchQuery"
        :notam-count="parsedNotams?.length ?? 0"
        :aip-area-count="parsedAIP?.polygons.length ?? 0"
        @show-import="showImport = true"
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
  <q-page v-else class="column no-wrap" :style-fn="pageStyleFn">
    <q-tabs v-model="tab">
      <q-tab name="map" :label="$t('notamTabMapTitle')" />
      <q-tab name="mapConfig" :label="$t('notamTabConfigurationTitle')" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" class="col" :animated="false">
      <q-tab-panel name="map" class="q-pa-sm">
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
      <q-tab-panel name="mapConfig" class="q-pa-sm">
        <NotamOptions
          v-model:ignore-large-notams="ignoreLargeNotams"
          v-model:max-notam-radius="maxNotamRadius"
          v-model:only-with-positions="onlyWithPositions"
          v-model:hide-expired="hideExpired"
          :total-count="totalCount"
          :shown-count="parsedNotams?.length ?? 0"
          v-model:show-area-of-influence="showAreaOfInfluence"
          v-model:search-query="searchQuery"
          :notam-count="parsedNotams?.length ?? 0"
          :aip-area-count="parsedAIP?.polygons.length ?? 0"
          @show-import="showImport = true"
        />
        <NotamTable
          v-model:focused-notam="focusedNotam"
          v-model:hovered-notam="hoveredNotam"
          v-model:notam-columns="notamColumns"
          v-model:parsed-notams="parsedNotams"
          v-model:selected-notams="selectedNotams"
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>

  <NotamImportDialog v-model="inputText" v-model:show-dialog="showImport" />
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import { useQuasar } from 'quasar'
import MapView from '@/components/MapView.vue'
import NotamOptions from '@/components/NotamOptions.vue'
import NotamTable from '@/components/NotamTable.vue'
import NotamImportDialog from '@/components/NotamImportDialog.vue'
import { useOrientation } from '@/composables/useOrientation'
import { AIP } from '@/domain/aip'
import { splitNotamsAndAip } from '@/domain/importedText'
import { formatNotamDate, type NOTAM } from '@/domain/notam'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const tab = ref('mapConfig')

function pageStyleFn(offset: number, height: number) {
  return { height: `${height - offset}px` }
}

// Display configuration
const showImport = ref<boolean>(false)

const { isPortrait } = useOrientation()

// Imported content: NOTAMs and AIP are told apart automatically
const inputText = ref('')
const parsedAIP = ref<AIP>()

// NOTAMs
// Everything found in the imported text, before any filter (not reactive on purpose)
let allNotams: NOTAM[] = []
const parsedNotams = ref<NOTAM[]>()
const selectedNotams = ref<NOTAM[]>()
const hoveredNotam = ref<NOTAM>()
const focusedNotam = ref<NOTAM>()
const ignoreLargeNotams = ref<boolean>(true)
const maxNotamRadius = ref<number>(100)
const onlyWithPositions = ref<boolean>(true)
const hideExpired = ref<boolean>(true)
const totalCount = ref<number>(0)
const showAreaOfInfluence = ref<boolean>(true)

// ... search
const searchQuery = ref<string>('')

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
    name: 'status',
    label: t('notamStatus'),
    field: (r: NOTAM) => r.statusAt(),
    format: (v: string) => t(`notamStatus_${v}`),
    required: true,
    sortable: true,
  },
  {
    name: 'validFrom',
    label: t('notamValidFrom'),
    field: (r: NOTAM) => r.validity?.from?.getTime() ?? null,
    format: (v: number | null) => formatNotamDate(v === null ? null : new Date(v)),
    sortable: true,
  },
  {
    name: 'validTo',
    label: t('notamValidTo'),
    field: (r: NOTAM) => (r.validity?.permanent ? Infinity : (r.validity?.to?.getTime() ?? null)),
    format: (v: number | null) =>
      v === Infinity ? 'PERM' : formatNotamDate(v === null ? null : new Date(v)),
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
  // Reload data from session storage: the watcher below parses it
  inputText.value =
    $q.sessionStorage.getItem('notam.input.text') ?? loadLegacyInput() ?? inputText.value
})
// Parsing is only needed when the text changes, not when filters do
watch(inputText, (newText) => {
  $q.sessionStorage?.setItem('notam.input.text', newText)
  parseInput(newText)
  applyNotamFilters(searchQuery.value)
})
watch([searchQuery, hideExpired], ([newSearchValue]) => applyNotamFilters(newSearchValue))

watch([onlyWithPositions, ignoreLargeNotams, maxNotamRadius], () => updateSelectedNotams())

watch(focusedNotam, () => {
  tab.value = tab.value == 'mapConfig' ? 'map' : 'mapConfig'
})

// Before the import was unified, AIP and NOTAMs were stored separately
function loadLegacyInput(): string | undefined {
  const parts = ['notam.input.aip', 'notam.input.notam']
    .map((key) => $q.sessionStorage.getItem<string>(key))
    .filter((text) => text)
  return parts.length > 0 ? parts.join('\n\n') : undefined
}

function filterNotams(notams: NOTAM[]): NOTAM[] {
  let filtered = notams

  // Select out large NOTAMs
  if (ignoreLargeNotams.value && maxNotamRadius.value !== undefined) {
    filtered = filtered.filter(
      (n) => n.sectionQ?.radiusNM == null || n.sectionQ.radiusNM <= maxNotamRadius.value,
    )
  }

  // Select out NOTAMs without positions
  if (onlyWithPositions.value) {
    filtered = filtered.filter((n) => n.polygons.length != 0)
  }

  return filtered
}

function parseInput(fullText: string): void {
  const { notams, aipText } = splitNotamsAndAip(fullText)
  allNotams = notams
  parsedAIP.value = aipText ? new AIP(aipText) : undefined
  totalCount.value = notams.length
}

function applyNotamFilters(search: string): void {
  // Drop expired NOTAMs first, they are rarely useful in a briefing
  let notams = allNotams
  if (hideExpired.value) {
    const now = new Date()
    notams = notams.filter((n) => n.statusAt(now) !== 'expired')
  }

  // Apply search filter if necessary
  if (search && search.trim().length > 0) {
    const trimmedSearch = search.trim()
    notams = notams.filter((n) => n.matchesSearch(trimmedSearch))
  }

  // Update parsed NOTAMs
  parsedNotams.value = notams

  selectedNotams.value = filterNotams(notams)
}

function updateSelectedNotams() {
  selectedNotams.value = filterNotams(parsedNotams.value ?? [])
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
