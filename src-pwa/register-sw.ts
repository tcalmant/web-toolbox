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

import { Notify } from 'quasar'
import { register } from 'register-service-worker'

import messages from '@/i18n'

type Locale = keyof typeof messages

function t(key: 'pwaUpdateMessage' | 'pwaReloadLabel' | 'pwaOfflineReady'): string {
  const lang = document.documentElement.lang
  const locale: Locale = lang in messages ? (lang as Locale) : 'en-US'
  return messages[locale][key]
}

register(import.meta.env.QUASAR_SERVICE_WORKER_FILE, {
  cached() {
    Notify.create({ message: t('pwaOfflineReady'), timeout: 4000, type: 'positive' })
  },

  updated(registration) {
    // The new version is installed and waits: it only takes over, and the page
    // only reloads, when the user accepts, so the running code never loses its chunks
    Notify.create({
      message: t('pwaUpdateMessage'),
      timeout: 0,
      actions: [
        {
          label: t('pwaReloadLabel'),
          color: 'white',
          handler: () => {
            navigator.serviceWorker.addEventListener(
              'controllerchange',
              () => window.location.reload(),
              { once: true },
            )
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
          },
        },
      ],
    })
  },

  error(error) {
    console.error('Error during service worker registration:', error)
  },
})
