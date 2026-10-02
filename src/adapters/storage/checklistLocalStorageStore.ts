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

import type { ChecklistStateStore } from '@/domain/ports/checklistStateStore'

/**
 * Driven adapter for {@link ChecklistStateStore}, backed by Quasar's
 * localStorage plugin ($q.localStorage), matching the JSON-string convention
 * already used for custom-plane persistence in FuelComputerPage.vue.
 */
export class ChecklistLocalStorageStore implements ChecklistStateStore {
  private readonly storage: LocalStorage

  constructor(storage: LocalStorage) {
    this.storage = storage
  }

  load(key: string): Record<string, string> {
    let raw: unknown
    try {
      raw = this.storage.getItem<string>(key)
    } catch {
      // Storage blocked or unavailable: behave as if nothing was saved.
      return {}
    }
    if (typeof raw !== 'string' || !raw) {
      return {}
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {}
    }
    // Stored data is untrusted: keep only string values of a plain object, and
    // drop "__proto__" so Object.assign() on the caller's side cannot reparent it.
    const state: Record<string, string> = {}
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [id, value] of Object.entries(parsed)) {
        if (typeof value === 'string' && id !== '__proto__') {
          state[id] = value
        }
      }
    }
    return state
  }

  save(key: string, state: Record<string, string>): void {
    try {
      this.storage.setItem(key, JSON.stringify(state))
    } catch {
      // Quota exceeded or storage disabled: the in-memory state stays usable.
    }
  }
}
