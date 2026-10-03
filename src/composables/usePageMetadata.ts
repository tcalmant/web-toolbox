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

import { computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

/**
 * Keeps the document language and title in line with the current locale and
 * route, and exposes the page title for the (visually hidden) page heading.
 */
export function usePageMetadata() {
  const { t, locale } = useI18n({ useScope: 'global' })
  const route = useRoute()

  const pageTitle = computed(() => {
    const key = route.meta.titleKey
    return typeof key === 'string' ? t(key) : ''
  })

  watchEffect(() => {
    document.documentElement.lang = locale.value
    const site = t('mainTitle')
    document.title = pageTitle.value ? `${pageTitle.value} - ${site}` : site
  })

  return { pageTitle }
}
