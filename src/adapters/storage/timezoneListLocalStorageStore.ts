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

import type { LocalStorage } from 'quasar'

import { isValidTimeZone } from '@/domain/timezones'
import type { TimezoneListStore } from '@/domain/ports/timezoneListStore'

/** Driven adapter for {@link TimezoneListStore}, backed by Quasar's localStorage plugin. */
export class TimezoneListLocalStorageStore implements TimezoneListStore {
  private readonly storage: LocalStorage
  private readonly key: string

  constructor(storage: LocalStorage, key = 'timezoneList') {
    this.storage = storage
    this.key = key
  }

  load(): string[] | null {
    let raw: unknown
    try {
      raw = this.storage.getItem<string>(this.key)
    } catch {
      // Storage blocked or unavailable: behave as if nothing was saved.
      return null
    }
    if (typeof raw !== 'string' || !raw) {
      return null
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return null
    }
    if (!Array.isArray(parsed)) {
      return null
    }
    // Stored data is untrusted: keep only valid, distinct zone names
    const zones: string[] = []
    for (const value of parsed) {
      if (typeof value === 'string' && isValidTimeZone(value) && !zones.includes(value)) {
        zones.push(value)
      }
    }
    return zones
  }

  save(zones: string[]): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(zones))
    } catch {
      // Quota exceeded or storage disabled: the in-memory list stays usable.
    }
  }
}
