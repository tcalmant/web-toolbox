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
  <q-dialog v-model="open">
    <div class="acd-dialog">
      <q-btn
        v-close-popup
        class="acd-dialog-close"
        flat
        round
        dense
        icon="close"
        :aria-label="$t('closeLabel')"
      />
      <AcdUnlockCard />
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import AcdUnlockCard from '@/components/AcdUnlockCard.vue'
import { useAcdVault } from '@/composables/useAcdVault'

const open = useAcdVault().dialogOpen
</script>

<style scoped>
.acd-dialog {
  position: relative;
  width: min(28rem, 92vw);
  background: white;
}

.acd-dialog-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}
</style>
