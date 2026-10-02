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
  <q-dialog v-model="showDialog" maximized>
    <q-card class="column no-wrap">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h5">{{ $t('importTitle') }}</div>
          <div class="q-gutter-md">
            <q-btn
              v-if="canPaste"
              icon="content_paste"
              color="primary"
              dense
              round
              unelevated
              :aria-label="$t('notamPasteLabel')"
              @click.prevent="pasteFromClipboard"
            >
              <q-tooltip>{{ $t('notamPasteLabel') }}</q-tooltip>
            </q-btn>
            <q-btn
              icon="delete"
              color="negative"
              dense
              round
              unelevated
              :aria-label="$t('importClearAria')"
              @click.prevent="inputText = ''"
            />
            <q-btn
              icon="close"
              color="dark"
              dense
              round
              unelevated
              :aria-label="$t('importCloseAria')"
              v-close-popup
            />
          </div>
        </div>
        <div class="text-caption q-mt-sm">{{ $t('importHint') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-file
          v-model="pdfFiles"
          multiple
          filled
          accept=".pdf,application/pdf"
          :label="$t('importPdfLabel')"
          :hint="$t('importPdfHint')"
          :loading="loadingPdf"
          :disable="loadingPdf"
          clearable
          @update:model-value="onFilesPicked"
        >
          <template v-slot:prepend>
            <q-icon name="picture_as_pdf" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-section class="col scroll">
        <q-input
          v-model="inputText"
          :label="$t('importTextLabel')"
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
import { extractPdfText } from '@/adapters/pdf/pdfTextExtractor'
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const inputText = defineModel<string | undefined>()
const showDialog = defineModel<boolean>('show-dialog', { default: false })

// The async clipboard API only exists in secure contexts
const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText

async function pasteFromClipboard(): Promise<void> {
  try {
    inputText.value = await navigator.clipboard.readText()
  } catch {
    $q.notify({ type: 'warning', message: t('notamPasteFailed') })
  }
}

const pdfFiles = ref<File[] | null>(null)
const loadingPdf = ref(false)

async function onFilesPicked(files: File[] | null) {
  if (!files || files.length == 0) {
    return
  }

  loadingPdf.value = true
  try {
    for (const file of files) {
      try {
        const text = await extractPdfText(await file.arrayBuffer())
        // The source line also separates the file from what is already there
        const block = `${file.name}\n${text}`
        inputText.value = inputText.value ? `${inputText.value}\n\n${block}` : block
      } catch (error) {
        console.error('Failed to read PDF %s', file.name, error)
        $q.notify({ type: 'negative', message: t('importPdfError', { name: file.name }) })
      }
    }
  } finally {
    loadingPdf.value = false
    // Content is now in the text area: forget the files so they can be picked again
    pdfFiles.value = null
  }
}
</script>
