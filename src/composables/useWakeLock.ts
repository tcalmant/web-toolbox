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

import { onMounted, onUnmounted, watch, type Ref } from 'vue'

/** Keeps the screen on while the component is mounted and `enabled` is true. */
export function useWakeLock(enabled: Ref<boolean>) {
  let sentinel: WakeLockSentinel | null = null
  let mounted = false

  async function acquire() {
    if (!mounted || !enabled.value || sentinel || document.visibilityState !== 'visible') {
      return
    }
    try {
      const lock = await navigator.wakeLock.request('screen')
      // Unmounted or switched off while the request was pending
      if (!mounted || !enabled.value || sentinel) {
        void lock.release()
        return
      }
      sentinel = lock
      // The browser releases it by itself when the page gets hidden
      lock.addEventListener('release', () => {
        if (sentinel === lock) {
          sentinel = null
        }
      })
    } catch {
      // Unsupported or refused (battery saver, permissions policy): the screen just sleeps
    }
  }

  function release() {
    void sentinel?.release()
    sentinel = null
  }

  function onVisibilityChange() {
    void acquire()
  }

  watch(enabled, (on) => (on ? void acquire() : release()))

  onMounted(() => {
    mounted = true
    document.addEventListener('visibilitychange', onVisibilityChange)
    void acquire()
  })
  onUnmounted(() => {
    mounted = false
    document.removeEventListener('visibilitychange', onVisibilityChange)
    release()
  })
}
