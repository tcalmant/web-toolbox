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
  <div class="print-hide">
    <q-drawer v-model="drawerOpen" bordered overlay>
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
  </div>
</template>

<script setup lang="ts">
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'
import LanguageSwitcher from 'src/components/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const drawerOpen = defineModel<boolean | null>({ default: null })

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
    id: 'about',
    titleKey: 'aboutTitle',
    icon: 'info',
    link: '#/about',
  },
  {
    id: 'help',
    titleKey: 'helpTitle',
    icon: 'help',
    link: '#/help',
  },
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
</script>
