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

import type { TileCache } from '@/domain/ports/tileCache'

// Name of the runtime cache of src-pwa/sw/custom-sw.ts
const CACHE_NAME = 'map-tiles'

/** Matches the tile URLs of a template: each placeholder stands for one URL component. */
export function tileUrlPattern(template: string): RegExp {
  const parts = template
    .split(/\{[^}]+\}/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`^${parts.join('[^/?&]*')}$`)
}

/** The tile cache filled by the service worker (Cache API, shared with the page). */
export class ServiceWorkerTileCache implements TileCache {
  async forget(urlTemplates: readonly string[]): Promise<void> {
    // No Cache API outside secure contexts, and nothing to forget without the service worker
    if (urlTemplates.length === 0 || typeof caches === 'undefined') {
      return
    }
    if (!(await caches.has(CACHE_NAME))) {
      return
    }
    const patterns = urlTemplates.map(tileUrlPattern)
    const cache = await caches.open(CACHE_NAME)
    for (const request of await cache.keys()) {
      if (patterns.some((pattern) => pattern.test(request.url))) {
        await cache.delete(request)
      }
    }
  }
}
