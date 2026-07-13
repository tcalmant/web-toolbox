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

import type { QInput } from 'quasar'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useConfirmDialog } from '@/composables/useConfirmDialog'

export interface UseDeletableListOptions<T> {
  values: Ref<T[] | undefined>
  inputField: Ref<QInput | undefined>
  recompute: (values: T[]) => void
}

/**
 * Shared "delete one entry" / "delete all entries (with confirmation)"
 * behavior for the fuel and flight-time input lists.
 */
export function useDeletableList<T>({ values, inputField, recompute }: UseDeletableListOptions<T>) {
  const { confirmDialog } = useConfirmDialog()
  const { t } = useI18n()

  function onDelete(idx: number) {
    const currentValues = values.value ?? []
    const newValues = [...currentValues.slice(0, idx), ...currentValues.slice(idx + 1)]
    recompute(newValues)
  }

  function onDeleteAll() {
    const currentValues = values.value ?? []
    if (currentValues.length > 1) {
      confirmDialog(t('confirmDeleteAllMessage'))
        .onOk(() => {
          recompute([])
        })
        .onDismiss(() => {
          inputField.value?.focus()
          inputField.value?.select()
        })
    } else {
      recompute([])
      inputField.value?.focus()
      inputField.value?.select()
    }
  }

  return { onDelete, onDeleteAll }
}
