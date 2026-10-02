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
  checklistTitle: 'Check-list',

  // Common ARIA-related sentences
  toggleSelectAll: 'Alterner la sélection intégrale',
  addEntry: 'Ajouter une entrée',
  deleteAll: 'Tout supprimer',
  deleteRow: 'Supprimer la ligne',

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
  notamEditTitle: 'Édition des NOTAM',
  notamFilterLarge: 'Ignorer les NOTAM étendus',
  notamFilterLargeSliderAria: 'Rayon maximum des NOTAM à afficher (en milles nautiques)',
  notamFilterLocated: "N'afficher que les NOTAM avec description d'objet(s)",
  notamFilterShowArea: "Afficher la zone d'influence",
  notamLimitLow: 'Plancher',
  notamLimitHigh: 'Plafond',
  notamRadius: 'Rayon (NM)',
  notamTrafic: 'Traffic',
  notamObject: 'Objet',
  notamScope: 'Périmètre',
  toggleSelectNotam: 'Alterner la sélection du NOTAM {notam}',
  aipEntriesLabel: 'AIP à analyser',
  aipEditLabel: 'Éditer les AIP',
  aipEditTitle: 'Édition des AIP',
  notamTabMapTitle: 'Carte',
  notamTabConfigurationTitle: 'Configuration',
  supAipRefsLabel: 'Références SUP-AIP',
  supAipLang: 'fr',
  supAipRefsFallbackLink: 'lien alternatif',
  irSeraRefsLabel: 'Références IR SERA',
  searchLabel: 'Rechercher',
  searchPlaceholder: 'Tapez pour rechercher...',
  searchAriaLabel: 'Rechercher dans le tableau des NOTAM',

  // Fuel Computer
  immatriculationLabel: 'Immatriculation',
  immatriculationHint: "Immatriculation de l'avion",
  fuelUnitLabel: 'Unité',
  timelineTitle: 'Chronologie',
  eventFuel: 'Carburant',
  eventFlight: 'Vol',
  saveEntry: 'Enregistrer les modifications',
  cancelEdit: 'Annuler la modification',
  timelineEmpty:
    "Saisir le carburant au départ, puis les vols et avitaillements dans l'ordre chronologique",
  timelineLevelAfter: 'Dans les réservoirs ensuite : {level}',
  timelineOverflow: 'Ne rentre pas dans les réservoirs : le surplus est ignoré',
  timelineShortfall: 'Les réservoirs se vident pendant ce vol',
  moveUp: 'Avancer',
  moveDown: 'Reculer',
  fuelReserveLabel: 'Réserve (min)',
  fuelReserveHint: 'Autonomie minimale à conserver. Alerte en dessous du double de cette valeur',
  fuelRequiredField: 'Saisir un nombre',
  fuelConsumableTooHigh: 'Ne peut pas dépasser la capacité',
  fuelDisclaimer:
    'Aide à la préparation uniquement : elle ne remplace ni le manuel de vol, ni la vérification du carburant avant le vol, ni votre jugement.',
  deletePlane: 'Supprimer cet avion personnalisé',
  confirmDeletePlaneMessage: 'Supprimer cet avion personnalisé ?',
  editEntry: "Modifier l'entrée",
  notAvailable: 'n/d',
  minutesShort: 'min',
  untilEmpty: 'illimité',
  statusAlertReserve: 'Le carburant utilisable est sous la réserve',
  statusAlertShortfall: 'Carburant insuffisant pour ce temps de vol',
  statusWarning: 'Le carburant utilisable approche de la réserve',
  statusOk: 'Le carburant utilisable est au-dessus de la réserve',
  fuelConsumptionLabel: 'Consommation de carburant',
  fuelConsumptionHint: 'Consommation horaire ({perMinutes} {fuelUnit}/minute)',
  fuelCapacityLabel: 'Capacité réservoir(s)',
  fuelCapacityHint: 'Capacité totale de tous les réservoirs',
  fuelConsumableLabel: 'Carburant consommable',
  fuelConsumableHint: 'Total du carburant consommable de tous les réservoirs',
  tablesPrintOption: 'Imprimer les tables',
  tableTimeTitle: 'Temps de vol',
  tableTimeTotal: '@:resultTotalTime',
  timeInputLabel: '@:tableTimeTitle',
  tableFuelTitle: 'Carburant dans les réservoirs',
  tableFuelTotal: '@:resultTotalFuelAdded',
  fuelInputLabel: 'Carburant dans les réservoirs',
  fuelInputHint:
    'Carburant au départ plus avitaillements. Le total ne peut pas dépasser la capacité',
  resultTotalTime: 'Temps de vol total',
  resultTotalFuelConsumed: 'Carburant consommé',
  resultTotalFuelAdded: 'Carburant dans les réservoirs',
  resultEstimatedFuel: 'Carburant restant estimé',
  resultEstimatedUsableFuel: 'Carburant restant utilisable estimé',
  resultEstimatedRemainingTime: 'Temps de vol restant estimé',
  printEditedOn: "Date d'édition: {date}",

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

  // Checklist
  checklistPlaneLabel: 'Avion',
  checklistPlaneHint: "Sélectionnez l'avion pour charger sa check-list",
  checklistNoPlaneSelected: 'Sélectionnez un avion pour voir sa check-list',
  checklistEmergencyJumpLabel: "Check-lists d'urgence :",
  checklistClearSectionLabel: 'Vider cette section',
  checklistCollapseAllLabel: 'Tout réduire',
  checklistClearAllLabel: 'Tout vider',
  confirmClearAllChecklistMessage: 'Vider toute la check-list ?',

  // Common-ish
  confirmTitle: 'Confirmer',
  confirmDeleteAllMessage: 'Supprimer toutes les entrées ?',
  fuelExceedsCapacity: 'Le total dépasserait la capacité des réservoirs',
  fuelInvalidAmount: 'Saisir une quantité de carburant supérieure à zéro',
  invalidTime: 'Saisir une durée supérieure à zéro (h:mm)',
  invalidMinutes: 'Nombre de minutes invalide',
}
