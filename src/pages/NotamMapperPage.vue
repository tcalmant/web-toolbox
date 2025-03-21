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
        <q-input v-model="inputText" label="NOTAM entries" filled type="textarea" autogrow />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import MapView from 'src/components/MapView.vue'
import { NOTAM } from 'src/components/notamUtils'
import { ref, watch } from 'vue'

const inputText = ref('')
const mapViewRef = ref()

watch(inputText, (newValue: string) => handleInput(newValue))

function handleInput(fullText: string): void {
  mapViewRef.value?.setNOTAMs(parseNotams(fullText))
}

function findFirst(text: string, startIdx: number, ...patterns: string[]): number {
  const foundIndices = patterns.map((p) => text.indexOf(p, startIdx)).filter((idx) => idx != -1)
  if (foundIndices.length == 0) {
    return -1
  } else {
    return Math.min(...foundIndices)
  }
}

function parseNotams(fullText: string): NOTAM[] {
  let lastEndIdx = 0
  let notamStartIdx = -1
  const notams: NOTAM[] = []
  while ((notamStartIdx = findFirst(fullText, lastEndIdx, 'A)', 'Q)')) != -1) {
    lastEndIdx = fullText.indexOf('\n\n', notamStartIdx)
    if (lastEndIdx == -1) {
      lastEndIdx = fullText.length
    }

    const notamContent = fullText.substring(notamStartIdx, lastEndIdx)
    const notam = new NOTAM(notamContent)
    notams.push(notam)
  }
  return notams
}
</script>
