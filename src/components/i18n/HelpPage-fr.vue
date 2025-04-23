<!--
Copyright (c) 2025 Thomas Calmant
All rights reserved.

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

<template>
  <h2>{{ $t('helpTitle') }}</h2>
  <p>
    En cas de problème, n'hésitez pas à le signaler en
    <a href="https://github.com/tcalmant/web-toolbox/issues">créant un ticket sur GitHub</a>
  </p>
  <h3>{{ $t('notamMapperTitle') }}</h3>

  <h3>{{ $t('fuelComputerTitle') }}</h3>
  <div>
    <p>
      Le <strong>calculateur de carburant</strong> permet de suivre la consommation, les ajouts de
      carburant et d'estimer le carburant et le temps restants pendant le vol. Il est utile aussi
      bien pour la planification que pour les décisions en vol.
    </p>

    <h5>🔧 Champs de saisie</h5>
    <ul>
      <li><strong>Immatriculation</strong> : Identifiant de l'avion (ex. : F-XXXX).</li>
      <li><strong>Unité de carburant</strong> : Unité utilisée (ex. : litres, gallons).</li>
      <li>
        <strong>Consommation horaire</strong> : Consommation moyenne en vol (ex. : 25&nbsp;L/h).
      </li>
      <li><strong>Capacité réservoir(s)</strong> : Capacité totale des réservoirs.</li>
      <li>
        <strong>Carburant consommable</strong> : Quantité de carburant utilisable en vol (inférieure
        ou égale à la capacité maximale).
      </li>
    </ul>

    <h5>📋 Résultats affichés</h5>
    <ul>
      <li><strong>Temps de vol total</strong> : Somme des durées des vols enregistrés.</li>
      <li>
        <strong>Carburant consommé</strong> : Estimé à partir du temps de vol et la consommation
        horaire.
      </li>
      <li><strong>Carburant ajouté</strong> : Somme des avitaillements enregistrés.</li>
      <li><strong>Carburant estimé restant</strong> : Carburant ajouté moins celui consommé.</li>
      <li>
        <strong>Carburant utilisable estimé</strong> : Carburant restant moins la part non
        utilisable.
      </li>
      <li>
        <strong>Temps restant estimé</strong> : Durée de vol possible avec le carburant utilisable
        estimé.
      </li>
    </ul>

    <p>
      ⚠️ <strong>Avertissement :</strong> jaune s'il rest moins d'une heure de carburant
      utilisable.<br />
      🔴 <strong>Alerte :</strong> rouge s'il est estimé qu'il reste moins de 30 minutes de
      carburant utilisable.
    </p>

    <h5>🕒 Tableau des temps de vol</h5>
    <p>
      Enregistrez le temps bloc de chaque vol, c'est-à-dire tel qu'indiqué dans le carnet de route.
    </p>

    <h5>⛽ Tableau de carburant</h5>
    <p>
      Enregistrez les ajouts de carburant. Des entrées précises permettent des estimations plus
      fiables. Il est possible d'entrer une valeur négative si une purge a eu lieu.
    </p>
    <p>
      Chaque entrée peut avoir une unité de volume différente, afin de mieux correspondre aux
      indications de la pompe lors d'un voyage à l'étranger. En interne, tous les calculs sont
      effectués en litres.
    </p>

    <h5>🖨️ Options d'impression</h5>
    <ul>
      <li>Choisissez d'inclure ou non les tableaux dans l'impression.</li>
      <li>En affichage portrait (sur mobile) : les tableaux sont accessibles par onglets.</li>
      <li>En affichage paysage (sur ordinateur) : les tableaux s'affichent côte à côte.</li>
    </ul>

    <h5>💾 Mémoire de session</h5>
    <p>
      L'outil enregistre automatiquement vos données dans le stockage local du navigateur. À votre
      retour, les données précédentes sont restaurées.
    </p>
  </div>
  <h3>{{ $t('timestampTitle') }}</h3>
  <p>
    Ce composant permet à l'utilisateur de convertir entre eux: un timestamp Unix, une date UTC et
    une date dans un fuseau horaire au choix. Les valeurs représentent donc le même instant, sous
    des formats différents.
  </p>

  <h4>Fonctionnalités</h4>
  <ul>
    <li>
      Support de timestamps UNIX de différentes unités : nanosecondes, microsecondes, millisecondes,
      secondes.
    </li>
    <li>Détection automatique de l'unité la plus plausible.</li>
    <li>Sélection de fuseaux horaires.</li>
  </ul>

  <h4>Champ de Timestamp</h4>
  <p>Le champ de <strong>timestamp Unix</strong> est modifiable :</p>
  <ul>
    <li>Le bouton à gauche permet de le réactualiser à l'heure actuelle.</li>
    <li>
      Le menu déroulant permet de forcer ou détecter la <strong>précision</strong> du timestamp :
      <ul>
        <li>Automatique (selon la taille du timestamp)</li>
        <li>Secondes (<code>s</code>)</li>
        <li>Millisecondes (<code>ms</code>)</li>
        <li>Microsecondes (<code>µs</code>)</li>
        <li>Nanosecondes (<code>ns</code>)</li>
      </ul>
    </li>
  </ul>

  <h4>Date UTC et fuseau horaire</h4>
  <p>
    Ces champs indiquent l'heure du timestamp Unix en
    <strong>Temps Universel Coordonné (UTC)</strong> et dans le
    <strong>fuseau horaire sélectionné</strong>. Il est possible d'éditer la date et l'heure afin de
    mettre à jour le timestamp Unix.
  </p>
</template>

<script setup lang="ts">
// Static page
</script>
