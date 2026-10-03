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

        <q-toolbar-title> {{ $t('mainTitle') }} </q-toolbar-title>

        <nav v-if="$q.screen.gt.sm" :aria-label="$t('toolsLinks')" style="max-width: 66vw">
          <q-tabs outside-arrows mobile-arrows>
            <q-route-tab
              v-for="tool in tools"
              :key="tool.to"
              :label="$t(tool.titleKey)"
              :to="tool.to"
              exact
            />
          </q-tabs>
        </nav>
      </q-toolbar>
    </q-header>

    <q-drawer class="print-hide" v-model="leftDrawerOpen" bordered overlay>
      <q-list v-if="$q.screen.lt.md" role="navigation" :aria-label="t('toolsLinks')">
        <q-item-label header> {{ t('toolsLinks') }} </q-item-label>
        <q-item
          v-for="tool in tools"
          :key="tool.to"
          clickable
          :to="tool.to"
          exact
          @click="leftDrawerOpen = false"
        >
          <q-item-section>{{ t(tool.titleKey) }}</q-item-section>
        </q-item>
      </q-list>
      <q-list>
        <q-item-label header> {{ t('aviationLinks') }} </q-item-label>
        <EssentialLink v-for="link in aviationLinks" :key="link.id" v-bind="link" />
      </q-list>
      <q-list>
        <q-item-label header> {{ t('projectLinks') }} </q-item-label>
        <EssentialLink v-for="link in projectLinks" :key="link.id" v-bind="link" />
      </q-list>

      <LanguageSwitcher style="position: absolute; bottom: 0" />
    </q-drawer>

    <q-page-container>
      <h1 class="sr-only">{{ pageTitle }}</h1>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import EssentialLink, { type EssentialLinkProps } from '@/components/EssentialLink.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { usePageMetadata } from '@/composables/usePageMetadata'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { pageTitle } = usePageMetadata()

const tools = [
  { to: '/notam-mapper', titleKey: 'notamMapperTitle' },
  { to: '/fuel-computer', titleKey: 'fuelComputerTitle' },
  { to: '/timestamp', titleKey: 'timestampTitle' },
  { to: '/weather', titleKey: 'weatherTitle' },
  { to: '/checklist', titleKey: 'checklistTitle' },
]

const aviationLinks: EssentialLinkProps[] = [
  {
    id: 'sia',
    title: "Service de l'Information Aéronautique",
    captionKey: 'siaLinkSubtitle',
    icon: 'info',
    link: 'https://www.sia.aviation-civile.gouv.fr/',
  },
  {
    id: 'sofia',
    title: 'Sofia Briefing',
    captionKey: 'sofiaLinkSubtitle',
    icon: 'timer',
    link: 'https://sofia-briefing.aviation-civile.gouv.fr/',
  },
  {
    id: 'aeroweb',
    title: 'AeroWeb',
    captionKey: 'aerowebLinkSubtitle',
    icon: 'cloud',
    link: 'https://aviation.meteo.fr/',
  },
]

const projectLinks: EssentialLinkProps[] = [
  {
    id: 'bugReport',
    titleKey: 'reportLink',
    captionKey: 'reportLinkSubtitle',
    icon: 'feedback',
    link: 'https://github.com/tcalmant/web-toolbox/issues',
  },
  {
    id: 'src',
    titleKey: 'srcLink',
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
