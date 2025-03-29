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
import L, { FeatureGroup, type LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { AIP } from './aipUtils'
import type { NOTAM } from './notamUtils'

export interface MapProps {
  center?: LatLngTuple
  zoom?: number
}

const notamList = defineModel<NOTAM[] | undefined>('notam-list')
const focusedNotam = defineModel<NOTAM | undefined>('notam-focus')
const aip = defineModel<AIP | undefined>('aip')
const showAreaOfInfluence = defineModel<boolean>('showAreaOfInfluence')
const hoveredNotam = defineModel<NOTAM | undefined>('hoveredNotam')

const props = withDefaults(defineProps<MapProps>(), {
  center: () => [46.45, 2.21],
  zoom: 6,
})

const mapRef = ref<L.Map>()

onMounted(() => nextTick(initMap))

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
    OpenTopoMap: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }),
  }

  L.control.layers(baseLayers, {}).addTo(map)
  Object.values(baseLayers)[2]?.addTo(map)

  L.control.scale().addTo(map)

  mapRef.value = map
  aipLayer.value.addTo(map)
  notamLayer.value.addTo(map)
}

const aipLayer = computed<FeatureGroup>(() => {
  const groupLayer = new FeatureGroup()
  if (aip.value && aip.value.polygons) {
    aip.value.polygons.forEach((l) => groupLayer.addLayer(l))
    const aipText = aip.value.text
    groupLayer.on('click', () => {
      groupLayer
        .bindPopup(`<p class="mapViewNotamContent">${aipText}</p>`, {
          minWidth: 400,
          maxWidth: 600,
        })
        .openPopup()
    })
  }
  return groupLayer
})

watch(aipLayer, (newLayer, oldLayer) => {
  oldLayer?.remove()

  const map = mapRef.value
  if (map && newLayer) {
    newLayer.addTo(map)
  }
})

const notamLayerDict = computed<Map<string, FeatureGroup>>(() => {
  const layers = new Map<string, FeatureGroup>()
  for (const notam of notamList.value ?? []) {
    const layer: FeatureGroup = new FeatureGroup()
    const qSection = notam.sectionQ
    if (notam.polygons !== null && notam.polygons.length > 0) {
      // Draw a polygon
      if (
        showAreaOfInfluence.value &&
        qSection &&
        qSection.center !== null &&
        qSection.radiusNM !== null
      ) {
        layer.addLayer(
          L.circle(qSection.center, {
            radius: qSection.radiusNM * 1852,
            stroke: false,
            fillOpacity: 0.25,
          }),
        )
      }
      notam.polygons.forEach((l) => layer.addLayer(l))
    } else if (qSection && qSection.center !== null && qSection.radiusNM !== null) {
      // Draw a circle (convert radius in meters)
      layer.addLayer(
        L.circle(qSection.center, { radius: qSection.radiusNM * 1852, fillOpacity: 0.5 }),
      )
    }

    if (layer.getLayers().length != 0) {
      layer.on('click', () => {
        layer
          .bindPopup(`<p class="mapViewNotamContent">${notam.text}</p>`, {
            minWidth: 400,
            maxWidth: 600,
          })
          .openPopup()
        focusedNotam.value = notam
      })
      layer.on('mouseover', () => {
        if (hoveredNotam.value === undefined) {
          hoveredNotam.value = notam
        }
      })
      layer.on('mouseout', () => {
        if (notam == hoveredNotam.value) {
          hoveredNotam.value = undefined
        }
      })

      layers.set(notam.id, layer)
    }
  }

  return layers
})

const notamLayer = computed<FeatureGroup>(
  () => new FeatureGroup(Array.from(notamLayerDict.value.values())),
)

watch(notamLayer, (newLayer, oldLayer) => {
  oldLayer?.remove()

  const map = mapRef.value
  if (map && newLayer) {
    newLayer.addTo(map)
  }
})

watch([mapRef, aipLayer, notamLayer, focusedNotam], () => {
  const map = mapRef.value
  if (!map) {
    return
  }

  // Stay on the focused NOTAM
  const focused = focusedNotam.value
  if (focused) {
    const focusedLayer = notamLayerDict.value.get(focused.id)
    if (focusedLayer) {
      map.fitBounds(focusedLayer.getBounds(), { maxZoom: 18 })
      return
    }
  }

  const aipBounds = aipLayer.value.getBounds()
  const notamBounds = notamLayer.value.getBounds()

  let bounds = aipBounds
  if (notamBounds) {
    if (bounds) {
      bounds.extend(notamBounds)
    } else {
      bounds = notamBounds
    }
  }

  if (bounds && bounds.isValid()) {
    map.fitBounds(bounds, { maxZoom: 12 })
  }
})
</script>

<style lang="css">
.mapViewNotamContent {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  white-space: pre-line;
}
</style>
