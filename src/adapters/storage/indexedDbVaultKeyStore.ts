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

import type { VaultKeyStore } from '@/domain/ports/vaultKeyStore'

const DB_NAME = 'acd-vault'
const STORE_NAME = 'keys'
const KEY_NAME = 'vault-key'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB error'))
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB error'))
    })
  } finally {
    db.close()
  }
}

/**
 * Driven adapter for {@link VaultKeyStore}. A CryptoKey can be stored in
 * IndexedDB (structured clone) without ever being readable as bytes.
 * Every failure (private window, blocked storage) degrades to "nothing saved".
 */
export class IndexedDbVaultKeyStore implements VaultKeyStore {
  async load(): Promise<CryptoKey | null> {
    try {
      const value = await run<unknown>('readonly', (store) => store.get(KEY_NAME))
      return value instanceof CryptoKey ? value : null
    } catch {
      return null
    }
  }

  async save(key: CryptoKey): Promise<void> {
    try {
      await run('readwrite', (store) => store.put(key, KEY_NAME))
    } catch {
      // The vault stays unlocked for this page, it just will not be remembered
    }
  }

  async clear(): Promise<void> {
    try {
      await run('readwrite', (store) => store.delete(KEY_NAME))
    } catch {
      // Nothing to forget if the storage is unavailable
    }
  }
}
