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

import { computed, ref, shallowRef } from 'vue'

import { acdVaultBundle } from '@/adapters/data/acdVaultBundle'
import { decryptVault, deriveBundleKey, VaultError } from '@/adapters/crypto/vaultCrypto'
import { IndexedDbVaultKeyStore } from '@/adapters/storage/indexedDbVaultKeyStore'
import type { AcdPayload, VaultBundle } from '@/domain/acdVault'
import type { VaultKeyStore } from '@/domain/ports/vaultKeyStore'

/**
 * - absent: this build ships no vault
 * - restoring: looking for a remembered key
 * - locked: waiting for the passphrase
 * - unlocked: the data is available
 */
export type VaultStatus = 'absent' | 'restoring' | 'locked' | 'unlocked'

export type UnlockResult = 'ok' | 'wrong-passphrase' | 'corrupt'

export interface AcdVaultDeps {
  bundle: VaultBundle | null
  keyStore: VaultKeyStore
}

/** Builds the vault state. Exported for tests: the app uses {@link useAcdVault}. */
export function createAcdVault({ bundle, keyStore }: AcdVaultDeps) {
  const status = ref<VaultStatus>(bundle ? 'restoring' : 'absent')
  const payload = shallowRef<AcdPayload | null>(null)
  const dialogOpen = ref(false)

  async function open(key: CryptoKey): Promise<void> {
    if (!bundle) {
      throw new VaultError('corrupt', 'No vault')
    }
    payload.value = await decryptVault(bundle, key)
    status.value = 'unlocked'
  }

  /** Unlocks with the remembered key, if there is one and it still fits the vault. */
  async function restore(): Promise<void> {
    if (!bundle) {
      return
    }
    const key = await keyStore.load()
    if (key) {
      try {
        await open(key)
        return
      } catch (error) {
        // Only a key that does not fit any more (vault re-encrypted with another
        // passphrase) is stale: any other failure must not make the device forget it
        if (error instanceof VaultError && error.reason === 'wrong-key') {
          await keyStore.clear()
        }
      }
    }
    status.value = 'locked'
  }

  async function unlock(passphrase: string, remember: boolean): Promise<UnlockResult> {
    if (!bundle) {
      return 'corrupt'
    }
    try {
      const key = await deriveBundleKey(passphrase, bundle)
      await open(key)
      if (remember) {
        await keyStore.save(key)
      } else {
        await keyStore.clear()
      }
      dialogOpen.value = false
      return 'ok'
    } catch (error) {
      return error instanceof VaultError && error.reason === 'corrupt'
        ? 'corrupt'
        : 'wrong-passphrase'
    }
  }

  async function lock(): Promise<void> {
    payload.value = null
    if (bundle) {
      status.value = 'locked'
    }
    await keyStore.clear()
  }

  return {
    status,
    payload,
    dialogOpen,
    isUnlocked: computed(() => status.value === 'unlocked'),
    restore,
    unlock,
    lock,
  }
}

export type AcdVault = ReturnType<typeof createAcdVault>

let shared: AcdVault | undefined

/** The app-wide vault: one state shared by every page. */
export function useAcdVault(): AcdVault {
  shared ??= createAcdVault({ bundle: acdVaultBundle, keyStore: new IndexedDbVaultKeyStore() })
  return shared
}
