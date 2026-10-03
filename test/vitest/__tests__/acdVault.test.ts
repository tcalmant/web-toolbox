/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/time.ts
 * Tests for composables/useAcdVault.ts (state machine of the ACD vault)
 */

// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { encryptVault } from '../../../src/adapters/crypto/vaultCrypto'
import { createAcdVault } from '../../../src/composables/useAcdVault'
import type { AcdPayload } from '../../../src/domain/acdVault'
import type { VaultKeyStore } from '../../../src/domain/ports/vaultKeyStore'

const PAYLOAD: AcdPayload = {
  planes: {
    'F-TEST': {
      brand: 'Robin',
      model: 'DR400 120',
      fuel: { capacity: 110, consumable: 109, hourlyConsumption: 25, unit: 'liters' },
    },
  },
  checklists: { 'model/DR400 120.xml': '<checklist id="model"/>' },
}

class MemoryKeyStore implements VaultKeyStore {
  key: CryptoKey | null = null
  saves = 0

  async load() {
    return this.key
  }

  async save(key: CryptoKey) {
    this.key = key
    this.saves++
  }

  async clear() {
    this.key = null
  }
}

const bundleFor = (passphrase: string, salt?: string) =>
  encryptVault(PAYLOAD, passphrase, { iterations: 1000, ...(salt ? { salt } : {}) })

describe('createAcdVault', () => {
  it('is absent when the build has no vault', async () => {
    const vault = createAcdVault({ bundle: null, keyStore: new MemoryKeyStore() })
    expect(vault.status.value).toBe('absent')
    await vault.restore()
    expect(vault.status.value).toBe('absent')
    expect(await vault.unlock('anything', true)).toBe('corrupt')
  })

  it('starts restoring, then locked without a remembered key', async () => {
    const vault = createAcdVault({
      bundle: await bundleFor('pass'),
      keyStore: new MemoryKeyStore(),
    })
    expect(vault.status.value).toBe('restoring')
    await vault.restore()
    expect(vault.status.value).toBe('locked')
    expect(vault.payload.value).toBeNull()
  })

  it('refuses a wrong passphrase and stays locked', async () => {
    const vault = createAcdVault({
      bundle: await bundleFor('pass'),
      keyStore: new MemoryKeyStore(),
    })
    await vault.restore()
    expect(await vault.unlock('nope', true)).toBe('wrong-passphrase')
    expect(vault.status.value).toBe('locked')
    expect(vault.payload.value).toBeNull()
  })

  it('unlocks with the right passphrase and remembers the key on request', async () => {
    const keyStore = new MemoryKeyStore()
    const vault = createAcdVault({ bundle: await bundleFor('pass'), keyStore })
    await vault.restore()
    vault.dialogOpen.value = true
    expect(await vault.unlock('pass', true)).toBe('ok')
    expect(vault.status.value).toBe('unlocked')
    expect(vault.isUnlocked.value).toBe(true)
    expect(vault.payload.value).toEqual(PAYLOAD)
    expect(vault.dialogOpen.value).toBe(false)
    expect(keyStore.saves).toBe(1)
  })

  it('does not remember the key unless asked, and forgets an older one', async () => {
    const keyStore = new MemoryKeyStore()
    const vault = createAcdVault({ bundle: await bundleFor('pass'), keyStore })
    await vault.restore()
    expect(await vault.unlock('pass', false)).toBe('ok')
    expect(keyStore.key).toBeNull()
  })

  it('unlocks silently on the next visit with the remembered key', async () => {
    const keyStore = new MemoryKeyStore()
    const bundle = await bundleFor('pass')
    const first = createAcdVault({ bundle, keyStore })
    await first.restore()
    await first.unlock('pass', true)

    const second = createAcdVault({ bundle, keyStore })
    await second.restore()
    expect(second.status.value).toBe('unlocked')
    expect(second.payload.value).toEqual(PAYLOAD)
  })

  it('keeps a remembered key valid when the content is re-encrypted with the same salt', async () => {
    const keyStore = new MemoryKeyStore()
    const bundle = await bundleFor('pass')
    const first = createAcdVault({ bundle, keyStore })
    await first.restore()
    await first.unlock('pass', true)

    const updated = await bundleFor('pass', bundle.salt)
    const second = createAcdVault({ bundle: updated, keyStore })
    await second.restore()
    expect(second.status.value).toBe('unlocked')
  })

  it('drops a remembered key that no longer fits (new passphrase) and asks again', async () => {
    const keyStore = new MemoryKeyStore()
    const first = createAcdVault({ bundle: await bundleFor('old pass'), keyStore })
    await first.restore()
    await first.unlock('old pass', true)

    const second = createAcdVault({ bundle: await bundleFor('new pass'), keyStore })
    await second.restore()
    expect(second.status.value).toBe('locked')
    expect(keyStore.key).toBeNull()
  })

  it('locks: forgets the data and the remembered key', async () => {
    const keyStore = new MemoryKeyStore()
    const vault = createAcdVault({ bundle: await bundleFor('pass'), keyStore })
    await vault.restore()
    await vault.unlock('pass', true)
    await vault.lock()
    expect(vault.status.value).toBe('locked')
    expect(vault.payload.value).toBeNull()
    expect(keyStore.key).toBeNull()
  })
})
