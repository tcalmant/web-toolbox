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

/*
 * Text and PDF files shared from another app to the installed app (Web Share
 * Target, see share_target in src-pwa/manifest.json): the service worker keeps
 * the shared data in a cache and opens the app with a one-time share id in the
 * query. The data never comes through the URL, so that a plain link cannot
 * inject text, and any page can post to the share target: the import dialog
 * only imports it once the user confirms.
 */

import { sharedDataToText, type SharedData } from '@/domain/importedText'

/** What was shared, waiting for the user to import it */
export interface SharedImport {
  text: string
  files: File[]
}

let shareId: string | null = null

/** Cache Storage is per origin: the cache is named after the app scope */
function shareCacheName(): string {
  return `shared-files:${new URL('.', window.location.href).pathname}`
}

/**
 * Takes the share id out of the page URL. It must run before the router is
 * created: with a relative publicPath, the hash history takes the page path
 * and query as its base, so the query would stick to every route.
 */
export function captureShare(): void {
  shareId = new URLSearchParams(window.location.search).get('share')
  if (!shareId) {
    // A share never opened, or posted by another site, must not stay in storage
    // (async, so that a missing Cache Storage only logs an error)
    void (async () => caches.delete(shareCacheName()))().catch((error: unknown) =>
      console.error('Cannot delete the shared files', error),
    )
  }
  if (!window.location.search) {
    return
  }

  // A reload must not import the same share again
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.hash,
  )
}

/**
 * Takes what was shared out of the cache filled by the service worker
 * (src-pwa/sw/custom-sw.ts), once. The cache is named after its scope as Cache
 * Storage is per origin, and the page is served at that scope.
 *
 * @returns The shared text and files, or null if nothing matches the share id
 */
export async function takeShare(): Promise<SharedImport | null> {
  const id = shareId
  shareId = null
  const cacheName = shareCacheName()
  // Opening a cache creates it
  if (!id || !(await caches.has(cacheName))) {
    return null
  }

  const cache = await caches.open(cacheName)
  let matches = false
  const share: SharedImport = { text: '', files: [] }
  try {
    for (const request of await cache.keys()) {
      const response = await cache.match(request)
      const name = response?.headers.get('X-File-Name')
      if (response && name) {
        share.files.push(new File([await response.blob()], decodeURIComponent(name)))
      } else if (response) {
        const shared = (await response.json()) as SharedData & { id?: string }
        matches = shared.id === id
        share.text = sharedDataToText(shared)
      }
    }
  } finally {
    // A share is read only once, even when it is not the one asked for
    await caches.delete(cacheName)
  }
  return matches && (share.text || share.files.length) ? share : null
}
