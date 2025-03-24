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
    <div class="row q-gutter-md q-pa-md" style="min-height: inherit">
      <div class="col-6">
        <MapView ref="mapViewRef" />
      </div>
      <div class="col-5 full-height">
        <q-tabs v-model="selectedTab">
          <q-tab name="notamTab" label="NOTAM" icon="timer" />
          <q-tab name="aipTab" label="AIP" icon="menu_book" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="selectedTab" animated>
          <q-tab-panel name="notamTab">
            <q-input v-model="inputNOTAMText" label="NOTAM entries" filled type="textarea" autofocus autogrow />
          </q-tab-panel>
          <q-tab-panel name="aipTab">
            <q-input v-model="inputAIPText" label="AIP entries" filled type="textarea" autofocus autogrow />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { AIP } from 'src/components/aipUtils'
import MapView from 'src/components/MapView.vue'
import { NOTAM } from 'src/components/notamUtils'
import { findFirstRegex } from 'src/components/stringUtils'
import { onMounted } from 'vue'
import { ref, watch } from 'vue'

const inputNOTAMText = ref('')
const inputAIPText = ref('')
const mapViewRef = ref()

const selectedTab = ref('notamTab')

onMounted(() => {
  handleNOTAMInput(inputNOTAMText.value)
  handleAIPInput(inputAIPText.value)
})
watch(inputNOTAMText, (newValue: string) => handleNOTAMInput(newValue))
watch(inputAIPText, (newValue: string) => handleAIPInput(newValue))

function handleNOTAMInput(fullText: string): void {
  mapViewRef.value?.setNOTAMs(parseNotams(fullText))
}

function handleAIPInput(fullText: string): void {
  mapViewRef.value?.setAIP(new AIP(fullText).polygons ?? [], fullText)
}

function parseNotams(fullText: string): NOTAM[] {
  let lastEndIdx = -1
  let sectionStartIdx = -1
  const notams: NOTAM[] = []
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
    const notam = new NOTAM(notamContent)
    notams.push(notam)
  }
  return notams
}
</script>
