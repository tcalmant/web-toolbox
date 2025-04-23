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
  <q-page class="q-pa-md">
    <h2>À propos</h2>

    <h3>Licence</h3>
    <p>
      Ce projet est distribué sous la licence
      <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank">
        Apache Software License 2.0</a
      >.
    </p>

    <h3>Dépendances</h3>

    Ce projet ne serait pas possible sans les bibliothèques et outils suivants:
    <ul>
      <li>
        <a href="https://quasar.dev" target="_blank">Quasar Framework</a> - Licence
        <a href="https://github.com/quasarframework/quasar/blob/dev/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://vuejs.org" target="_blank">Vue.js 3</a> - Licence
        <a href="https://github.com/vuejs/core/blob/main/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://router.vuejs.org" target="_blank">Vue Router</a> - Licence
        <a href="https://github.com/vuejs/router/blob/main/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://pinia.vuejs.org" target="_blank">Pinia</a> - Licence
        <a href="https://github.com/vuejs/pinia/blob/v3/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://vue-i18n.intlify.dev/" target="_blank">Vue I18n</a> - Licence
        <a href="https://github.com/intlify/vue-i18n/blob/master/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://leafletjs.com/" target="_blank">Leaflet</a> - Licence
        <a href="https://github.com/Leaflet/Leaflet/blob/main/LICENSE" target="_blank"
          >BSD 2-Clause</a
        >
      </li>
      <li>
        <a href="https://gentooboontoo.github.io/js-quantities/" target="_blank">js-quantities</a> -
        Licence
        <a href="https://github.com/gentooboontoo/js-quantities/blob/master/LICENSE" target="_blank"
          >MIT</a
        >
      </li>
    </ul>

    <h3>Sources de données</h3>
    <ul>
      <li>
        <strong>OpenStreetMap</strong> - &copy; les contributeurs OpenStreetMap, sous licence
        <a href="https://www.openstreetmap.org/copyright" target="_blank">ODbL</a>.
      </li>
      <li>
        <strong>Cartes IGN</strong> (dont la carte OACI) - Données fournies par l'<a
          href="https://www.ign.fr/"
          >Institut Géographique National</a
        >. Les cartes OACI sont soumises à une licence spécifique, se référer aux
        <a href="https://geoservices.ign.fr/cgu-licences" target="_blank">conditions de licences</a>
        de l'IGN.
      </li>
    </ul>

    <h3>Vie privée</h3>
    <p>
      Aucune donnée personnelle n'est transmise au serveur. Toutes les informations de navigation et
      de configuration sont stockées localement dans le navigateur de l'utilisateur.
    </p>
    <p>
      Ce fonctionnement garantit un respect total de la vie privée : aucune collecte, aucun suivi,
      aucune analyse à distance.
    </p>
  </q-page>
</template>

<script lang="ts" setup>
// Nothing here: static page
</script>

<style scoped>
ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>
