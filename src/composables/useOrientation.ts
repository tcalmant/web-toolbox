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

import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Tracks whether the window is currently taller than it is wide.
 */
export function useOrientation() {
  const isPortrait = ref(window.innerHeight > window.innerWidth)

  const updateOrientation = () => {
    isPortrait.value = window.innerHeight > window.innerWidth
  }

  onMounted(() => window.addEventListener('resize', updateOrientation))
  onUnmounted(() => window.removeEventListener('resize', updateOrientation))

  return { isPortrait }
}
