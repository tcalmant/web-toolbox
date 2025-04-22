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
  <q-dialog v-model="showDialog" maximized>
    <q-card>
      <q-card-section>
        <div class="row justify-between">
          <div class="text-h5">{{ title }}</div>
          <div class="q-gutter-md">
            <q-btn
              icon="delete"
              color="negative"
              dense
              round
              unelevated
              @click.prevent="inputText = ''"
            />
            <q-btn
              icon="close"
              color="dark"
              dense
              round
              unelevated
              @click.prevent="emit('close')"
              v-close-popup
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section style="max-height: 90vh" class="scroll">
        <q-input
          v-model="inputText"
          :label="inputLabel"
          filled
          type="textarea"
          autofocus
          autogrow
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  inputLabel?: string | undefined
}>()

const inputText = defineModel<string | undefined>()
const showDialog = defineModel<boolean>('show-dialog', { default: false })
const emit = defineEmits(['close'])
</script>
