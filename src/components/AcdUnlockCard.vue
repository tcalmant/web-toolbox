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
  <q-card flat bordered>
    <q-card-section class="column q-gutter-y-md">
      <div class="row items-center no-wrap">
        <q-icon name="lock" size="sm" class="q-mr-sm" />
        <h2 class="text-h6 q-my-none">{{ $t('acdVaultTitle') }}</h2>
      </div>

      <div v-if="status === 'absent'" class="text-grey">{{ $t('acdAbsentMessage') }}</div>
      <div v-else-if="status === 'restoring'" class="row items-center text-grey">
        <q-spinner size="sm" class="q-mr-sm" />
      </div>
      <q-form
        v-else-if="status === 'locked'"
        class="column q-gutter-y-md"
        @submit.prevent="onSubmit"
      >
        <div>{{ $t('acdLockedMessage') }}</div>
        <!-- A fixed username makes the form one stable credential for a password manager -->
        <input
          class="sr-only"
          type="text"
          name="username"
          value="ACD"
          autocomplete="username"
          tabindex="-1"
          aria-hidden="true"
          readonly
        />
        <q-input
          v-model="passphrase"
          type="password"
          name="password"
          autocomplete="current-password"
          :label="$t('acdPassphraseLabel')"
          :error="error !== ''"
          :error-message="error"
          :disable="busy"
          autofocus
        />
        <q-checkbox v-model="remember" :label="$t('acdRememberLabel')" :disable="busy" />
        <div class="text-caption text-grey-7">{{ $t('acdRememberHint') }}</div>
        <div>
          <q-btn
            type="submit"
            color="primary"
            icon="lock_open"
            :label="$t('acdUnlockButton')"
            :loading="busy"
            :disable="passphrase.length === 0"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useAcdVault } from '@/composables/useAcdVault'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const vault = useAcdVault()
const status = vault.status

const passphrase = ref('')
const remember = ref(false)
const busy = ref(false)
const error = ref('')

async function onSubmit() {
  busy.value = true
  error.value = ''
  const result = await vault.unlock(passphrase.value, remember.value)
  busy.value = false
  if (result === 'ok') {
    passphrase.value = ''
  } else {
    error.value = t(result === 'corrupt' ? 'acdCorrupt' : 'acdWrongPassphrase')
  }
}
</script>
