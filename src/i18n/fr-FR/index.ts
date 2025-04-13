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
  languageName: 'Français',
  languageSwitch: "Langue d'affichage",
  // Main layout
  mainTitle: "Tom's Toolbox",
  notamMapperTitle: 'Carte NOTAM',
  fuelComputerTitle: 'Carburant',
  timestampTitle: 'Dates',

  // Drawer
  aviationLinks: 'Aviation',
  siaLinkSubtitle: 'SUP-AIP et VAC en France',
  sofiaLinkSubtitle: 'NOTAM et plans de vol',
  aerowebLinkSubtitle: 'Météo aéronautique par Météo France',
  projectLinks: 'Projet',
  reportLink: 'Rapport de bug',
  reportLinkSubtitle: 'Dites moi si quelque chose ne va pas',
  srcLink: 'Code source',

  // NOTAM Mapper
  notamEntriesLabel: 'NOTAM à analyser',
  notamEditLabel: 'Éditer les NOTAM',
  notamFilterLarge: 'Ignorer les NOTAM étendus',
  notamFilterLocated: "N'afficher que les NOTAM avec description d'objet(s)",
  notamFilterShowArea: "Afficher la zone d'influence",
  notamLimitLow: 'Plancher',
  notamLimitHigh: 'Plafond',
  notamRadius: 'Rayon (NM)',
  notamTrafic: 'Traffic',
  notamObject: 'Objet',
  notamScope: 'Périmètre',
  aipEntriesLabel: 'AIP à analyser',

  // Fuel Computer
  immatriculationLabel: 'Immatriculation',
  immatriculationHint: "Immatriculation de l'avion",
  fuelConsumptionLabel: 'Consommation de carburant',
  fuelConsumptionHint: 'Consommation horaire ({perMinutes} {fuelUnit}/minute)',
  fuelCapacityLabel: 'Capacité réservoir(s)',
  fuelCapacityHint: 'Capacité totale de tous les réservoirs',
  fuelConsumableLabel: 'Carburant consommable',
  fuelConsumableHint: 'Total du carburant consommable de tous les réservoirs',
  tablesPrintOption: 'Imprimer les tables',
  tableTimeTitle: 'Temps de vol',
  tableTimeTotal: '@:resultTotalTime',
  tableFuelTitle: 'Avitaillement carburant',
  tableFuelTotal: '@:resultTotalFuelAdded',
  resultTotalTime: 'Temps de vol total',
  resultTotalFuelConsumed: 'Carburant consommé',
  resultTotalFuelAdded: 'Carburant ajouté',
  resultEstimatedFuel: 'Carburant restant estimé',
  resultEstimatedUsableFuel: 'Carburant restant utilisable estimé',
  resultEstimatedRemainingTime: 'Temps de vol restant estimé',

  liter: 'litres',
  us_gal: 'gal US',
  imp_gal: 'gal GB',

  // Timestamp
  unixLabel: 'Temps Unix',
  unixPrecisionLabel: 'Précision',
  autoPrecisionLabel: 'Automatique ({subUnit})',
  utcLabel: 'Date UTC',
  utcHint: 'Date au Temps Universel Coordonné',
  localDateLabel: 'Date locale',
  localDateHint: 'Date dans le fuseau horaire {tzName}: UTC {utcOffset}',
  timezoneLabel: 'Fuseau horaire',

  // Common-ish
  confirmTitle: 'Confirmer',
  confirmDeleteAllMessage: 'Supprimer toutes les entrées ?',
}
