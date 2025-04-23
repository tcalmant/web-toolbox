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
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> {{ $t('mainTitle') }} </q-toolbar-title>

        <q-tabs outside-arrows mobile-arrows style="max-width: 66vw">
          <q-route-tab :label="$t('notamMapperTitle')" to="/notam-mapper" exact />
          <q-route-tab :label="$t('fuelComputerTitle')" to="/fuel-computer" exact />
          <q-route-tab :label="$t('timestampTitle')" to="/timestamp" exact />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <MainDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MainDrawer from 'src/components/MainDrawer.vue'
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
</script>
