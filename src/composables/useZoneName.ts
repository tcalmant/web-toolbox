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

import { zoneCity } from '@/domain/timezones'
import { useI18n } from 'vue-i18n'

/** Human readable zone names: "UTC (Zulu)" for UTC, the city otherwise. */
export function useZoneName() {
  const { t } = useI18n()

  function zoneName(zone: string): string {
    return zone === 'UTC' ? t('zoneUtcLabel') : zoneCity(zone)
  }

  return { zoneName }
}
