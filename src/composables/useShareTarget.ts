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
 * Target, see share_target in src-pwa/manifest.json): the service worker opens
 * the app with the shared text in the query of the page URL, and keeps the
 * files in a cache.
 */

import type { Ref } from 'vue'
import { sharedDataToText } from '@/domain/importedText'

// Name of the cache filled by the service worker (src-pwa/sw/custom-sw.ts)
const SHARED_FILES_CACHE = 'shared-files'

let sharedText = ''
let hasSharedFiles = false

/**
 * Takes the shared data out of the page URL. It must run before the router is
 * created: with a relative publicPath, the hash history takes the page path
 * and query as its base, so the query would stick to every route.
 */
export function captureSharedText(): void {
  if (!window.location.search) {
    return
  }

  const params = new URLSearchParams(window.location.search)
  sharedText = sharedDataToText({
    title: params.get('title'),
    text: params.get('text'),
    url: params.get('url'),
  })
  hasSharedFiles = params.has('files')
  // A reload must not import the same text again
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.hash,
  )
}

/**
 * Adds the shared text, once, after what is already imported.
 *
 * @returns True if something was shared: text, now added, or files
 */
export function appendSharedText(inputText: Ref<string>): boolean {
  const text = sharedText
  sharedText = ''
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

  const cache = await caches.open(SHARED_FILES_CACHE)
  const files: File[] = []
  for (const request of await cache.keys()) {
    const response = await cache.match(request)
    const name = decodeURIComponent(new URL(request.url).pathname.split('/').pop() ?? '')
    if (response) {
      files.push(new File([await response.blob()], name))
    }
  }
  await caches.delete(SHARED_FILES_CACHE)
  return files
}
