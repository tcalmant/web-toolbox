/*
 *   Copyright (c) 2025 Thomas Calmant
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

export default {
  // Language description
  languageName: 'English',
  languageSwitch: 'Display language',

  // Main layout
  mainTitle: "Tom's Toolbox",
  notamMapperTitle: 'NOTAM mapper',
  fuelComputerTitle: 'Fuel computer',
  timestampTitle: 'Timestamp',

  // Common ARIA-related sentences
  toggleSelectAll: 'Toggle table selection',

  // Drawer
  aviationLinks: 'Aviation links',
  siaLinkSubtitle: 'French source for SUP-AIP and VAC',
  sofiaLinkSubtitle: 'NOTAM and flight plans',
  aerowebLinkSubtitle: 'Weather from Météo France',
  projectLinks: 'Project Links',
  reportLink: 'Report issues',
  reportLinkSubtitle: 'Tell me if something goes wrong',
  srcLink: 'Source code',

  // NOTAM Mapper
  notamEntriesLabel: 'NOTAM entries',
  notamEditLabel: 'Set NOTAM',
  notamEditTitle: 'Set NOTAM content',
  notamFilterLarge: 'Ignore large NOTAM',
  notamFilterLargeSliderAria: 'Maximum radius of shown NOTAM (in nautical miles)',
  notamFilterLocated: 'Only show NOTAM with located items',
  notamFilterShowArea: 'Show area of influence',
  notamLimitLow: 'Lower limit',
  notamLimitHigh: 'Higher limit',
  notamRadius: 'Radius (NM)',
  notamTrafic: 'Trafic',
  notamObject: 'Object',
  notamScope: 'Scope',
  toggleSelectNotam: 'Toggle selection of NOTAM {notam}',
  aipEntriesLabel: 'AIP entries',
  aipEditLabel: 'Set AIP',
  aipEditTitle: 'Set AIP content',
  notamTabMapTitle: 'Map',
  notamTabConfigurationTitle: 'Options',

  // Fuel Computer
  immatriculationLabel: 'Immatriculation',
  immatriculationHint: 'Immatriculation of the airplane',
  fuelConsumptionLabel: 'Fuel consumption',
  fuelConsumptionHint: 'Fuel consumption per hour ({perMinutes} {fuelUnit}/min)',
  fuelCapacityLabel: 'Fuel capacity',
  fuelCapacityHint: 'Total fuel capacity',
  fuelConsumableLabel: 'Consumable fuel',
  fuelConsumableHint: 'Total consumable fuel',
  tablesPrintOption: 'Print tables',
  tableTimeTitle: 'Flight times',
  tableTimeTotal: '@:resultTotalTime',
  tableFuelTitle: 'Added fuel',
  tableFuelTotal: 'Total added fuel',
  resultTotalTime: 'Total flight time',
  resultTotalFuelConsumed: 'Total consumed fuel',
  resultTotalFuelAdded: 'Total added fuel',
  resultEstimatedFuel: 'Estimated remaining fuel',
  resultEstimatedUsableFuel: 'Estimated usable fuel',
  resultEstimatedRemainingTime: 'Estimated remaining flight time',

  liter: 'liters',
  us_gal: 'US Gal',
  imp_gal: 'imp Gal',

  // Timestamp
  unixLabel: 'Unix Timestamp',
  unixPrecisionLabel: 'Precision',
  autoPrecisionLabel: 'Auto ({subUnit})',
  utcLabel: 'Date (UTC)',
  utcHint: 'UTC date',
  localDateLabel: 'Local date',
  localDateHint: 'Date in {tzName}: UTC {utcOffset}',
  timezoneLabel: 'Timezone',

  // Common-ish
  confirmTitle: 'Confirm',
  confirmDeleteAllMessage: 'Delete all entries?',
}
