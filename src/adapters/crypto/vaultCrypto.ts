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

/**
 * Cryptography of the ACD data vault, on top of WebCrypto (available in
 * browsers and in Node). Self-contained on purpose: the `scripts/vault.ts`
 * tool imports this file with Node's type stripping, so it only uses relative
 * imports.
 *
 * Scheme: key = PBKDF2-SHA256(passphrase, salt, iterations) used as an
 * AES-256-GCM key, over the gzipped JSON payload. The key is derived as a
 * non-extractable CryptoKey, which is what the browser keeps once unlocked.
 */

import {
  isAcdPayload,
  isVaultBundle,
  type AcdPayload,
  type VaultBundle,
} from '../../domain/acdVault.ts'

export const DEFAULT_ITERATIONS = 600_000

// Binds the ciphertext to the format version
const ASSOCIATED_DATA = new TextEncoder().encode('acd-vault-v1')

export class VaultError extends Error {
  readonly reason: 'wrong-key' | 'corrupt'

  constructor(reason: 'wrong-key' | 'corrupt', message: string) {
    super(message)
    this.name = 'VaultError'
    this.reason = reason
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function base64ToBytes(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function pipeThrough(
  data: Uint8Array<ArrayBuffer>,
  transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array<ArrayBuffer>> {
  const stream = new Blob([data]).stream().pipeThrough(transform)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Derives the (non-extractable) AES key of a passphrase for the given salt. */
export async function deriveVaultKey(
  passphrase: string,
  salt: string,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase.normalize('NFKC')),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: base64ToBytes(salt), iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Same key derivation, from the parameters stored in a bundle. */
export function deriveBundleKey(passphrase: string, bundle: VaultBundle): Promise<CryptoKey> {
  return deriveVaultKey(passphrase, bundle.salt, bundle.iterations)
}

export interface EncryptOptions {
  /** Reuse a salt (base64), so that devices already unlocked stay unlocked. */
  salt?: string
  iterations?: number
}

export async function encryptVault(
  payload: AcdPayload,
  passphrase: string,
  options: EncryptOptions = {},
): Promise<VaultBundle> {
  const salt = options.salt ?? bytesToBase64(crypto.getRandomValues(new Uint8Array(16)))
  const iterations = options.iterations ?? DEFAULT_ITERATIONS
  const key = await deriveVaultKey(passphrase, salt, iterations)
  // A fresh IV for every encryption is mandatory with AES-GCM, even with a reused key
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const compressed = await pipeThrough(
    new TextEncoder().encode(JSON.stringify(payload)),
    new CompressionStream('gzip'),
  )
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: ASSOCIATED_DATA },
    key,
    compressed,
  )
  return {
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iterations,
    salt,
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  }
}

/**
 * Decrypts a bundle with an already derived key.
 * @throws VaultError "wrong-key" when the key does not open the bundle (wrong
 * passphrase, or tampered data: AES-GCM cannot tell them apart), "corrupt"
 * when the content is not a valid payload.
 */
export async function decryptVault(bundle: VaultBundle, key: CryptoKey): Promise<AcdPayload> {
  if (!isVaultBundle(bundle)) {
    throw new VaultError('corrupt', 'Not a vault bundle')
  }
  let compressed: Uint8Array<ArrayBuffer>
  try {
    compressed = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(bundle.iv), additionalData: ASSOCIATED_DATA },
        key,
        base64ToBytes(bundle.data),
      ),
    )
  } catch {
    throw new VaultError('wrong-key', 'The key does not open the vault')
  }
  let payload: unknown
  try {
    const json = new TextDecoder().decode(
      await pipeThrough(compressed, new DecompressionStream('gzip')),
    )
    payload = JSON.parse(json)
  } catch {
    throw new VaultError('corrupt', 'The vault content is unreadable')
  }
  if (!isAcdPayload(payload)) {
    throw new VaultError('corrupt', 'The vault content has an unexpected shape')
  }
  return payload
}
