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
 * Encrypts and decrypts the ACD data vault (the aeroclub's aircraft and
 * checklists), which is what the app ships instead of the plaintext.
 *
 *   npm run vault:encrypt   private/acd/  ->  src/fixed-data/acd.vault.json
 *   npm run vault:decrypt   src/fixed-data/acd.vault.json  ->  private/acd/
 *
 * The plaintext lives in private/acd/ (git-ignored):
 *   planes.json                     the aircraft, by registration
 *   checklists/model/<model>.xml    one file per aircraft model
 *   checklists/plane/<tail>.xml     optional per-aircraft additions
 *
 * The passphrase is read from ACD_VAULT_PASSPHRASE, or typed (hidden) when the
 * variable is not set. Run with Node 24 (TypeScript is stripped natively).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'
import { Writable } from 'node:stream'

import {
  decryptVault,
  deriveBundleKey,
  encryptVault,
  VaultError,
} from '../src/adapters/crypto/vaultCrypto.ts'
import { isAcdPayload, isVaultBundle, type AcdPayload } from '../src/domain/acdVault.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PRIVATE_DIR = join(ROOT, 'private', 'acd')
const VAULT_FILE = join(ROOT, 'src', 'fixed-data', 'acd.vault.json')

function fail(message: string): never {
  console.error(`error: ${message}`)
  process.exit(1)
}

/**
 * Reads a line without ever echoing it. The prompt is written by hand and the
 * readline interface gets a muted output: readline redraws the whole line
 * (prompt and typed text) on backspace, arrows or paste, so filtering its
 * output would leak the passphrase.
 */
function askHidden(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const muted = new Writable({ write: (_chunk, _encoding, done) => done() })
    const rl = createInterface({ input: process.stdin, output: muted, terminal: true })
    process.stdout.write(prompt)
    rl.question('', (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

async function readPassphrase(confirm: boolean): Promise<string> {
  const fromEnv = process.env['ACD_VAULT_PASSPHRASE']
  if (fromEnv) return fromEnv
  if (!process.stdin.isTTY) {
    fail('no terminal: set ACD_VAULT_PASSPHRASE')
  }
  const passphrase = await askHidden('Passphrase: ')
  if (passphrase.length === 0) {
    fail('the passphrase is empty')
  }
  if (confirm && passphrase.length < 12) {
    // Not an error: the vault only has to stay out of casual reach
    console.warn(
      'warning: a short passphrase keeps out casual access only, the vault file is public and can be attacked offline',
    )
  }
  if (confirm && (await askHidden('Again: ')) !== passphrase) {
    fail('the two passphrases differ')
  }
  return passphrase
}

function listFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) files.push(...listFiles(path))
    else files.push(path)
  }
  return files.sort()
}

function readPlaintext(): AcdPayload {
  const planesFile = join(PRIVATE_DIR, 'planes.json')
  if (!existsSync(planesFile)) fail(`${relative(ROOT, planesFile)} not found`)
  const planes: unknown = JSON.parse(readFileSync(planesFile, 'utf8'))

  const checklists: Record<string, string> = {}
  const checklistsDir = join(PRIVATE_DIR, 'checklists')
  if (existsSync(checklistsDir)) {
    for (const file of listFiles(checklistsDir)) {
      if (!file.endsWith('.xml')) continue
      checklists[relative(checklistsDir, file).split(sep).join('/')] = readFileSync(file, 'utf8')
    }
  }
  const payload = { planes, checklists }
  if (!isAcdPayload(payload)) fail('planes.json is not a registration to aircraft object')
  return payload as AcdPayload
}

async function encrypt(): Promise<void> {
  const payload = readPlaintext()
  const passphrase = await readPassphrase(true)

  // Same passphrase as the current vault: keep its salt, so that the devices
  // which remembered the unlock keep working after an update of the content
  let salt: string | undefined
  let iterations: number | undefined
  if (existsSync(VAULT_FILE)) {
    const previous: unknown = JSON.parse(readFileSync(VAULT_FILE, 'utf8'))
    if (isVaultBundle(previous)) {
      try {
        await decryptVault(previous, await deriveBundleKey(passphrase, previous))
        salt = previous.salt
        iterations = previous.iterations
        console.log('Same passphrase as the current vault: unlocked devices stay unlocked.')
      } catch (error) {
        if (!(error instanceof VaultError)) throw error
        console.log('New passphrase: every device will have to unlock again.')
      }
    }
  }

  const bundle = await encryptVault(payload, passphrase, {
    ...(salt ? { salt } : {}),
    ...(iterations ? { iterations } : {}),
  })
  mkdirSync(dirname(VAULT_FILE), { recursive: true })
  writeFileSync(VAULT_FILE, `${JSON.stringify(bundle, null, 2)}\n`)
  console.log(
    `${Object.keys(payload.planes).length} aircraft and ${Object.keys(payload.checklists).length} checklist files written to ${relative(ROOT, VAULT_FILE)}`,
  )
}

async function decrypt(): Promise<void> {
  if (!existsSync(VAULT_FILE)) fail(`${relative(ROOT, VAULT_FILE)} not found`)
  const bundle: unknown = JSON.parse(readFileSync(VAULT_FILE, 'utf8'))
  if (!isVaultBundle(bundle)) fail('not a vault file')
  const passphrase = await readPassphrase(false)
  let payload: AcdPayload
  try {
    payload = await decryptVault(bundle, await deriveBundleKey(passphrase, bundle))
  } catch {
    fail('wrong passphrase, or damaged vault')
  }

  mkdirSync(PRIVATE_DIR, { recursive: true })
  writeFileSync(join(PRIVATE_DIR, 'planes.json'), `${JSON.stringify(payload.planes, null, 2)}\n`)
  for (const [path, xml] of Object.entries(payload.checklists)) {
    const target = join(PRIVATE_DIR, 'checklists', ...path.split('/'))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, xml)
  }
  console.log(`Plaintext written to ${relative(ROOT, PRIVATE_DIR)}/`)
}

const command = process.argv[2]
if (command === 'encrypt') await encrypt()
else if (command === 'decrypt') await decrypt()
else fail('usage: vault.ts encrypt|decrypt')
