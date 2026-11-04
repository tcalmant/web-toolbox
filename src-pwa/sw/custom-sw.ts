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

// A new version waits until the user accepts it (see register-sw.ts): swapping
// the precache under a page that is still running the old code would make its
// lazy-loaded chunks vanish. clientsClaim only matters for the very first install.
clientsClaim()

self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | null)?.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

if (import.meta.env.QUASAR_PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(import.meta.env.QUASAR_PWA_FALLBACK_HTML), {
      denylist: [new RegExp(import.meta.env.QUASAR_PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  )
}

// Shares from other apps are posted to the share_target action of manifest.json.
// Only the service worker can read a POST: it keeps the shared data for the app
// (see composables/shareTarget.ts) and redirects to it. Any page can post here
// too, so nothing goes through the URL and only a few PDF files are kept. Such
// a post cannot be told from a real share by Sec-Fetch-Site or Origin: Fetch
// adds them after the service worker (in HTTP-network-or-cache fetch), so the
// app only imports a share once the user confirms it.
const SHARE_MAX_FILES = 10
const SHARE_MAX_SIZE = 50 * 1024 * 1024
registerRoute(
  ({ url }) => url.href === new URL('share-target', self.registration.scope).href,
  async ({ request }) => {
    const target = new URL(self.registration.scope)
    // Cache Storage is per origin, not per scope: the same name is derived
    // from the page path in composables/shareTarget.ts
    const cacheName = `shared-files:${target.pathname}`
    try {
      const data = await request.formData()
      await caches.delete(cacheName)
      const cache = await caches.open(cacheName)

      // A one-time id in the URL and in the cache: a crafted ?share link
      // cannot import what an earlier share left behind
      const id = crypto.randomUUID()
      const shared = Object.fromEntries(
        ['title', 'text', 'url'].map((name) => {
          const value = data.get(name)
          return [name, typeof value === 'string' ? value : null]
        }),
      )
      shared.id = id
      await cache.put(new URL('share/text', target), new Response(JSON.stringify(shared)))

      const files = data
        .getAll('files')
        .filter(
          (file) =>
            file instanceof File &&
            (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) &&
            file.size <= SHARE_MAX_SIZE,
        )
        .slice(0, SHARE_MAX_FILES) as File[]
      for (const [index, file] of files.entries()) {
        // Keyed by index: a name like ".." would be normalised away in a URL
        await cache.put(
          new URL(`share/file/${index}`, target),
          new Response(file, { headers: { 'X-File-Name': encodeURIComponent(file.name) } }),
        )
      }
      target.searchParams.set('share', id)
    } catch (error) {
      // Not a form post: open the app anyway rather than a network error page
      console.error('Invalid share', error)
      // Nothing half written is left for the app
      await caches.delete(cacheName)
    }
    return Response.redirect(target.href, 303)
  },
  'POST',
)

// Hosts of the map layers (see components/MapView.vue)
const TILE_HOSTS = ['data.geopf.fr', 'tile.openstreetmap.org', /^[abc]\.tile\.opentopomap\.org$/]

// Tiles are only cached where the user looked, never prefetched, which is what
// the tile servers' usage policies ask for. The budget keeps the storage bounded.
// The map requests tiles with CORS (crossOrigin in MapView.vue) so that the
// responses are readable: only real 200 tiles are stored, never an error or an
// opaque response (whose size counts for megabytes against the storage quota).
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' &&
    request.mode === 'cors' &&
    TILE_HOSTS.some((host) =>
      typeof host === 'string' ? url.hostname === host : host.test(url.hostname),
    ),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 600,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
)
