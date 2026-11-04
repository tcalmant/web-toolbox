<!--
Copyright (c) 2026 Thomas Calmant
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
  <q-dialog v-model="open" :persistent="!acknowledged">
    <q-card style="width: min(32rem, 92vw)">
      <q-card-section>
        <div class="text-h6">{{ $t('noticeTitle') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <p>{{ $t('noticeGeneral') }}</p>
        <p>{{ $t('noticeNotam') }}</p>
        <p class="q-mb-none">{{ $t('noticeChecklist') }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('noticeAcknowledge')" @click="acknowledge" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { LocalStorage } from 'quasar'
import { onMounted, ref } from 'vue'

// Bump when the wording changes in substance, so that everyone reads it again
const NOTICE_VERSION = 1
const NOTICE_KEY = 'notice.acknowledgedVersion'

const open = defineModel<boolean>({ required: true })

const acknowledged = ref(LocalStorage.getItem<number>(NOTICE_KEY) === NOTICE_VERSION)
onMounted(() => {
  if (!acknowledged.value) {
    open.value = true
  }
})

function acknowledge() {
  LocalStorage.set(NOTICE_KEY, NOTICE_VERSION)
  acknowledged.value = true
  open.value = false
}
</script>
