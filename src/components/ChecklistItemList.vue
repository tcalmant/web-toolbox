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
  <q-list dense>
    <template v-for="item in items" :key="item.id">
      <q-item v-if="isRow(item)" tag="label" :class="{ 'items-start': !!item.note }">
        <q-item-section side :top="!!item.note">
          <q-checkbox
            :model-value="isChecked(item.id)"
            @update:model-value="(checked: boolean) => onRowToggle(item.id, checked)"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.text }}</q-item-label>
          <q-item-label caption v-if="item.note">{{ item.note }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="isChecked(item.id)">
          <q-item-label caption>{{ state[item.id] }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-banner v-else-if="isInfo(item)" dense class="bg-blue-1 text-blue-10 q-my-xs">
        {{ item.text }}
        <template v-if="item.note" v-slot:action>
          <span class="text-caption">{{ item.note }}</span>
        </template>
      </q-banner>

      <div v-else-if="isChoice(item)" class="q-my-sm q-pl-sm">
        <div class="text-weight-medium">{{ item.prompt }}</div>
        <div class="row q-gutter-xs q-my-xs">
          <q-btn
            v-for="branch in item.branches"
            :key="branch.id"
            dense
            no-caps
            :outline="state[item.id] !== branch.id"
            :color="state[item.id] === branch.id ? 'primary' : undefined"
            :label="branch.label"
            @click="onChoiceSelect(item.id, branch.id)"
          />
        </div>
        <ChecklistItemList v-if="selectedBranch(item)" :items="selectedBranch(item)!.items" />
      </div>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { inject } from 'vue'

import { checklistChangeKey, checklistStateKey } from '@/composables/useChecklistState'
import {
  ChecklistChoice,
  ChecklistInfo,
  ChecklistRow,
  type ChecklistItem,
} from '@/domain/checklist'
import { dateToUTCString } from '@/domain/time'

defineProps<{
  items: ChecklistItem[]
}>()

const injectedState = inject(checklistStateKey)
const injectedNotifyChange = inject(checklistChangeKey)
if (injectedState === undefined || injectedNotifyChange === undefined) {
  throw new Error('ChecklistItemList must be used within a component providing checklistStateKey')
}
const state: Record<string, string> = injectedState
const notifyChange: () => void = injectedNotifyChange

function isRow(item: ChecklistItem): item is ChecklistRow {
  return item instanceof ChecklistRow
}

function isInfo(item: ChecklistItem): item is ChecklistInfo {
  return item instanceof ChecklistInfo
}

function isChoice(item: ChecklistItem): item is ChecklistChoice {
  return item instanceof ChecklistChoice
}

// `id in state` alone would also match inherited Object.prototype members
// (e.g. a row id of "constructor" would read as checked from the first
// render), so it's filtered through Object.hasOwn. The `in` check still
// has to run first: it's what Vue's reactive Proxy tracks as a dependency
// (via its `has` trap) - Object.hasOwn alone reads through the untracked
// `getOwnPropertyDescriptor` trap and would silently stop updating the
// checkbox on state changes.
function isChecked(id: string): boolean {
  return id in state && Object.hasOwn(state, id)
}

function selectedBranch(choice: ChecklistChoice) {
  const branchId = state[choice.id]
  return choice.branches.find((branch) => branch.id === branchId)
}

function onRowToggle(id: string, checked: boolean) {
  if (checked) {
    state[id] = dateToUTCString(new Date())
  } else {
    delete state[id]
  }
  notifyChange()
}

function onChoiceSelect(choiceId: string, branchId: string) {
  state[choiceId] = branchId
  notifyChange()
}
</script>
