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
  <div id="map" class="fit"></div>
</template>

<script setup lang="ts">
import type { Layer } from 'leaflet'
import L, { FeatureGroup, type LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { nextTick, onMounted, ref, watch } from 'vue'
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

watch(mapRef, (map) => {
  if (map !== undefined && layerRef.value !== undefined) {
    layerRef.value.addTo(map)
    if (layerRef.value.getLayers().length != 0) {
      map.fitBounds(layerRef.value.getBounds(), { maxZoom: 12 })
    }
  }
})

watch(layerRef, (layers) => {
  if (mapRef.value !== undefined && layers !== undefined) {
    layers.addTo(mapRef.value)
    if (layers.getLayers().length != 0) {
      mapRef.value.fitBounds(layers.getBounds(), { maxZoom: 12 })
    }
  }
})

const initMap = () => {
  const map = L.map('map', {
    center: props.center,
    zoom: props.zoom,
  })

  const baseLayers = {
    'IGN Plan': L.tileLayer(
      'https://data.geopf.fr/wmts?' +
      '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0' +
      '&STYLE=normal' +
      '&TILEMATRIXSET=PM' +
      '&FORMAT=image/png' +
      '&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2' +
      '&TILEMATRIX={z}' +
      '&TILEROW={y}' +
      '&TILECOL={x}',
      {
        minZoom: 0,
        maxZoom: 18,
        attribution: 'IGN-F/Geoportail',
        tileSize: 256,
      },
    ),
    'IGN Photo': L.tileLayer(
      'https://data.geopf.fr/wmts?' +
      '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0' +
      '&STYLE=normal' +
      '&TILEMATRIXSET=PM' +
      '&FORMAT=image/jpeg' +
      '&LAYER=ORTHOIMAGERY.ORTHOPHOTOS' +
      '&TILEMATRIX={z}' +
      '&TILEROW={y}' +
      '&TILECOL={x}',
      {
        minZoom: 0,
        maxZoom: 18,
        attribution: 'IGN-F/Geoportail',
        tileSize: 256,
      },
    ),
    OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),
  }

  L.control.layers(baseLayers, {}).addTo(map)
  Object.values(baseLayers)[2]?.addTo(map)

  mapRef.value = map
  layerRef.value?.addTo(map)
}

function setNOTAMs(notams: NOTAM[]) {
  layerRef.value?.remove()

  const groupLayer = new FeatureGroup()

  groupLayer.setStyle({
    fillColor: 'red',
    fillOpacity: 0.75,
  })

  for (const notam of notams) {
    let layer: Layer | null = null
    if (notam.polygons !== null && notam.polygons.length > 0) {
      // Draw a polygon
      const group = (layer = new FeatureGroup())
      if (notam.center !== null && notam.radiusNM !== null) {
        group.addLayer(L.circle(notam.center, { radius: notam.radiusNM * 1852, stroke: false, fillOpacity: 0.25 }))
      }
      notam.polygons.forEach(l => group.addLayer(l))
    } else if (notam.center !== null && notam.radiusNM !== null) {
      // Draw a circle (convert radius in meters)
      layer = L.circle(notam.center, { radius: notam.radiusNM * 1852, fillOpacity: 0.5 })
    }

    if (layer !== null) {
      layer.on('click', () => {
        layer
          .bindPopup(`<p class="mapViewNotamContent">${notam.text}</p>`, {
            minWidth: 400,
            maxWidth: 600,
          })
          .openPopup()
      })
      groupLayer.addLayer(layer)
    }
  }

  layerRef.value = groupLayer
}
defineExpose({ setNOTAMs })
</script>

<style lang="css">
.mapViewNotamContent {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  white-space: pre-line;
}
</style>
