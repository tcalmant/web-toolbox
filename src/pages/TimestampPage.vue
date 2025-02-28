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
    <q-input v-model="unixTimestamp" label="Unix Timestamp" :hint="unixTimestampUnit" />
    <q-input v-model="dateUTC" label="Date (UTC)" hint="UTC date" />
    <q-input v-model="dateLocalTZ" label="Local date"
      :hint="`Date in local timezone: UTC ${formatTzOffset(shownDate)}`" />
  </q-page>
</template>

<script setup lang="ts">
import { dateToString, dateToUTCString, formatTzOffset } from 'src/components/timeUtils';
import { computed, ref } from 'vue';

/**
 * Supported timestamp units
 */
enum TimestampUnit {
  SECOND = "s",
  MILLISECOND = "ms",
  MICROSECOND = "µs",
  NANOSECOND = "ns",
}

/**
 * Initial date value
 */
const shownDate = ref(new Date());

/**
 * UNIX timestamp
 */
const unixTimestamp = computed({
  get: () => {
    return shownDate.value.getTime()
  },
  set: (newValue: string) => {
    const newValueNumber = parseInt(newValue);
    if (newValueNumber !== undefined) {
      shownDate.value = new Date(ensureMilliSeconds(newValueNumber))
    }
  }
})

/**
 * UTC date
 */
const dateUTC = computed({
  get: () => {
    return dateToUTCString(shownDate.value)
  },
  set: (newValue: string) => {
    const dateInLocalTz = new Date(newValue);
    if (dateInLocalTz !== undefined) {
      // The date is parsed as if it was a local time: convert it back to UTC
      const dateInUTC = new Date(dateInLocalTz.getTime() - dateInLocalTz.getTimezoneOffset() * 60000)
      shownDate.value = dateInUTC
    }
  }
})

/**
 * Date in local timezone
 */
const dateLocalTZ = computed({
  get: () => {
    return dateToString(shownDate.value, false)
  },
  set: (newValue: string) => {
    const date = new Date(newValue);
    if (date !== undefined) {
      shownDate.value = date
    }
  }
})

/**
 * The unit of the timestamp
 */
const unixTimestampUnit = computed(() => detectTimestampUnit(unixTimestamp.value));

/**
 * Compute the unit of the timestamp
 */
function detectTimestampUnit(ts: number): TimestampUnit {
  const nbDigits = Math.floor(Math.log10(ts))
  if (nbDigits >= 18) {
    return TimestampUnit.NANOSECOND
  }

  if (nbDigits >= 15) {
    return TimestampUnit.MICROSECOND
  }

  if (nbDigits >= 12) {
    return TimestampUnit.MILLISECOND
  }

  return TimestampUnit.SECOND
}

/**
 * Ensures that the given timestamp is in milliseconds
 * @param ts Timestamp to convert
 * @returns A timestamp in milliseconds
 */
function ensureMilliSeconds(ts: number): number {
  switch (detectTimestampUnit(ts)) {
    case TimestampUnit.NANOSECOND:
      return Math.round(ts / 1000000)
    case TimestampUnit.MICROSECOND:
      return Math.round(ts / 1000)
    case TimestampUnit.SECOND:
      return ts * 1000;
    case TimestampUnit.MILLISECOND:
    default:
      return ts;
  }
}
</script>
