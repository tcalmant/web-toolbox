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
 * the shared data in a cache and opens the app with share=1 in the query. The
 * data never comes through the URL, so that a plain link cannot inject text.
 */

import type { Ref } from 'vue'
import { sharedDataToText, type SharedData } from '@/domain/importedText'

let sharePending = false
let hasSharedFiles = false

/**
 * Takes the share flag out of the page URL. It must run before the router is
 * created: with a relative publicPath, the hash history takes the page path
 * and query as its base, so the query would stick to every route.
 */
export function captureShare(): void {
  if (!window.location.search) {
    return
  }

  sharePending = new URLSearchParams(window.location.search).get('share') === '1'
  // A reload must not import the same share again
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.hash,
  )
}

/**
 * Name of the cache filled by the service worker (src-pwa/sw/custom-sw.ts),
 * derived from its scope as Cache Storage is per origin. The page is served at
 * that scope, next to the worker.
 */
function sharedCacheName(): string {
  return `shared-files:${new URL('.', window.location.href).pathname}`
}

/**
 * Adds the shared text, once, after what is already imported.
 *
 * @returns True if something was shared: text, now added, or files
 */
export async function appendSharedText(inputText: Ref<string>): Promise<boolean> {
  if (!sharePending) {
    return false
  }
  sharePending = false

  const cache = await caches.open(sharedCacheName())
  let text = ''
  for (const request of await cache.keys()) {
    const response = await cache.match(request)
    if (response?.headers.has('X-File-Name')) {
      hasSharedFiles = true
    } else if (response) {
      text = sharedDataToText((await response.json()) as SharedData)
      await cache.delete(request)
    }
  }
  if (text) {
    inputText.value = inputText.value ? `${inputText.value}\n\n${text}` : text
  }
  return !!text || hasSharedFiles
}

/**
 * Takes the shared files out of their cache, once.
 */
export async function takeSharedFiles(): Promise<File[]> {
  if (!hasSharedFiles) {
    return []
  }
  hasSharedFiles = false

  const cacheName = sharedCacheName()
  const cache = await caches.open(cacheName)
  const files: File[] = []
  for (const request of await cache.keys()) {
    const response = await cache.match(request)
    const name = response?.headers.get('X-File-Name')
    if (response && name) {
      files.push(new File([await response.blob()], decodeURIComponent(name)))
    }
  }
  await caches.delete(cacheName)
  return files
}
