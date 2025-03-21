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
  <div id="map" class="fit">Map</div>
</template>

<script setup lang="ts">
import L, { FeatureGroup, type LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { nextTick, onMounted, ref } from 'vue'
import { type NOTAM } from './notamUtils'

export interface MapProps {
  center?: LatLngTuple
  zoom?: number
}

const props = withDefaults(defineProps<MapProps>(), {
  center: () => [46.45, 2.21],
  zoom: 6,
})

const mapRef = ref<L.Map>()
const layerRef = ref<FeatureGroup>()

onMounted(() => nextTick(initMap))

const initMap = () => {
  const map = L.map('map', {
    center: props.center,
    zoom: props.zoom,
  })
  mapRef.value = map

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)

  layerRef.value?.addTo(map)
}

function setNOTAMs(notams: NOTAM[]) {
  const map = mapRef.value
  if (map == null) {
    return
  }

  layerRef.value?.remove()

  const layer = new FeatureGroup()

  for (const notam of notams) {
    if (notam.polygon !== null) {
      // Draw a polygon
    } else if (notam.center !== null && notam.radiusNM !== null) {
      // Draw a circle (convert radius in meters)
      layer.addLayer(L.circle(notam.center, { radius: notam.radiusNM * 1852 }))
    }
  }

  layerRef.value = layer
  layer.addTo(map)
  map.fitBounds(layer.getBounds(), { maxZoom: 11 })
}
defineExpose({ setNOTAMs })
</script>
