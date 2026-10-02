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
  <q-card class="q-pa-md" style="min-width: min-content">
    <div class="column q-gutter-md">
      <span v-if="title" class="text-subtitle1 text-center">{{ title }}</span>
      <q-form class="print-hide" @submit.prevent="onSubmit">
        <div class="column q-gutter-sm">
          <q-btn-toggle
            v-model="inputKind"
            spread
            no-caps
            unelevated
            toggle-color="primary"
            :options="[
              { label: $t('eventFuel'), value: 'fuel', icon: 'local_gas_station' },
              { label: $t('eventFlight'), value: 'flight', icon: 'flight' },
            ]"
          />
          <div class="row q-gutter-xs items-start">
            <div v-if="inputKind === 'fuel'" class="col row q-gutter-xs no-wrap">
              <q-input
                ref="fuelInputField"
                class="col"
                :label="$t('fuelInputLabel')"
                :hint="$t('fuelInputHint')"
                v-model.number="fuelInput"
                type="number"
                min="0"
                inputmode="decimal"
                filled
                @update:model-value="errorMessage = null"
              />
              <q-select
                class="col-4"
                v-model="fuelInputUnit"
                :options="FUEL_UNITS"
                :option-label="(opt) => $t(opt.label)"
                :aria-label="$t('fuelUnitLabel')"
                filled
              />
            </div>
            <q-input
              v-else
              ref="timeInputField"
              class="col"
              :label="$t('timeInputLabel')"
              v-model="timeInput"
              inputmode="numeric"
              mask="#:##"
              fill-mask="0"
              maxlength="5"
              reverse-fill-mask
              filled
              @update:model-value="errorMessage = null"
            />
            <q-btn
              :icon="editingIdx === null ? 'add' : 'check'"
              type="submit"
              :title="editingIdx === null ? $t('addEntry') : $t('saveEntry')"
            />
            <q-btn
              v-if="editingIdx !== null"
              icon="close"
              :title="$t('cancelEdit')"
              @click="cancelEdit"
            />
            <q-btn v-else @mousedown.prevent @click="onDeleteAll" :title="$t('deleteAll')">
              <q-icon name="delete_forever" color="negative" />
            </q-btn>
          </div>
          <span v-show="errorMessage" class="text-negative" role="alert">{{ errorMessage }}</span>
        </div>
      </q-form>
      <q-list bordered separator>
        <q-item v-if="events.length === 0">
          <q-item-section class="text-grey-7">{{ $t('timelineEmpty') }}</q-item-section>
        </q-item>
        <q-item
          v-for="(event, idx) in events"
          :key="idx"
          :class="{ 'bg-blue-1': editingIdx === idx }"
        >
          <q-item-section avatar>
            <q-icon :name="event.kind === 'fuel' ? 'local_gas_station' : 'flight'" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ describe(event) }}</q-item-label>
            <q-item-label caption>
              <template v-if="steps[idx]">
                {{ $t('timelineLevelAfter', { level: steps[idx].levelAfter.toString(unit) }) }}
              </template>
            </q-item-label>
            <q-item-label v-if="steps[idx]?.overflow" caption class="text-orange-9" role="alert">
              <q-icon name="warning" /> {{ $t('timelineOverflow') }}
            </q-item-label>
            <q-item-label v-if="steps[idx]?.shortfall" caption class="text-negative" role="alert">
              <q-icon name="error" /> {{ $t('timelineShortfall') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side class="print-hide">
            <div class="row no-wrap items-center">
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="arrow_upward"
                :disable="idx === 0"
                :title="$t('moveUp')"
                @click="move(idx, -1)"
              />
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="arrow_downward"
                :disable="idx === events.length - 1"
                :title="$t('moveDown')"
                @click="move(idx, 1)"
              />
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="edit"
                :title="$t('editEntry')"
                @click="onEdit(idx)"
              />
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="delete"
                color="negative"
                :title="$t('deleteRow')"
                @click="onDelete(idx)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { QInput } from 'quasar'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { FuelOption } from '@/domain/fuel'
import { FUEL_UNITS, FuelQuantity, roundFuel } from '@/domain/fuel'
import type { TimelineEvent, TimelineStep } from '@/domain/fuelPlan'
import { TimePeriod } from '@/domain/time'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { confirmDialog } = useConfirmDialog()

const props = defineProps<{
  /** Display unit of the fuel levels, and default unit of new entries. */
  unit: FuelOption
  /** Level after each event, as computed by the fuel plan. */
  steps: TimelineStep[]
  title?: string
}>()

const events = defineModel<TimelineEvent[]>({ default: () => [] })

const inputKind = ref<'fuel' | 'flight'>('fuel')
const fuelInput = ref<number | string>('')
const fuelInputUnit = ref(props.unit)
const timeInput = ref('0:30')
const fuelInputField = ref<QInput>()
const timeInputField = ref<QInput>()
const errorMessage = ref<string | null>(null)
// Index of the entry being edited: it stays in the list until the edit is saved
const editingIdx = ref<number | null>(null)

watch(
  () => props.unit,
  (newUnit) => {
    fuelInputUnit.value = newUnit
  },
)

function describe(event: TimelineEvent): string {
  if (event.kind === 'fuel') {
    return `${t('eventFuel')}: ${event.quantity.toString()}`
  }
  return `${t('eventFlight')}: ${new TimePeriod(event.durationS).toString()} (${Math.ceil(event.durationS / 60)} ${t('minutesShort')})`
}

function focusInput() {
  const field = inputKind.value === 'fuel' ? fuelInputField.value : timeInputField.value
  field?.focus()
  field?.select()
}

/** Builds the event described by the form, or sets the error message. */
function readForm(): TimelineEvent | null {
  if (inputKind.value === 'fuel') {
    // An empty field gives '' with v-model.number
    const amount = typeof fuelInput.value === 'number' ? fuelInput.value : NaN
    if (!Number.isFinite(amount) || amount <= 0) {
      errorMessage.value = t('fuelInvalidAmount')
      return null
    }
    return { kind: 'fuel', quantity: new FuelQuantity(amount, fuelInputUnit.value) }
  }

  const match = /^(\d{1,2}):(\d{1,2})$/.exec(timeInput.value.trim())
  if (!match) {
    errorMessage.value = t('invalidTime')
    return null
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (minutes >= 60) {
    errorMessage.value = t('invalidMinutes')
    return null
  }
  if (hours === 0 && minutes === 0) {
    errorMessage.value = t('invalidTime')
    return null
  }
  return { kind: 'flight', durationS: hours * 3600 + minutes * 60 }
}

function onSubmit() {
  const event = readForm()
  if (event) {
    const copy = [...events.value]
    if (editingIdx.value === null) {
      copy.push(event)
    } else {
      copy[editingIdx.value] = event
      editingIdx.value = null
    }
    events.value = copy
    errorMessage.value = null
  }
  focusInput()
}

/** Loads an entry in the form. It is only replaced when the edit is saved. */
function onEdit(idx: number) {
  const event = events.value[idx]
  if (!event) {
    return
  }
  editingIdx.value = idx
  errorMessage.value = null
  inputKind.value = event.kind
  if (event.kind === 'fuel') {
    fuelInput.value = roundFuel(event.quantity.value.scalar, 3)
    fuelInputUnit.value = event.quantity.unit
  } else {
    timeInput.value = new TimePeriod(event.durationS).toString()
  }
}

function cancelEdit() {
  editingIdx.value = null
  errorMessage.value = null
}

function onDelete(idx: number) {
  if (editingIdx.value === idx) {
    editingIdx.value = null
  } else if (editingIdx.value !== null && editingIdx.value > idx) {
    editingIdx.value -= 1
  }
  events.value = events.value.filter((_, i) => i !== idx)
}

function onDeleteAll() {
  if (events.value.length > 1) {
    confirmDialog(t('confirmDeleteAllMessage')).onOk(() => {
      editingIdx.value = null
      events.value = []
    })
  } else {
    editingIdx.value = null
    events.value = []
  }
}

function move(idx: number, delta: -1 | 1) {
  const target = idx + delta
  const copy = [...events.value]
  const moved = copy[idx]
  const other = copy[target]
  if (moved === undefined || other === undefined) {
    return
  }
  copy[idx] = other
  copy[target] = moved
  events.value = copy

  if (editingIdx.value === idx) {
    editingIdx.value = target
  } else if (editingIdx.value === target) {
    editingIdx.value = idx
  }
}
</script>
