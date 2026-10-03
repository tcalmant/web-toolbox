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
  <q-page padding>
    <div class="column q-gutter-y-md">
      <WorldClockCard :zones="zones" :now="now" @add="add" @remove="remove" @reset="reset" />
      <TimeConverterCard :zones="zones" />
      <q-expansion-item
        class="shadow-1 overflow-hidden"
        style="border-radius: 4px"
        icon="code"
        :label="$t('unixPanelTitle')"
        :caption="$t('unixPanelCaption')"
      >
        <UnixTimestampPanel />
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import TimeConverterCard from '@/components/TimeConverterCard.vue'
import UnixTimestampPanel from '@/components/UnixTimestampPanel.vue'
import WorldClockCard from '@/components/WorldClockCard.vue'
import { useNow } from '@/composables/useNow'
import { useTimezoneList } from '@/composables/useTimezoneList'

const { zones, add, remove, reset } = useTimezoneList()
const now = useNow()
</script>
