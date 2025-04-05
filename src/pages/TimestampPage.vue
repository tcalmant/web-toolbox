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
      <div class="row">
        <q-input
          class="col"
          v-model.number="unixTimestamp"
          type="number"
          inputmode="numeric"
          label="Unix Timestamp"
          @update:model-value="onTimestampChange"
        />
        <q-select
          class="col"
          v-model="unixTimestampUnit"
          :options="TIMESTAMP_UNITS"
          label="Precision"
        />
      </div>
      <q-input
        v-model="dateUTC"
        label="Date (UTC)"
        hint="UTC date"
        @update:model-value="onUTCDateChange"
      />
      <q-input
        v-model="dateLocalTZ"
        label="Local date"
        :hint="`Date in local timezone: UTC ${formatTzOffset(new Date())}`"
        @update:model-value="onLocalDateChange"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { dateToString, dateToUTCString, formatTzOffset } from 'src/components/timeUtils'
import { ref, watch } from 'vue'

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
  baseLabel: string
  knownUnits: TimestampUnit[]
  nbDigitsNowNs: number
  lastUnit: TimestampUnit

  constructor(label: string, knownUnits: TimestampUnit[]) {
    super(label, 0)
    this.baseLabel = label
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

  private autoUnit(value: number): TimestampUnit {
    const newUnit = this.detectUnit(value)
    this.label = `${this.baseLabel} (${newUnit.label})`
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

const autoUnit = new AutoTimestampUnit('Auto', [unitNs, unitSecond, unitMs, unitMicro])

const TIMESTAMP_UNITS: TimestampUnit[] = [autoUnit, ...autoUnit.knownUnits]

/**
 * The internal value, in nanoseconds
 */
const unixTimestampNs = ref<number>(unitMs.toNanoseconds(new Date().getTime()))
const unixTimestampUnit = ref<TimestampUnit>(autoUnit)

/**
 * Input models
 */
const unixTimestamp = ref<number>()
const dateUTC = ref<string>('')
const dateLocalTZ = ref<string>('')

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
      dateLocalTZ.value = dateToString(internalDate, false)
    }
  },
  { immediate: true },
)

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
