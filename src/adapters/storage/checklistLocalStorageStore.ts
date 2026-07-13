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
    const raw = this.storage.getItem<string>(key)
    if (!raw) {
      return {}
    }
    try {
      return JSON.parse(raw) as Record<string, string>
    } catch {
      return {}
    }
  }

  save(key: string, state: Record<string, string>): void {
    this.storage.setItem(key, JSON.stringify(state))
  }
}
