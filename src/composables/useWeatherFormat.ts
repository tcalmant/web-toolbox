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

import {
  type CloudLayer,
  type Conditions,
  type DayTime,
  type Metar,
  type Wind,
  type WeatherPhenomenon,
  windSpeedKt,
} from '@/domain/metar'
import { useI18n } from 'vue-i18n'

const INTENSITY_KEYS = { '-': 'light', '+': 'heavy', VC: 'vicinity' } as const

const pad2 = (n: number) => n.toString().padStart(2, '0')

/** Human readable (translated) renderings of decoded METAR and TAF fields. */
export function useWeatherFormat() {
  const { t } = useI18n()

  function windText(wind: Wind): string {
    const kt = Math.round(windSpeedKt(wind))
    if (wind.speed === 0) {
      return t('wxCalm')
    }
    const dir = wind.directionDeg === null ? t('wxVariable') : `${wind.directionDeg}°`
    let text = t('wxWindText', { dir, speed: kt })
    if (wind.gust !== null) {
      text += `, ${t('wxWindGust', { gust: Math.round(windSpeedKt(wind, wind.gust)) })}`
    }
    return text
  }

  function visibilityText(c: Conditions): string {
    if (c.cavok) {
      return t('wxCavok')
    }
    const distance = (m: number) =>
      m >= 9999 ? t('wxVisTenKm') : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`
    const parts = [c.visibilityM === null ? '-' : distance(c.visibilityM)]
    if (c.minimumVisibility) {
      const { distanceM, direction } = c.minimumVisibility
      parts.push(t('wxVisMinimum', { vis: distance(distanceM), dir: t(`wxDir_${direction}`) }))
    }
    if (c.visibilityNdv) {
      parts.push(t('wxVisNdv'))
    }
    return parts.join(', ')
  }

  function windShearText(m: Metar): string {
    if (!m.windShear) {
      return ''
    }
    const runways = m.windShear.runways.map((runway) => t('wxWindShearRunway', { runway }))
    return [...(m.windShear.allRunways ? [t('wxWindShearAll')] : []), ...runways].join(', ')
  }

  function missingText(c: Conditions): string {
    return c.missing.map((field) => t(`wxMissing_${field}`)).join(', ')
  }

  function cloudText(layer: CloudLayer): string {
    const height = layer.heightFt === null ? '' : ` ${layer.heightFt} ft`
    const type = layer.type === null ? '' : ` ${layer.type}`
    return `${t(`wxCloud_${layer.cover}`)}${height}${type}`
  }

  function skyText(c: Conditions): string {
    if (c.cavok) {
      return ''
    }
    if (c.clouds.length > 0) {
      return c.clouds.map(cloudText).join(', ')
    }
    return c.skyClear ? t(`wxSky_${c.skyClear}`) : '-'
  }

  function weatherText(p: WeatherPhenomenon): string {
    const intensity = p.intensity === '' ? '' : t(`wxIntensity_${INTENSITY_KEYS[p.intensity]}`)
    const words = [...p.descriptors, ...p.phenomena].map((code) => t(`wx_${code}`))
    return [intensity, ...words].filter((w) => w.length > 0).join(' ')
  }

  function weatherListText(c: Conditions): string {
    if (c.weather.length > 0) {
      return c.weather.map(weatherText).join(', ')
    }
    return c.noSignificantWeather ? t('wxNsw') : ''
  }

  function recentWeatherText(m: Metar): string {
    return m.recentWeather.map(weatherText).join(', ')
  }

  function dayTimeText(dt: DayTime): string {
    return t('wxDayTime', { day: dt.day, time: `${pad2(dt.hour)}:${pad2(dt.minute)}Z` })
  }

  return {
    windText,
    visibilityText,
    skyText,
    weatherListText,
    recentWeatherText,
    windShearText,
    missingText,
    dayTimeText,
  }
}
