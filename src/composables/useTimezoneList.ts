/*
 *   Copyright (c) 2026 Thomas Calmant
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { ref } from 'vue'
import { useQuasar } from 'quasar'

import { TimezoneListLocalStorageStore } from '@/adapters/storage/timezoneListLocalStorageStore'
import { isValidTimeZone, localTimeZone } from '@/domain/timezones'

/**
 * The user's list of time zones, persisted across visits. Starts with UTC and
 * the browser's own zone.
 */
export function useTimezoneList() {
  const $q = useQuasar()
  const store = new TimezoneListLocalStorageStore($q.localStorage)

  const defaults = ['UTC']
  const local = localTimeZone()
  if (isValidTimeZone(local) && local !== 'UTC') {
    defaults.push(local)
  }

  const saved = store.load()
  const zones = ref<string[]>(saved ?? defaults)

  function persist() {
    store.save(zones.value)
  }

  function add(zone: string) {
    if (isValidTimeZone(zone) && !zones.value.includes(zone)) {
      zones.value = [...zones.value, zone]
      persist()
    }
  }

  function remove(zone: string) {
    zones.value = zones.value.filter((z) => z !== zone)
    persist()
  }

  function reset() {
    zones.value = [...defaults]
    persist()
  }

  return { zones, add, remove, reset }
}
