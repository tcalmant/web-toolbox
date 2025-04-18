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
  <div id="map" ref="mapDiv" class="fit">
    <q-resize-observer @resize="mapRef?.invalidateSize()" />
  </div>
</template>

<script setup lang="ts">
import L, { FeatureGroup, type LatLngTuple, type TileLayerOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuasar } from 'quasar'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { AIP } from './aipUtils'
import type { NOTAM } from './notamUtils'

const $q = useQuasar()

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
  center: () => [45.218, 5.848],
  zoom: 10,
})

const mapDiv = ref()
const mapRef = ref<L.Map>()

onMounted(() => nextTick(initMap))

const initMap = () => {
  if (mapRef.value != undefined) {
    // Clean up existing map
    mapRef.value.remove()
    mapRef.value = undefined
  }

  const map = L.map('map', {
    center: props.center,
    zoom: props.zoom,
  })

  const baseLayers: { [key: string]: L.Layer } = {
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
        bounds: L.latLngBounds(L.latLng(-85, -179.9), L.latLng(85, 179.9)),
        minZoom: 0,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.geoportail.gouv.fr/">IGN-F/Geoportail</a>',
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
        bounds: L.latLngBounds(L.latLng(-80, -180), L.latLng(80, 180)),
        minZoom: 0,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.geoportail.gouv.fr/">IGN-F/Geoportail</a>',
        tileSize: 256,
      },
    ),
    'IGN OACI-VFR 2025': L.tileLayer(
      'https://data.geopf.fr/private/wmts?SERVICE=WMTS' +
        '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0' +
        '&apikey=ign_scan_ws' +
        '&STYLE=normal' +
        '&TILEMATRIXSET=PM' +
        '&FORMAT=image/jpeg' +
        '&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI' +
        '&TILEMATRIX={z}' +
        '&TILEROW={y}' +
        '&TILECOL={x}',
      {
        bounds: L.latLngBounds(L.latLng(40.3893, -5.99644), L.latLng(51.4441, 11.146)),
        minZoom: 6,
        maxZoom: 11,
        attribution:
          '&copy; <a href="https://geoservices.ign.fr/">IGN</a> - 2025. <a href="https://geoservices.ign.fr/cgu-licences">Copie et reproduction interdite.</a>',
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

  L.control.layers(baseLayers, {}, { hideSingleBase: true }).addTo(map)

  // Use the last selected base layer
  const selectedBaseLayerName =
    ($q.sessionStorage.getItem('mapViewer.selectedBaseLayer') as string) ||
    Object.keys(baseLayers)[0]!

  const selectedBaseLayer = baseLayers[selectedBaseLayerName] ?? Object.values(baseLayers)[0]!
  selectedBaseLayer.addTo(map)

  // Register to base layer change events
  map.on('baselayerchange', (e) => $q.sessionStorage.setItem('mapViewer.selectedBaseLayer', e.name))

  L.control.scale().addTo(map)

  mapRef.value = map
  aipLayer.value.addTo(map)
  notamLayer.value.addTo(map)
}

const aipLayer = computed<FeatureGroup>(() => {
  const groupLayer = new FeatureGroup()
  if (mapRef.value && aip.value && aip.value.polygons) {
    aip.value.polygons.forEach((l) => groupLayer.addLayer(l))
  }
  return groupLayer
})

const notamLayerDict = computed<Map<string, FeatureGroup>>(() => {
  const layers = new Map<string, FeatureGroup>()

  if (!mapRef.value) {
    // Do nothing without a valid map
    return layers
  }

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

// Handle updates
watch(aipLayer, (newLayer, oldLayer) => {
  oldLayer?.remove()

  const map = mapRef.value
  if (map && newLayer) {
    newLayer.addTo(map)
    computeMapBounds()
  }
})

watch(notamLayer, (newLayer, oldLayer) => {
  oldLayer?.remove()

  const map = mapRef.value
  if (map && newLayer) {
    newLayer.addTo(map)
    computeMapBounds()
  }
})

watch([mapRef, focusedNotam], () => {
  computeMapBounds()
})

function computeMapBounds() {
  const map = mapRef.value
  if (!map) {
    return
  }

  // Compute the maximum zoom we can handle
  const maxZooms: (number | undefined)[] = []
  map.eachLayer((l) => maxZooms.push((l.options as TileLayerOptions | undefined)?.maxZoom))
  const maxZoom = Math.max(11, Math.min(...maxZooms.filter((v) => v !== undefined)))

  // Stay on the focused NOTAM
  const focused = focusedNotam.value
  if (focused) {
    const focusedLayerBounds = notamLayerDict.value.get(focused.id)?.getBounds()
    if (focusedLayerBounds && focusedLayerBounds.isValid()) {
      map.fitBounds(focusedLayerBounds, { maxZoom })
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
    map.fitBounds(bounds, { maxZoom, animate: false })
  }
}
</script>

<style lang="css">
.mapViewNotamContent {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  white-space: pre-line;
}
</style>
