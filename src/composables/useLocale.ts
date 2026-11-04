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

import { LocalStorage, useQuasar, type QuasarLanguage } from 'quasar'
import { useI18n } from 'vue-i18n'
import { matchLocale } from '@/domain/stringUtils'
import messages from '@/i18n'

const LOCALE_KEY = 'app.locale'
const DEFAULT_LOCALE = 'en-US'

// Only the packs of the app locales: the other Quasar packs are neither bundled nor precached
const quasarPacks = import.meta.glob<{ default: QuasarLanguage }>(
  '../../node_modules/quasar/lang/{en-US,fr}.js',
)

/** The app language: vue-i18n messages and the Quasar pack, kept together and remembered. */
export function useLocale() {
  const $q = useQuasar()
  const { locale } = useI18n({ useScope: 'global' })

  async function setLocale(tag: string, remember = true): Promise<void> {
    locale.value = tag
    if (remember) {
      LocalStorage.set(LOCALE_KEY, tag)
    }
    const packTag = matchLocale(
      tag,
      Object.keys(quasarPacks).map((path) => path.replace(/^.*\/(.+)\.js$/, '$1')),
    )
    const pack = quasarPacks[`../../node_modules/quasar/lang/${packTag}.js`]
    if (pack) {
      try {
        $q.lang.set((await pack()).default)
      } catch {
        console.error('Error loading Quasar language pack for %s', tag)
      }
    }
  }

  /** The remembered choice, else the browser language, else English. */
  function initLocale(): Promise<void> {
    const saved = LocalStorage.getItem<string>(LOCALE_KEY)
    const available = Object.keys(messages)
    if (saved && available.includes(saved)) {
      return setLocale(saved)
    }
    const detected = matchLocale($q.lang.getLocale() ?? DEFAULT_LOCALE, available)
    // Not remembered: a later change of the browser language must still apply
    return setLocale(detected ?? DEFAULT_LOCALE, false)
  }

  return { locale, setLocale, initLocale }
}
