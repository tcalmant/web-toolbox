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
  <div class="q-pa-md full-width">
    <q-select
      v-model="locale"
      :options="localeOptions"
      :label="t('languageSwitch')"
      dense
      emit-value
      map-options
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import * as appI18n from 'src/i18n'

const { t, locale } = useI18n({ useScope: 'global' })

class LocaleInfo {
  label: string
  value: string
  flag: string | undefined

  constructor(label: string, languageId: string, flag?: string) {
    this.label = label
    this.value = languageId
    this.flag = flag
  }
}

const localeOptions = Object.entries(appI18n.default)
  .map(([key, value]) => new LocaleInfo(value['languageName'] ?? key, key))
  .sort((a, b) => a.value.localeCompare(b.value))
</script>
