/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for domain/time.ts
 * Tests for adapters/crypto/vaultCrypto.ts
 */

// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  base64ToBytes,
  bytesToBase64,
  decryptVault,
  deriveBundleKey,
  encryptVault,
  VaultError,
} from '../../../src/adapters/crypto/vaultCrypto'
import { isVaultBundle, type AcdPayload } from '../../../src/domain/acdVault'

const PAYLOAD: AcdPayload = {
  planes: {
    'F-TEST': {
      brand: 'Robin',
      model: 'DR400 120',
      fuel: { capacity: 110, consumable: 109, hourlyConsumption: 25, unit: 'liters' },
    },
  },
  checklists: {
    'model/DR400 120.xml': '<checklist id="model"><section id="s" title="é"/></checklist>',
  },
}

// Few iterations: the derivation is the slow part and is not what is tested here
const FAST = { iterations: 1000 }

describe('base64 helpers', () => {
  it('round-trips arbitrary bytes, including large buffers', () => {
    const bytes = new Uint8Array(100_000).map((_, i) => (i * 31) % 256)
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes)
  })
})

describe('vault encryption', () => {
  it('round-trips a payload with the right passphrase', async () => {
    const bundle = await encryptVault(PAYLOAD, 'correct horse', FAST)
    expect(isVaultBundle(bundle)).toBe(true)
    const key = await deriveBundleKey('correct horse', bundle)
    expect(await decryptVault(bundle, key)).toEqual(PAYLOAD)
  })

  it('does not contain the plaintext', async () => {
    const bundle = await encryptVault(PAYLOAD, 'correct horse', FAST)
    const text = JSON.stringify(bundle)
    expect(text).not.toContain('DR400')
    expect(text).not.toContain('F-TEST')
    expect(atob(bundle.data)).not.toContain('DR400')
  })

  it('rejects a wrong passphrase as wrong-key', async () => {
    const bundle = await encryptVault(PAYLOAD, 'correct horse', FAST)
    const key = await deriveBundleKey('wrong horse', bundle)
    await expect(decryptVault(bundle, key)).rejects.toMatchObject({
      name: 'VaultError',
      reason: 'wrong-key',
    })
  })

  it('rejects tampered data and a tampered IV', async () => {
    const bundle = await encryptVault(PAYLOAD, 'correct horse', FAST)
    const key = await deriveBundleKey('correct horse', bundle)
    const data = base64ToBytes(bundle.data)
    data[data.length >> 1] = (data[data.length >> 1] ?? 0) ^ 0xff
    await expect(
      decryptVault({ ...bundle, data: bytesToBase64(data) }, key),
    ).rejects.toBeInstanceOf(VaultError)
    const iv = base64ToBytes(bundle.iv)
    iv[0] = (iv[0] ?? 0) ^ 0x01
    await expect(decryptVault({ ...bundle, iv: bytesToBase64(iv) }, key)).rejects.toBeInstanceOf(
      VaultError,
    )
  })

  it('uses a fresh IV every time and a fresh salt unless one is given', async () => {
    const a = await encryptVault(PAYLOAD, 'p', FAST)
    const b = await encryptVault(PAYLOAD, 'p', FAST)
    expect(a.iv).not.toBe(b.iv)
    expect(a.salt).not.toBe(b.salt)
    const c = await encryptVault(PAYLOAD, 'p', { ...FAST, salt: a.salt })
    expect(c.salt).toBe(a.salt)
    expect(c.iv).not.toBe(a.iv)
    // Same salt: a key derived for the first bundle opens the second one
    const key = await deriveBundleKey('p', a)
    expect(await decryptVault(c, key)).toEqual(PAYLOAD)
  })

  it('derives a non-extractable key', async () => {
    const bundle = await encryptVault(PAYLOAD, 'p', FAST)
    const key = await deriveBundleKey('p', bundle)
    expect(key.extractable).toBe(false)
    await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow()
  })

  it('normalises the passphrase (composed and decomposed accents are the same)', async () => {
    const bundle = await encryptVault(PAYLOAD, 'café', FAST)
    const key = await deriveBundleKey('café', bundle)
    expect(await decryptVault(bundle, key)).toEqual(PAYLOAD)
  })

  it('reports a payload of the wrong shape as corrupt', async () => {
    const bundle = await encryptVault(
      { planes: [], checklists: {} } as unknown as AcdPayload,
      'p',
      FAST,
    )
    const key = await deriveBundleKey('p', bundle)
    await expect(decryptVault(bundle, key)).rejects.toMatchObject({ reason: 'corrupt' })
  })

  it('rejects a plane record with a missing or malformed field as corrupt', async () => {
    const bad = (planes: unknown) =>
      encryptVault({ planes, checklists: {} } as unknown as AcdPayload, 'p', FAST)
    const record = PAYLOAD.planes['F-TEST']!
    for (const planes of [
      { X: { ...record, fuel: undefined } },
      { X: { ...record, fuel: { ...record.fuel, unit: 3 } } },
      { X: { ...record, fuel: { ...record.fuel, capacity: '110' } } },
      { X: { ...record, fuel: { ...record.fuel, hourlyConsumption: NaN } } },
      { X: { ...record, model: undefined } },
      { X: null },
    ]) {
      const bundle = await bad(planes)
      const key = await deriveBundleKey('p', bundle)
      await expect(decryptVault(bundle, key)).rejects.toMatchObject({ reason: 'corrupt' })
    }
  })

  it('refuses something that is not a bundle', async () => {
    const bundle = await encryptVault(PAYLOAD, 'p', FAST)
    const key = await deriveBundleKey('p', bundle)
    await expect(decryptVault({ nope: 1 } as never, key)).rejects.toMatchObject({
      reason: 'corrupt',
    })
  })
})
