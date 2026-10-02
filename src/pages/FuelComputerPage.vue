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
  <q-page padding class="col">
    <div class="q-gutter-md">
      <div class="row q-col-gutter-md items-start print-hide">
        <q-select
          class="col-12 col-md-4"
          v-model="planeIdent"
          :label="$t('immatriculationLabel')"
          :hint="$t('immatriculationHint')"
          :options="filterOptions"
          use-chips
          use-input
          @new-value="onNewPlane"
          @update:model-value="onPlaneSelect"
          @filter="onPlaneFilter"
        />
        <q-select
          class="col-6 col-sm-3 col-md-2"
          :model-value="fuelUnit"
          :options="FUEL_UNITS"
          :option-label="(opt) => $t(opt.label)"
          :label="$t('fuelUnitLabel')"
          @update:model-value="onUnitChange"
        />
        <q-input
          class="col-6 col-sm-3 col-md-3"
          v-model.number="fuelPerHour"
          type="number"
          min="0"
          lazy-rules
          :rules="[positiveRule]"
          :label="$t('fuelConsumptionLabel')"
          :hint="
            $t('fuelConsumptionHint', {
              perMinutes: fuelPerMinutes.toFixed(2),
              fuelUnit: $t(fuelUnit.label),
            })
          "
        />
        <div v-if="planeIsCustom" class="col-auto">
          <q-btn
            flat
            :title="$t('deletePlane')"
            :aria-label="$t('deletePlane')"
            @click="onPlaneDelete"
          >
            <q-icon name="delete_forever" color="negative" />
          </q-btn>
        </div>
        <q-input
          class="col-12 col-sm-4"
          v-model.number="fuelCapacity"
          type="number"
          min="0"
          lazy-rules
          :rules="[positiveRule]"
          :label="$t('fuelCapacityLabel')"
          :hint="$t('fuelCapacityHint')"
        />
        <q-input
          class="col-12 col-sm-4"
          v-model.number="fuelConsumable"
          type="number"
          min="0"
          :max="fuelCapacity"
          lazy-rules
          :rules="[positiveRule, consumableRule]"
          :label="$t('fuelConsumableLabel')"
          :hint="$t('fuelConsumableHint')"
        />
        <q-input
          class="col-12 col-sm-4"
          v-model.number="reserveMin"
          type="number"
          min="0"
          lazy-rules
          :rules="[positiveRule]"
          :label="$t('fuelReserveLabel')"
          :hint="$t('fuelReserveHint')"
        />
      </div>
      <div class="row q-gutter-md print-only">
        <span v-if="planeIdent" class="col-12">
          {{ planeIdent
          }}<template v-if="currentPlane?.model"> ({{ currentPlane.model }})</template>
        </span>
        <span class="col">
          {{ $t('fuelConsumptionLabel') }}: {{ fuelPerHour }} {{ $t(fuelUnit.label) }}/h ({{
            fuelPerMinutes.toFixed(2)
          }}
          {{ $t(fuelUnit.label) }}/min)
        </span>
        <span class="col">
          {{ $t('fuelCapacityLabel') }}: {{ fuelCapacity }}&nbsp;{{ $t(fuelUnit.label) }}
        </span>
        <span class="col">
          {{ $t('fuelConsumableLabel') }}: {{ fuelConsumable }}&nbsp;{{ $t(fuelUnit.label) }}
        </span>
        <span class="col">{{ $t('fuelReserveLabel') }}: {{ reserveMin }}</span>
      </div>
      <q-separator />
      <q-banner rounded class="text-white" :class="statusClass" role="status">
        <template v-slot:avatar>
          <q-icon :name="statusIcon" />
        </template>
        <div class="text-subtitle1 text-weight-medium">{{ $t(statusMessageKey) }}</div>
        <div class="row q-col-gutter-md q-mt-xs">
          <div class="col-12 col-sm-6">
            <div class="text-caption">{{ $t('resultEstimatedUsableFuel') }}</div>
            <div class="text-h5">{{ plan.usable.toString(fuelUnit) }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-caption">{{ $t('resultEstimatedRemainingTime') }}</div>
            <div class="text-h5">{{ remainingTimeText }}</div>
          </div>
        </div>
      </q-banner>
      <div class="q-gutter-md">
        <q-table
          class="col"
          :rows="resultRows"
          :rows-per-page-options="[0]"
          hide-header
          hide-pagination
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="q-tr--no-hover"
              :class="{
                'text-negative': props.row.alert,
                'text-orange-9': props.row.warning,
                'text-weight-medium': props.row.alert || props.row.warning,
              }"
            >
              <q-td key="labelKey" :props="props">
                {{ $t(props.row.labelKey) }}
              </q-td>
              <q-td key="value" :props="props" class="text-right">{{ props.row.value }} </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-separator />
      <div v-if="!isPortrait">
        <q-checkbox
          class="print-hide"
          v-model="printInputTables"
          :label="$t('tablesPrintOption')"
        />
        <div class="row q-gutter-md" :class="{ 'print-hide': !printInputTables }">
          <InputListHours
            class="col"
            v-model="totalFlightDuration"
            v-model:entries="flightTimes"
            :title="$t('tableTimeTitle')"
          />
          <InputListFuel
            class="col"
            v-model="totalAddedFuel"
            v-model:entries="fuelValues"
            :global-fuel-unit="fuelUnit"
            :fuel-capacity="typedFuelCapacity"
            :title="$t('tableFuelTitle')"
          />
        </div>
      </div>
      <div v-else>
        <q-tabs v-model="tab" outside-arrows mobile-arrows style="max-width: 90vw">
          <q-tab name="flightTimeTable" :label="$t('tableTimeTitle')" />
          <q-tab name="fuelTable" :label="$t('tableFuelTitle')" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab">
          <q-tab-panel name="flightTimeTable">
            <InputListHours
              class="col"
              v-model="totalFlightDuration"
              v-model:entries="flightTimes"
            />
          </q-tab-panel>
          <q-tab-panel name="fuelTable">
            <InputListFuel
              class="col"
              v-model="totalAddedFuel"
              v-model:entries="fuelValues"
              :global-fuel-unit="fuelUnit"
              :fuel-capacity="typedFuelCapacity"
            />
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <p class="text-caption text-grey-8">{{ $t('fuelDisclaimer') }}</p>
    </div>
  </q-page>
  <q-footer class="print-only">
    <p>{{ $t('printEditedOn', { date: printDate }) }}</p>
  </q-footer>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import KnowAirplanes from '@/adapters/data/airplanesRepository'
import InputListFuel from '@/components/InputListFuel.vue'
import InputListHours from '@/components/InputListHours.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useOrientation } from '@/composables/useOrientation'
import { AirPlane } from '@/domain/airplanes'
import type { FuelOption } from '@/domain/fuel'
import { findFuelUnit, FUEL_UNITS, FuelQuantity, LITER } from '@/domain/fuel'
import { computeFuelPlan, convertAmount, sanitizeAmount } from '@/domain/fuelPlan'
import { TimePeriod } from '@/domain/time'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()
const { confirmDialog } = useConfirmDialog()

// Display configuration
const { isPortrait } = useOrientation()

const tab = ref('flightTimeTable')

interface ResultRow {
  labelKey: string
  value: string
  warning?: boolean
  alert?: boolean
}

// Plane description. The inputs are numbers, or '' when the field is emptied.
const planeIdent = ref('')
const fuelUnit = ref<FuelOption>(LITER)
const fuelPerHour = ref<number | string>(25.0)
const fuelCapacity = ref<number | string>(110)
const fuelConsumable = ref<number | string>(109)
const reserveMin = ref<number | string>(30)

// Input validation
const positiveRule = (v: unknown) =>
  (typeof v === 'number' && Number.isFinite(v) && v >= 0) || t('fuelRequiredField')
const consumableRule = (v: unknown) =>
  typeof v !== 'number' || v <= sanitizeAmount(fuelCapacity.value) || t('fuelConsumableTooHigh')

// ... typed description
const typedFuelCapacity = computed(
  () => new FuelQuantity(sanitizeAmount(fuelCapacity.value), fuelUnit.value),
)

// Informative
const fuelPerMinutes = computed(() => sanitizeAmount(fuelPerHour.value) / 60)
const fuelValues = ref<FuelQuantity[]>([new FuelQuantity(0)])

// Flight duration
const totalFlightDuration = ref<TimePeriod>(new TimePeriod(0))
const flightTimes = ref<TimePeriod[]>([new TimePeriod(0)])

// Fuel computation: the added fuel total may be in another unit, the plan converts it
const totalAddedFuel = ref<FuelQuantity>(new FuelQuantity(0))
const plan = computed(() =>
  computeFuelPlan({
    unit: fuelUnit.value,
    perHour: sanitizeAmount(fuelPerHour.value),
    capacity: sanitizeAmount(fuelCapacity.value),
    consumable: sanitizeAmount(fuelConsumable.value),
    added: totalAddedFuel.value,
    flightDurationS: totalFlightDuration.value.duration_s,
    reserveMin: sanitizeAmount(reserveMin.value),
  }),
)

// Keep the usable amount in sync when the capacity changes alone (not on plane/unit changes)
let skipConsumableSync = false

watch(
  [planeIdent, fuelCapacity, fuelConsumable],
  ([newPlaneIdent, newCapacity], [oldPlaneIdent, oldCapacity, oldConsumable]) => {
    const skip = skipConsumableSync
    skipConsumableSync = false

    if (!skip && newPlaneIdent == oldPlaneIdent && newCapacity != oldCapacity) {
      const oldNonConsumable = Math.max(
        0,
        sanitizeAmount(oldCapacity) - sanitizeAmount(oldConsumable),
      )
      fuelConsumable.value = Math.max(0, sanitizeAmount(newCapacity) - oldNonConsumable)
    }
  },
)

/** Sets the plane numbers at once, without triggering the consumable synchronisation. */
function applyNumbers(capacity: number, consumable: number, perHour: number) {
  if (capacity !== fuelCapacity.value) {
    skipConsumableSync = true
  }
  fuelCapacity.value = capacity
  fuelConsumable.value = consumable
  fuelPerHour.value = perHour
}

/** Changing the unit converts the figures instead of relabelling them. */
function onUnitChange(newUnit: FuelOption) {
  const oldUnit = fuelUnit.value
  if (newUnit === oldUnit) {
    return
  }
  applyNumbers(
    convertAmount(sanitizeAmount(fuelCapacity.value), oldUnit, newUnit),
    convertAmount(sanitizeAmount(fuelConsumable.value), oldUnit, newUnit),
    convertAmount(sanitizeAmount(fuelPerHour.value), oldUnit, newUnit),
  )
  fuelUnit.value = newUnit
}

// Known airplanes
class PlaneOption {
  label: string
  value: AirPlane

  constructor(value: AirPlane) {
    this.label = value.toString()
    this.value = value
  }
}

const customPlanes = ref<AirPlane[]>([])

const planeOptions = computed(() =>
  Object.values(KnowAirplanes)
    .concat(customPlanes.value)
    .sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
    .map((plane: AirPlane) => new PlaneOption(plane)),
)

const filterOptions = ref<PlaneOption[]>(planeOptions.value)

const currentPlane = ref(null as AirPlane | null)
const planeIsCustom = computed(() => currentPlane.value?.isCustom ?? false)

function onPlaneSelect(value: PlaneOption) {
  currentPlane.value = value?.value ?? null

  if (currentPlane.value) {
    const plane = currentPlane.value

    planeIdent.value = plane.immatriculation

    const inputFuelUnit = findFuelUnit(plane.fuelUnit)
    if (inputFuelUnit) {
      fuelUnit.value = inputFuelUnit
    }

    applyNumbers(plane.fuelCapacity, plane.fuelConsumable, plane.fuelConsumption)
  }
}

function saveCustomPlanes() {
  $q.localStorage?.setItem('fuel_computer.input.planes', JSON.stringify(customPlanes.value))
}

function onNewPlane(
  value: string,
  done: (item: PlaneOption, mode?: 'add' | 'add-unique' | 'toggle') => void,
) {
  const ident = value.toUpperCase().trim()
  if (!ident) {
    return
  }

  // Never shadow an existing airplane: select it instead
  const existing = planeOptions.value.find((p) => p.value.immatriculation.toUpperCase() === ident)
  if (existing) {
    done(existing)
    return
  }

  // Prepare the new Airplane object
  const newPlane = new AirPlane(
    ident,
    '',
    'custom',
    fuelUnit.value.label,
    sanitizeAmount(fuelCapacity.value),
    sanitizeAmount(fuelConsumable.value),
    sanitizeAmount(fuelPerHour.value),
  )
  newPlane.isCustom = true
  customPlanes.value.push(newPlane)
  saveCustomPlanes()

  planeIdent.value = newPlane.immatriculation
  done(new PlaneOption(newPlane))
}

/** Persists edits of a custom airplane. */
function onPlaneSave() {
  const plane = currentPlane.value
  if (!plane || !plane.isCustom) {
    return
  }

  plane.fuelUnit = fuelUnit.value.label
  plane.fuelCapacity = sanitizeAmount(fuelCapacity.value)
  plane.fuelConsumable = sanitizeAmount(fuelConsumable.value)
  plane.fuelConsumption = sanitizeAmount(fuelPerHour.value)

  saveCustomPlanes()
}

function onPlaneDelete() {
  if (!currentPlane.value || !currentPlane.value.isCustom) {
    return
  }

  confirmDialog(t('confirmDeletePlaneMessage')).onOk(() => {
    const index = customPlanes.value.findIndex(
      (p) => p.immatriculation === currentPlane.value?.immatriculation,
    )
    if (index >= 0) {
      customPlanes.value.splice(index, 1)
      saveCustomPlanes()
    }

    // Reset the current plane
    currentPlane.value = null
    $q.sessionStorage?.remove('fuel_computer.input.planeIdent')
    if (planeOptions.value[0]) {
      onPlaneSelect(planeOptions.value[0])
    } else {
      planeIdent.value = ''
    }
  })
}

function onPlaneFilter(value: string, update: (callback: () => void) => void) {
  // Always show all options
  update(() => {
    // No filter
    if (!value) {
      filterOptions.value = planeOptions.value
    } else {
      const needle = value.toUpperCase().trim()
      filterOptions.value = planeOptions.value.filter((opt) =>
        opt.value.immatriculation.toUpperCase().includes(needle),
      )
    }
  })
}

// Result display
const statusClass = computed(
  () =>
    ({
      ok: 'bg-positive',
      warning: 'bg-orange-9',
      alert: 'bg-negative',
    })[plan.value.status],
)
const statusIcon = computed(
  () =>
    ({
      ok: 'check_circle',
      warning: 'warning',
      alert: 'error',
    })[plan.value.status],
)
const statusMessageKey = computed(() => {
  if (plan.value.status === 'alert') {
    return plan.value.insufficient ? 'statusAlertShortfall' : 'statusAlertReserve'
  }
  return plan.value.status === 'warning' ? 'statusWarning' : 'statusOk'
})

const remainingTimeText = computed(() => {
  if (plan.value.usableTimeS === null) {
    return t('untilEmpty')
  }
  // Round down: the displayed endurance must never be optimistic
  const duration = new TimePeriod(Math.floor(plan.value.usableTimeS / 60) * 60)
  return `${duration.toString()} (${Math.floor(plan.value.usableTimeS / 60)} ${t('minutesShort')})`
})

const resultRows = computed((): ResultRow[] => {
  const warning = plan.value.status === 'warning'
  const alert = plan.value.status === 'alert'
  const flightMinutes = Math.ceil(totalFlightDuration.value.duration_s / 60)

  return [
    {
      labelKey: 'resultTotalTime',
      value: `${totalFlightDuration.value.toString()} (${flightMinutes} ${t('minutesShort')})`,
    },
    {
      labelKey: 'resultTotalFuelConsumed',
      // Consumption is rounded up, what is left is rounded down
      value: plan.value.consumed.toString(fuelUnit.value, 'up'),
    },
    {
      labelKey: 'resultTotalFuelAdded',
      value: totalAddedFuel.value.toString(fuelUnit.value),
    },
    {
      labelKey: 'resultEstimatedFuel',
      value: `${plan.value.remaining.toString(fuelUnit.value)} (${plan.value.remainingPercent} %)`,
      warning,
      alert,
    },
    {
      labelKey: 'resultEstimatedUsableFuel',
      value: plan.value.usable.toString(fuelUnit.value),
      warning,
      alert,
    },
    {
      labelKey: 'resultEstimatedRemainingTime',
      value: remainingTimeText.value,
      warning,
      alert,
    },
  ]
})

// Print: date of the print, not of the last render
const printInputTables = ref(false)
const printDate = ref(new Date().toLocaleString())
const refreshPrintDate = () => {
  printDate.value = new Date().toLocaleString()
}

function setSession(key: string, value: string | number) {
  // An emptied field ('') is not worth restoring
  if (value !== '') {
    $q.sessionStorage?.setItem(`fuel_computer.input.${key}`, value)
  }
}

// Keep the session and the custom airplane up to date
watch([fuelUnit, fuelPerHour, fuelCapacity, fuelConsumable, reserveMin], () => {
  setSession('fuelUnit', fuelUnit.value.label)
  setSession('fuelPerHour', fuelPerHour.value)
  setSession('fuelCapacity', fuelCapacity.value)
  setSession('fuelConsumable', fuelConsumable.value)
  setSession('reserveMin', reserveMin.value)
  onPlaneSave()
})
watch(planeIdent, (ident) => {
  if (typeof ident === 'string') {
    setSession('planeIdent', ident)
  }
})

// Load previous details from session storage
onMounted(() => {
  window.addEventListener('beforeprint', refreshPrintDate)

  // Reload custom planes
  customPlanes.value = (
    JSON.parse($q.localStorage.getItem('fuel_computer.input.planes') ?? '[]') as AirPlane[]
  ).map((p) => {
    const plane = new AirPlane(
      p.immatriculation,
      p.brand,
      p.model,
      p.fuelUnit,
      p.fuelCapacity,
      p.fuelConsumable,
      p.fuelConsumption,
    )
    plane.isCustom = true
    return plane
  })
  filterOptions.value = planeOptions.value

  // Select the previously selected plane, if any...
  const savedPlaneIdent = $q.sessionStorage.getItem<string>('fuel_computer.input.planeIdent')
  const matchingPlane = savedPlaneIdent
    ? planeOptions.value.find((p) => p.value.immatriculation === savedPlaneIdent)
    : undefined
  const initialPlane = matchingPlane ?? planeOptions.value[0]
  if (initialPlane) {
    onPlaneSelect(initialPlane)
  }

  // ... then restore the figures of the session on top of it (they may have been edited)
  const fuelUnitLabel = $q.sessionStorage.getItem<string>('fuel_computer.input.fuelUnit')
  const savedUnit = FUEL_UNITS.find((f) => f.label === fuelUnitLabel)
  if (savedUnit) {
    fuelUnit.value = savedUnit
  }

  const saved = (key: string, fallback: number | string) =>
    $q.sessionStorage.getItem<number | string>(`fuel_computer.input.${key}`) ?? fallback
  applyNumbers(
    saved('fuelCapacity', fuelCapacity.value) as number,
    saved('fuelConsumable', fuelConsumable.value) as number,
    saved('fuelPerHour', fuelPerHour.value) as number,
  )
  reserveMin.value = saved('reserveMin', reserveMin.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeprint', refreshPrintDate)
})
</script>
