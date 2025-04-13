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
  <q-item
    clickable
    tag="a"
    :target="!link || link?.startsWith('#') ? '_self' : '_blank'"
    :href="link"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ shownTitle }}</q-item-label>
      <q-item-label caption>{{ shownCaption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface EssentialLinkProps {
  id: string
  title?: string
  titleKey?: string
  caption?: string
  captionKey?: string
  link?: string
  icon?: string
}

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
})

const shownTitle = computed(() => (props.titleKey ? t(props.titleKey) || props.title : props.title))

const shownCaption = computed(() =>
  props.captionKey ? (t(props.captionKey) ?? props.caption) : props.caption,
)
</script>
