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

import { isVaultBundle, type VaultBundle } from '@/domain/acdVault'

// Optional on purpose: a checkout without the vault file still builds, the app
// then simply has no ACD data.
const modules = import.meta.glob<unknown>('../../fixed-data/acd.vault.json', {
  eager: true,
  import: 'default',
})

const candidate = Object.values(modules)[0]

/** The encrypted ACD data shipped with the app, if any. */
export const acdVaultBundle: VaultBundle | null = isVaultBundle(candidate) ? candidate : null
