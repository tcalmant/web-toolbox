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

import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

/**
 * Shared "confirm before a destructive action" dialog, used by every
 * "delete all" / "clear all" button across the app. Returns the same
 * chainable dialog object as `$q.dialog(...)`, so callers attach their own
 * `.onOk()`/`.onDismiss()` handlers.
 */
export function useConfirmDialog() {
  const $q = useQuasar()
  const { t } = useI18n()

  function confirmDialog(message: string) {
    return $q.dialog({
      title: t('confirmTitle'),
      message,
      cancel: true,
      persistent: false,
    })
  }

  return { confirmDialog }
}
