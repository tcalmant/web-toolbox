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
    <h2>About</h2>

    <h3>License</h3>
    <p>
      This project is distributed under the
      <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank"
        >Apache Software License 2.0</a
      >.
    </p>

    <h3>Dependencies</h3>
    <ul>
      <li>
        <a href="https://quasar.dev" target="_blank">Quasar Framework</a> – License:
        <a href="https://github.com/quasarframework/quasar/blob/dev/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://vuejs.org" target="_blank">Vue.js 3</a> – License:
        <a href="https://github.com/vuejs/core/blob/main/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://router.vuejs.org" target="_blank">Vue Router</a> – License:
        <a href="https://github.com/vuejs/router/blob/main/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://pinia.vuejs.org" target="_blank">Pinia</a> – License:
        <a href="https://github.com/vuejs/pinia/blob/v3/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://vue-i18n.intlify.dev/" target="_blank">Vue I18n</a> – License:
        <a href="https://github.com/intlify/vue-i18n/blob/master/LICENSE" target="_blank">MIT</a>
      </li>
      <li>
        <a href="https://leafletjs.com/" target="_blank">Leaflet</a> – License:
        <a href="https://github.com/Leaflet/Leaflet/blob/main/LICENSE" target="_blank"
          >BSD 2-Clause</a
        >
      </li>
      <li>
        <a href="https://gentooboontoo.github.io/js-quantities/" target="_blank">js-quantities</a> -
        License:
        <a href="https://github.com/gentooboontoo/js-quantities/blob/master/LICENSE" target="_blank"
          >MIT</a
        >
      </li>
    </ul>

    <h3>Data Sources</h3>
    <ul>
      <li>
        <strong>OpenStreetMap</strong> – &copy; OpenStreetMap contributors, licensed under the
        <a href="https://www.openstreetmap.org/copyright" target="_blank">ODbL</a>.
      </li>
      <li>
        <strong>IGN Maps</strong> (including the OACI chart) – Data provided by the
        <a href="https://www.ign.fr/" target="_blank">French National Geographic Institute (IGN)</a
        >. The OACI charts are subject to a specific license; please refer to
        <a href="https://geoservices.ign.fr/cgu-licences" target="_blank">IGN’s licensing terms</a>.
      </li>
    </ul>

    <h3>Privacy</h3>
    <p>
      No personal data is ever sent to a server. All configuration and navigation data is stored
      locally in the user's browser.
    </p>
    <p>
      This design ensures full respect for user privacy: no tracking, no collection, no remote
      analysis.
    </p>
  </q-page>
</template>

<script lang="ts" setup>
// No script needed for this static page
</script>

<style scoped>
ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>
