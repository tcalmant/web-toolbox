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
  <q-page padding>
    <div class="col q-gutter-md q-pa-md">
      <div :class="{ row: !isPortrait, col: isPortrait }">
        <q-input
          :class="{ row: isPortrait, col: !isPortrait }"
          v-model.number="unixTimestamp"
          type="number"
          inputmode="numeric"
          :label="$t('unixLabel')"
          @update:model-value="onTimestampChange"
        >
          <template v-slot:prepend>
            <q-icon name="history" @click="reset()" />
          </template>
        </q-input>
        <q-select
          :class="{ row: isPortrait, col: !isPortrait, 'q-mx-md': !isPortrait }"
          v-model="unixTimestampUnit"
          :options="TIMESTAMP_UNITS"
          :option-label="(opt) => opt.getLabel()"
          :label="$t('unixPrecisionLabel')"
        >
        </q-select>
      </div>
      <q-input
        v-model="dateUTC"
        :label="$t('utcLabel')"
        :hint="$t('utcHint')"
        @update:model-value="onUTCDateChange"
      >
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                :model-value="dateUTC"
                mask="YYYY-MM-DD HH:mm:ss"
                @update:model-value="onUTCDateChange"
                :today-btn="true"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time
                :model-value="dateUTC"
                mask="YYYY-MM-DD HH:mm:ss"
                @update:model-value="onUTCDateChange"
                :now-btn="true"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <div :class="{ row: !isPortrait, col: isPortrait }">
        <q-input
          :class="{ row: isPortrait, col: !isPortrait }"
          v-model="dateLocalTZ"
          :label="$t('localDateLabel')"
          :hint="
            $t('localDateHint', {
              tzName: selectedTz,
              utcOffset: formatTzOffset(new Date(unixTimestamp!), selectedTz),
            })
          "
          @update:model-value="onLocalDateChange"
        >
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="dateLocalTZ"
                  mask="YYYY-MM-DD HH:mm:ss"
                  @update:model-value="onLocalDateChange"
                  :today-btn="true"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time
                  :model-value="dateLocalTZ"
                  mask="YYYY-MM-DD HH:mm:ss"
                  @update:model-value="onLocalDateChange"
                  :now-btn="true"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-select
          :class="{ row: isPortrait, col: !isPortrait, 'q-mx-md': !isPortrait }"
          v-model="selectedTz"
          :options="tzList"
          :label="$t('timezoneLabel')"
          use-input
          input-debounce="0"
          @filter="filterTimezone"
        >
          <template v-slot:append>
            <q-btn
              icon="public"
              flat
              @click.prevent="selectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone"
            />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { dateToString, dateToUTCString, formatTzOffset } from 'src/components/timeUtils'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Display configuration
const isPortrait = ref(window.innerHeight > window.innerWidth)

const updateOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth
}

onMounted(() => window.addEventListener('resize', updateOrientation))
onUnmounted(() => window.removeEventListener('resize', updateOrientation))

/**
 * Representation of support timestamp units
 */
class TimestampUnit {
  label: string
  nanoseconds: number
  nbNanosecondsDigits: number

  constructor(label: string, nanoseconds: number) {
    this.label = label
    this.nanoseconds = nanoseconds
    this.nbNanosecondsDigits = Math.floor(Math.log10(nanoseconds))
  }

  getLabel(): string {
    return this.label
  }

  fromNanoseconds(value: number): number {
    return value / this.nanoseconds
  }

  toNanoseconds(value: number): number {
    return value * this.nanoseconds
  }

  toMilliseconds(value: number): number {
    return (value * this.nanoseconds) / 1000000
  }
}

/**
 * Nanoseconds and milliseconds units are used internally
 */
const unitNs = new TimestampUnit('ns', 1)
const unitSecond = new TimestampUnit('s', 1000000000)
const unitMs = new TimestampUnit('ms', 1000000)
const unitMicro = new TimestampUnit('µs', 1000)

class AutoTimestampUnit extends TimestampUnit {
  knownUnits: TimestampUnit[]
  nbDigitsNowNs: number
  lastUnit: TimestampUnit

  constructor(label: string, knownUnits: TimestampUnit[]) {
    super(label, 0)
    this.knownUnits = knownUnits

    // Base configuration
    const now = new Date().getTime()
    this.nbDigitsNowNs = Math.floor(Math.log10(unitMs.toNanoseconds(now)))
    this.lastUnit = unitMs

    // Go through the method to update the label
    this.autoUnit(now)
  }

  detectUnit(value: number): TimestampUnit {
    const nbDigitsValue = Math.floor(Math.log10(Math.abs(value)))
    const matchingUnits = this.knownUnits
      .filter((u) => nbDigitsValue <= this.nbDigitsNowNs - u.nbNanosecondsDigits)
      .sort((a, b) => b.nanoseconds - a.nanoseconds)

    const matchingUnit = matchingUnits[0]
    if (matchingUnit) {
      return matchingUnit
    } else {
      // Fall back to nanoseconds if nothing matches
      return unitNs
    }
  }

  override getLabel(): string {
    return t('autoPrecisionLabel', { subUnit: this.lastUnit.label })
  }

  private autoUnit(value: number): TimestampUnit {
    const newUnit = this.detectUnit(value)
    this.label = t('autoPrecisionLabel', { subUnit: newUnit.label })
    this.lastUnit = newUnit
    return newUnit
  }

  override fromNanoseconds(value: number): number {
    return this.lastUnit.fromNanoseconds(value)
  }

  override toNanoseconds(value: number): number {
    return this.autoUnit(value).toNanoseconds(value)
  }

  override toMilliseconds(value: number): number {
    return this.autoUnit(value).toMilliseconds(value)
  }
}

const autoUnit = new AutoTimestampUnit('Auto', [unitSecond, unitMs, unitMicro, unitNs])

const TIMESTAMP_UNITS: TimestampUnit[] = [autoUnit, ...autoUnit.knownUnits]

/**
 * The internal value, in nanoseconds
 */
const unixTimestampNs = ref<number>(unitMs.toNanoseconds(new Date().getTime()))
const unixTimestampUnit = ref<TimestampUnit>(autoUnit)

function reset() {
  unixTimestampNs.value = unitMs.toNanoseconds(new Date().getTime())
}

/**
 * Input models
 */
const unixTimestamp = ref<number>(new Date().getTime())
const dateUTC = ref<string>('')
const dateLocalTZ = ref<string>('')

const allTimezones: string[] = Intl.supportedValuesOf('timeZone')
const tzList = ref<string[]>(allTimezones)
const selectedTz = ref<string>(Intl.DateTimeFormat().resolvedOptions().timeZone)

/**
 * Update on internal change
 */
watch(
  unixTimestampNs,
  (newValue) => {
    if (isFinite(newValue)) {
      const internalDate = new Date(unitNs.toMilliseconds(newValue))
      unixTimestamp.value = Math.floor(unixTimestampUnit.value.fromNanoseconds(newValue))
      dateUTC.value = dateToUTCString(internalDate)
      dateLocalTZ.value = dateToString(internalDate, selectedTz.value)
    }
  },
  { immediate: true },
)

watch(selectedTz, () => {
  dateLocalTZ.value = dateToString(
    new Date(unitNs.toMilliseconds(unixTimestampNs.value)),
    selectedTz.value,
  )
})

function filterTimezone(value: string, update: (cb: () => void) => void) {
  if (value == '') {
    update(() => {
      tzList.value = allTimezones
    })
  } else {
    update(() => {
      const filterStr = value.toLowerCase()
      tzList.value = allTimezones.filter((tzName) => tzName.toLowerCase().includes(filterStr))
    })
  }
}

function onTimestampChange(newValue: string | number | null) {
  if (newValue === null || newValue === undefined) {
    return
  }

  if (typeof newValue === 'string') {
    newValue = parseInt(newValue)
  }

  if (isFinite(newValue)) {
    unixTimestampNs.value = unixTimestampUnit.value.toNanoseconds(newValue)
  }
}

function onUTCDateChange(newValue: string | number | null) {
  if (newValue === null || newValue === undefined) {
    return
  }

  const dateInLocalTz = new Date(newValue)
  if (dateInLocalTz !== undefined) {
    // The date is parsed as if it was a local time: convert it back to UTC
    const utcTimestamp = dateInLocalTz.getTime() - dateInLocalTz.getTimezoneOffset() * 60000
    if (!isNaN(utcTimestamp)) {
      unixTimestampNs.value = unitMs.toNanoseconds(utcTimestamp)
    }
  }
}

function onLocalDateChange(newValue: string | number | null) {
  if (newValue === null || newValue === undefined) {
    return
  }

  const date = new Date(newValue)
  if (date !== undefined) {
    unixTimestampNs.value = unitMs.toNanoseconds(date.getTime())
  }
}
</script>
