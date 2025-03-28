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
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="print-hide">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Tom's toolbox </q-toolbar-title>

        <q-tabs>
          <q-route-tab label="NOTAM mapper" to="/notam-mapper" exact />
          <q-route-tab label="Fuel computer" to="/fuel-computer" exact />
          <q-route-tab label="Timestamp" to="/timestamp" exact />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-drawer class="print-hide" v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Aviation links </q-item-label>
        <EssentialLink v-for="link in aviationLinks" :key="link.title" v-bind="link" />
      </q-list>
      <q-list>
        <q-item-label header> Project links </q-item-label>
        <EssentialLink v-for="link in projectLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'
import { ref } from 'vue'

const aviationLinks: EssentialLinkProps[] = [
  {
    title: "Service de l'Information Aéronautique",
    caption: 'Source for SUP-AIP and VAC',
    icon: 'info',
    link: 'https://www.sia.aviation-civile.gouv.fr/',
  },
  {
    title: 'Sofia Briefing',
    caption: 'NOTAM and flight plans',
    icon: 'timer',
    link: 'https://sofia-briefing.aviation-civile.gouv.fr/',
  },
  {
    title: 'AeroWeb',
    caption: 'Weather from Météo France',
    icon: 'cloud',
    link: 'https://aviation.meteo.fr/',
  },
]

const projectLinks: EssentialLinkProps[] = [
  {
    title: 'Report issues',
    caption: 'Tell me if something is wrong',
    icon: 'feedback',
    link: 'https://github.com/tcalmant/web-toolbox/issues',
  },
  {
    title: 'Source code',
    caption: 'github.com/tcalmant/web-toolbox',
    icon: 'code',
    link: 'https://github.com/tcalmant/web-toolbox',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
