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
  <component :is="componentName" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n({ useScope: 'global' })

export interface I18nProps {
  componentName: string
}

const props = defineProps<I18nProps>()

const componentName = computed<string>(() => {
  const localeName = locale.value

  return defineAsyncComponent(async () => {
    let localePartialName = localeName
    let idx = localeName.length
    let component
    let tries = 0
    do {
      localePartialName = localePartialName.substring(0, idx)
      try {
        component = await import(`./i18n/${props.componentName}-${localePartialName}.vue`)
        if (component != undefined) {
          break
        }
      } catch {
        // Ignore lookup error
      }
    } while (tries++ < 10 && (idx = localePartialName.lastIndexOf('-', idx - 1)) != -1)

    // Fallback on default name
    return component != undefined ? component : await import(`./i18n/${props.componentName}.vue`)
  })
})
</script>
