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
 * Service worker of the offline app (workbox InjectManifest mode).
 * - the app shell and every bundled file (including the encrypted ACD vault)
 *   are precached, the hash router means every route is served by index.html
 * - map tiles are cached as they are viewed, within a bounded budget
 */

import { clientsClaim } from 'workbox-core'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & typeof globalThis

// A new version takes over as soon as it is installed: the page tells the user
// (see register-sw.ts) and the next load uses it
void self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

if (import.meta.env.QUASAR_PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(import.meta.env.QUASAR_PWA_FALLBACK_HTML), {
      denylist: [new RegExp(import.meta.env.QUASAR_PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  )
}

// Hosts of the map layers (see components/MapView.vue)
const TILE_HOSTS = ['data.geopf.fr', 'tile.openstreetmap.org', /^[abc]\.tile\.opentopomap\.org$/]

// Tiles are only cached where the user looked, never prefetched, which is what
// the tile servers' usage policies ask for. The budget keeps the storage bounded.
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' &&
    TILE_HOSTS.some((host) =>
      typeof host === 'string' ? url.hostname === host : host.test(url.hostname),
    ),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      // 0 is an opaque response: tiles are loaded without CORS
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 600,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
)
