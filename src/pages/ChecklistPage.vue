<!--
Copyright (c) 2026 Thomas Calmant
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
  <q-page padding class="col">
    <div class="q-gutter-md">
      <q-card
        flat
        bordered
        class="q-pa-sm checklist-sticky-bar"
        :style="{ top: `${headerHeight}px` }"
      >
        <div class="row items-center q-gutter-md">
          <q-select
            class="col-12 col-sm"
            v-model="planeIdent"
            :label="$t('checklistPlaneLabel')"
            :hint="$t('checklistPlaneHint')"
            :options="planeOptions"
            emit-value
            map-options
            @update:model-value="onPlaneSelect"
          />
          <div
            class="col-auto text-weight-bold"
            :class="isMobile ? 'text-body1' : 'text-h6'"
          >
            {{ clock }}
          </div>
          <q-space v-if="isMobile" />
          <q-btn
            v-if="checklist && checklist.emergencySections().length"
            flat
            dense
            icon="warning"
            color="negative"
            :label="isMobile ? undefined : $t('checklistEmergencyJumpLabel')"
            :round="isMobile"
            :aria-label="$t('checklistEmergencyJumpLabel')"
            @click="scrollToEmergencyPanel"
          />
          <q-btn
            v-if="checklist"
            flat
            dense
            icon="unfold_less"
            :label="isMobile ? undefined : $t('checklistCollapseAllLabel')"
            :round="isMobile"
            :aria-label="$t('checklistCollapseAllLabel')"
            @click="onCollapseAll"
          />
          <q-btn
            v-if="checklist"
            flat
            dense
            icon="delete_sweep"
            :label="isMobile ? undefined : $t('checklistClearAllLabel')"
            :round="isMobile"
            :aria-label="$t('checklistClearAllLabel')"
            @click="onClearAll"
          />
        </div>
      </q-card>

      <div v-if="checklist && checklist.emergencySections().length" ref="emergencyPanelRef">
        <span class="text-caption text-grey">{{ $t('checklistEmergencyJumpLabel') }}</span>
        <div class="row q-gutter-xs q-mt-xs">
          <q-btn
            v-for="section in checklist.emergencySections()"
            :key="section.id"
            outline
            dense
            no-caps
            color="negative"
            :label="section.title"
            @click="jumpToSection(section.id)"
          />
        </div>
      </div>

      <div v-if="checklist">
        <q-expansion-item
          v-for="section in checklist.sections"
          :key="section.id"
          :ref="(el) => setSectionRef(section.id, el)"
          :model-value="expandedState[section.id] ?? false"
          @update:model-value="(val: boolean) => (expandedState[section.id] = val)"
          :header-class="sectionHeaderClass(section)"
        >
          <template v-slot:header>
            <q-item-section>{{ section.title }}</q-item-section>
            <q-item-section side>
              <q-btn
                flat
                dense
                round
                icon="clear"
                :aria-label="$t('checklistClearSectionLabel')"
                @click.stop="onClearSection(section)"
              />
            </q-item-section>
          </template>
          <q-card>
            <q-card-section>
              <ChecklistItemList :items="section.items" />
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <div v-else class="text-grey q-pa-md text-center">{{ $t('checklistNoPlaneSelected') }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar, type QExpansionItem } from 'quasar'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { ChecklistXmlSource } from '@/adapters/data/checklistXmlSource'
import { ChecklistLocalStorageStore } from '@/adapters/storage/checklistLocalStorageStore'
import ChecklistItemList from '@/components/ChecklistItemList.vue'
import { checklistChangeKey, checklistStateKey } from '@/composables/useChecklistState'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import KnownAirplanes from '@/adapters/data/airplanesRepository'
import type { AirPlane } from '@/domain/airplanes'
import { ChecklistChoice, type Checklist, type ChecklistSection } from '@/domain/checklist'
import { resolveChecklistForPlane } from '@/domain/checklistResolver'
import { timeToUTCString } from '@/domain/time'

const $q = useQuasar()
const { t, locale } = useI18n({ useScope: 'global' })
const { confirmDialog } = useConfirmDialog()

// Narrow-screen layout: stack the plane selector, shrink the clock, and
// collapse the sticky-bar buttons down to icons to keep the bar usable.
const isMobile = computed(() => $q.screen.lt.sm)

// Offset the sticky bar below the app's own fixed header, which can slide
// back over page content on scroll (otherwise it covers the clock/buttons).
const headerHeight = ref(0)
onMounted(() => {
  headerHeight.value = document.querySelector('.q-header')?.getBoundingClientRect().height ?? 0
})

const xmlSource = new ChecklistXmlSource()
const stateStore = new ChecklistLocalStorageStore($q.localStorage)

// Plane selection
const planeOptions = computed(() =>
  Object.values(KnownAirplanes)
    .sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
    .map((plane: AirPlane) => ({ label: plane.toString(), value: plane.immatriculation })),
)

const planeIdent = ref('')
const currentPlane = computed<AirPlane | null>(() => KnownAirplanes[planeIdent.value] ?? null)

// Live UTC clock, always visible in 24h format
const clock = ref(timeToUTCString(new Date()))
let clockTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  clockTimer = setInterval(() => {
    clock.value = timeToUTCString(new Date())
  }, 1000)
})
onUnmounted(() => {
  clearInterval(clockTimer)
})

// Checklist resolution
const checklist = ref<Checklist | null>(null)
const expandedState = reactive<Record<string, boolean>>({})

function resolveChecklist() {
  const plane = currentPlane.value
  if (!plane) {
    checklist.value = null
    return
  }

  checklist.value = resolveChecklistForPlane(xmlSource, plane, locale.value)
  for (const section of checklist.value.sections) {
    if (!(section.id in expandedState)) {
      expandedState[section.id] = !section.flags.collapsed
    }
  }
}

watch(locale, resolveChecklist)

// Do-lists (read-and-do flows) get a different header color than regular
// checklists (read-and-confirm), independent of whether they're collapsed
// by default, so the two kinds are visually distinguishable at a glance;
// emergency sections keep their own distinct (red) styling regardless.
function sectionHeaderClass(section: ChecklistSection): string {
  if (section.flags.emergency) {
    return 'bg-red-1 text-red-10'
  }
  return section.flags.dolist ? 'bg-blue-1 text-blue-10' : 'bg-green-1 text-green-10'
}

// Checked/branch state, persisted per plane in localStorage
const checkedState = reactive<Record<string, string>>({})

function storageKey(immatriculation: string): string {
  return `checklist.state.${immatriculation}`
}

function loadState() {
  for (const key of Object.keys(checkedState)) {
    delete checkedState[key]
  }
  const plane = currentPlane.value
  if (!plane) {
    return
  }
  Object.assign(checkedState, stateStore.load(storageKey(plane.immatriculation)))
}

function saveState() {
  const plane = currentPlane.value
  if (!plane) {
    return
  }
  stateStore.save(storageKey(plane.immatriculation), { ...checkedState })
}

function onStateChange() {
  saveState()
}

provide(checklistStateKey, checkedState)
provide(checklistChangeKey, onStateChange)

function onPlaneSelect(immatriculation: string) {
  planeIdent.value = immatriculation
  $q.sessionStorage?.setItem('checklist.input.planeIdent', immatriculation)
  resolveChecklist()
  loadState()
}

// Emergency quick-jump
const sectionRefs = new Map<string, QExpansionItem>()

function setSectionRef(id: string, el: unknown) {
  if (el) {
    sectionRefs.set(id, el as QExpansionItem)
  } else {
    sectionRefs.delete(id)
  }
}

// Scrolls an element into view just below the sticky bar (clock/buttons),
// which stays pinned over the top of the viewport and would otherwise hide
// whatever scrollIntoView aligns flush with the top.
function scrollBelowStickyBar(el: HTMLElement) {
  const stickyBar = document.querySelector('.checklist-sticky-bar')
  if (!stickyBar) {
    return
  }
  const offset = stickyBar.getBoundingClientRect().bottom
  const targetTop = el.getBoundingClientRect().top + window.scrollY - offset - 8
  window.scrollTo({ top: targetTop, behavior: 'smooth' })
}

function jumpToSection(id: string) {
  expandedState[id] = true
  // Wait for the expansion to render before measuring scrollBelowStickyBar.
  void nextTick(() => {
    const el = sectionRefs.get(id)?.$el as HTMLElement | undefined
    if (el) {
      scrollBelowStickyBar(el)
    }
  })
}

// Emergency panel quick-jump: the sticky bar only holds a single button, and
// scrolling down to this panel reveals the per-section emergency buttons.
const emergencyPanelRef = ref<HTMLElement | null>(null)

function scrollToEmergencyPanel() {
  if (emergencyPanelRef.value) {
    scrollBelowStickyBar(emergencyPanelRef.value)
  }
}

// Collapses every do-list and regular checklist section; emergency sections
// are left untouched, since they're reached through the quick-jump buttons.
function onCollapseAll() {
  if (!checklist.value) {
    return
  }
  for (const section of checklist.value.sections) {
    if (!section.flags.emergency) {
      expandedState[section.id] = false
    }
  }
}

// Clear actions
function collectItemIds(section: ChecklistSection): string[] {
  const ids: string[] = []
  const walk = (items: ChecklistSection['items']) => {
    for (const item of items) {
      ids.push(item.id)
      if (item instanceof ChecklistChoice) {
        for (const branch of item.branches) {
          walk(branch.items)
        }
      }
    }
  }
  walk(section.items)
  return ids
}

function onClearSection(section: ChecklistSection) {
  for (const id of collectItemIds(section)) {
    delete checkedState[id]
  }
  saveState()
}

function onClearAll() {
  confirmDialog(t('confirmClearAllChecklistMessage')).onOk(() => {
    for (const key of Object.keys(checkedState)) {
      delete checkedState[key]
    }
    saveState()
  })
}

onMounted(() => {
  const savedPlaneIdent = $q.sessionStorage.getItem<string>('checklist.input.planeIdent')
  const initialIdent =
    savedPlaneIdent && KnownAirplanes[savedPlaneIdent]
      ? savedPlaneIdent
      : (planeOptions.value[0]?.value ?? '')

  if (initialIdent) {
    onPlaneSelect(initialIdent)
  }
})
</script>

<style scoped>
.checklist-sticky-bar {
  position: sticky;
  /* top is set inline, offset below the app's own fixed header */
  z-index: 10;
}
</style>
