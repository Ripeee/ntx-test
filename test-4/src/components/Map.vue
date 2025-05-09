<script setup>
import { ref, onMounted, computed } from 'vue'
import gql from 'graphql-tag'
import { apolloClient } from '../apollo'
import {
  VMap,
  VMapOsmTileLayer,
  VMapZoomControl,
  VMapMarker,
} from 'vue-map-ui'

const locations = ref([])
const activePopups = ref({})
const mapRef = ref(null)
const popupSize = { width: 220, height: 120 }
const formPopup = ref(null) // <-- Add this declaration


// Computed property untuk popup aktif
const sortedPopups = computed(() => {
  return Object.values(activePopups.value)
    .filter(popup => popup !== null)
    .sort((a, b) => a.location.id - b.location.id)
})

const openCustomPopup = (event, loc) => {
  if (activePopups.value[loc.id]) {
    closePopup(loc.id)
    return
  }

  const basePosition = getBasePopupPosition(event)
  const adjustedPosition = findNonOverlappingPosition(basePosition, loc.id)

  activePopups.value = {
    ...activePopups.value,
    [loc.id]: {
      location: loc,
      position: adjustedPosition,
      zIndex: 1000 + Object.keys(activePopups.value).length,
      markerPosition: [loc.latitude, loc.longitude]
    }
  }
}

// Hitung posisi konektor antara marker dan popup
const calculateConnectorPath = (popup) => {
  if (!mapRef.value) return ''
  
  const map = mapRef.value.map
  const markerPoint = map.latLngToContainerPoint(popup.markerPosition)
  const popupCenter = {
    x: popup.position.x,
    y: popup.position.y - popupSize.height / 2
  }

  // Buat garis putus-putus dari marker ke popup
  return `M ${markerPoint.x} ${markerPoint.y} L ${popupCenter.x} ${popupCenter.y}`
}

const calculateNewLocationPath = () => {
  if (!mapRef.value || !showAddForm.value) return ''

  const map = mapRef.value.map
  const markerPoint = map.latLngToContainerPoint([
    newLocation.value.latitude,
    newLocation.value.longitude
  ])

  const popupCenter = {
    x: formPosition.value.x,
    y: formPosition.value.y - popupSize.height / 2
  }

  return `M ${markerPoint.x} ${markerPoint.y} L ${popupCenter.x} ${popupCenter.y}`
}



const getBasePopupPosition = (event) => {
  return {
    x: event.originalEvent.clientX,
    y: event.originalEvent.clientY - 40
  }
}

const findNonOverlappingPosition = (basePosition, currentId) => {
  const positionsToTry = generateSpiralPositions(basePosition)
  
  for (const position of positionsToTry) {
    if (!checkOverlapWithOtherPopups(position, currentId)) {
      return position
    }
  }
  
  return {
    x: basePosition.x + 200,
    y: basePosition.y - 200
  }
}

const generateSpiralPositions = (basePosition) => {
  const positions = []
  const step = 30
  const maxAttempts = 20
  
  for (let i = 1; i <= maxAttempts; i++) {
    const ring = Math.ceil(Math.sqrt(i))
    const leg = Math.floor((i - Math.pow(ring - 1, 2)) / (ring * 2 - 1))
    
    let x = 0
    let y = 0
    
    if (leg === 0) {
      x = ring - 1
      y = (i - Math.pow(ring - 1, 2)) - (ring - 1)
    } else if (leg === 1) {
      x = (ring - 1) - (i - Math.pow(ring - 1, 2) - (ring * 2 - 1))
      y = ring - 1
    } else if (leg === 2) {
      x = -(ring - 1)
      y = (ring - 1) - (i - Math.pow(ring - 1, 2) - (ring * 4 - 3))
    } else {
      x = -(ring - 1) + (i - Math.pow(ring - 1, 2) - (ring * 6 - 5))
      y = -(ring - 1)
    }
    
    positions.push({
      x: basePosition.x + x * step,
      y: basePosition.y + y * step
    })
  }
  
  return positions
}

const checkOverlapWithOtherPopups = (position, currentId) => {
  return sortedPopups.value.some(popup => {
    if (popup.location.id === currentId) return false
    
    return (
      Math.abs(popup.position.x - position.x) < popupSize.width * 0.8 &&
      Math.abs(popup.position.y - position.y) < popupSize.height * 0.8
    )
  })
}

const updatePopupPositions = () => {
  const map = mapRef.value?.map
  if (!map) return

  Object.keys(activePopups.value).forEach(id => {
    if (activePopups.value[id]) {
      const loc = activePopups.value[id].location
      const point = map.latLngToContainerPoint([loc.latitude, loc.longitude])
      
      const newPosition = findNonOverlappingPosition(
        { x: point.x, y: point.y - 40 },
        id
      )
      
      activePopups.value[id].position = newPosition
      activePopups.value[id].markerPosition = [loc.latitude, loc.longitude]
    }
  })
}

  const newLocation = ref({
    id: 0,
    name: '',
    latitude: 0,
    longitude: 0
  })

  const showAddForm = ref(false)
  const formPosition = ref({ x: 0, y: 0 })

  const handleMapClick = (event) => {
    const latlng = event.latlng
    const clientPoint = event.originalEvent

    const nextId = locations.value.length > 0
      ? Math.max(...locations.value.map(loc => loc.id)) + 1
      : 1

    newLocation.value = {
      id: nextId,
      name: '',
      latitude: latlng.lat,
      longitude: latlng.lng
    }

    formPosition.value = {
      x: clientPoint.clientX,
      y: clientPoint.clientY - 40
    }

    showAddForm.value = true
  }

  
  const submitNewLocation = async () => {
  try {
    // Create new array instead of pushing to existing one
    const updatedLocations = [
      ...locations.value,
      {
        id: newLocation.value.id,
        name: newLocation.value.name,
        latitude: Number(newLocation.value.latitude),
        longitude: Number(newLocation.value.longitude)
      }
    ]

    // Update the ref with new array
    locations.value = updatedLocations

    // Optional: Send to server
    const ADD_LOCATION = gql`
      mutation AddLocation($name: String!, $latitude: Float!, $longitude: Float!) {
        addLocation(name: $name, latitude: $latitude, longitude: $longitude) {
          id
          name
          latitude
          longitude
        }
      }
    `

    await apolloClient.mutate({
      mutation: ADD_LOCATION,
      variables: {
        name: newLocation.value.name,
        latitude: newLocation.value.latitude,
        longitude: newLocation.value.longitude
      }
    })

    showAddForm.value = false
    newLocation.value = null
    
  } catch (err) {
    console.error('Failed to add location:', err)
  }
}

const handleMapMove = () => {
  updatePopupPositions()
}

const closePopup = (id) => {
  activePopups.value[id] = null
}

const closeAllPopups = () => {
  activePopups.value = {}
}

const GET_LOCATIONS = gql`
  query {
    locations {
      id
      name
      latitude
      longitude
    }
  }
`

const submitForm = async () => {
  try {
    const ADD_LOCATION = gql`
      mutation AddLocation($name: String!, $latitude: Float!, $longitude: Float!) {
        addLocation(name: $name, latitude: $latitude, longitude: $longitude) {
          id
          name
          latitude
          longitude
        }
      }
    `
    
    const { data } = await apolloClient.mutate({
      mutation: ADD_LOCATION,
      variables: {
        name: formPopup.value.name,
        latitude: formPopup.value.latitude,
        longitude: formPopup.value.longitude
      }
    })
    
    // Create new array instead of pushing to existing one
    locations.value = [
      ...locations.value,
      data.addLocation
    ]
    
    formPopup.value = null
    tempMarkerPosition.value = null
    
    // Refresh data
    const { data: newData } = await apolloClient.query({ query: GET_LOCATIONS })
    locations.value = newData.locations
    
  } catch (err) {
    console.error('Failed to add location:', err)
  }
}


onMounted(async () => {
  try {
    const { data } = await apolloClient.query({ query: GET_LOCATIONS })
    locations.value = data.locations
  } catch (err) {
    console.error('Failed to fetch locations:', err)
  }
})
</script>

<template>
  <VMap 
    ref="mapRef"
    style="height: 100vh;" 
    @click="handleMapClick"
    @move="handleMapMove"
    @moveend="handleMapMove"
  >
    <VMapOsmTileLayer />
    <VMapZoomControl />

    <VMapMarker
      v-for="loc in locations"
      :key="loc.id"
      :latlng="[loc.latitude, loc.longitude]"
      @click="openCustomPopup($event, loc)"
    />

    <!-- SVG untuk garis penghubung -->
    <svg class="connectors-layer">
      <path
        v-for="popup in sortedPopups"
        :key="'connector-' + popup.location.id"
        :d="calculateConnectorPath(popup)"
        class="connector-line"
        marker-end="url(#arrowhead)"
      />
    </svg>


    <VMapMarker
      v-if="showAddForm"
      :latlng="[newLocation.latitude, newLocation.longitude]"
    />

    <svg class="connectors-layer">
      <path
        v-if="showAddForm && newLocation.latitude && newLocation.longitude"
        :d="calculateNewLocationPath()"
        class="connector-line"
        marker-end="url(#arrowhead)"
      />
    </svg>
    

  </VMap>

  <!-- Multiple Popups -->
  <div
    v-for="popup in sortedPopups"
    :key="popup.location.id"
    class="floating-popup"
    :style="{ 
      top: popup.position.y + 'px', 
      left: popup.position.x + 'px',
      transform: 'translate(-50%, -100%)',
      zIndex: popup.zIndex,
      width: popupSize.width + 'px',
      height: popupSize.height + 'px'
    }"
  >
    <div class="popup-header">
      <strong>{{ popup.location.name }}</strong>
      <button @click="closePopup(popup.location.id)" class="w-1/4">✕</button>
    </div>
    <div class="popup-body">
      <p>Lat: {{ popup.location.latitude.toFixed(4) }}</p>
      <p>Lng: {{ popup.location.longitude.toFixed(4) }}</p>
    </div>
  </div>

  <!-- Form Tambah Lokasi -->
  <div
    v-if="showAddForm"
    class="floating-popup"
    :style="{ 
      top: formPosition.y + 'px', 
      left: formPosition.x + 'px',
      transform: 'translate(-50%, -100%)',
      zIndex: 2000,
      width: popupSize.width + 'px'
    }"
  >
    <div class="popup-header">
      <strong>Nama Lokasi</strong><br>
      <button @click="showAddForm = false" class="pt-2 pb-2 px-4">✕</button>
    </div>
    <div class="popup-body">
      <input class="" v-model="newLocation.name" />
        <!-- <input class="" v-model="newLocation.id" disabled /> -->
        <button @click="submitNewLocation" class="w-full">Simpan</button>
    </div>
  </div>

  <!-- Detail Lokasi -->
  <div
    v-if="formPopup"
    class="floating-popup"
    :style="{ 
      top: formPopup.y + 'px', 
      left: formPopup.x + 'px',
      transform: 'translate(-50%, -100%)',
      zIndex: 2000,
      width: popupSize.width + 'px'
    }"
  >
    <div class="popup-header">
      <strong>Tambah Lokasi</strong>
      <button @click="formPopup = null">✕</button>
    </div>
    <div class="popup-body">
      <label>ID:<br>
        <input v-model="formPopup.id" disabled />
      </label><br>
      <label>Nama:<br>
        <input v-model="formPopup.name" />
      </label><br>
      <label>Latitude:<br>
        <input v-model="formPopup.latitude" type="number" step="any" />
      </label><br>
      <label>Longitude:<br>
        <input v-model="formPopup.longitude" type="number" step="any" />
      </label><br>
      <button @click="submitForm" class="py-4">Simpan</button>
    </div>
  </div>
</template>

<style scoped>
.floating-popup {
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-left: 5px solid #005eff;
  pointer-events: auto;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 6px;
}

.popup-header button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding-block: 4px;
  padding-inline: 8px;
}

.popup-body {
  margin: 4px 0;
  overflow-y: auto;
  max-height: calc(100% - 30px);
}
.popup-body button {
  margin: 12px 0;
}

.connectors-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.connector-line {
  stroke: #005eff;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  fill: none;
}
.popup-input {
  width: 100%;
  padding: 4px;
  margin-bottom: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-btn {
  background-color: #005eff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

@media (max-width: 768px) {
  .floating-popup {
    width: 180px !important;
    height: 100px !important;
    font-size: 14px;
  }
}
/* Styling untuk form tambah lokasi */
.floating-popup input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.floating-popup label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.floating-popup button {
  background-color: #005eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.floating-popup button:hover {
  background-color: #0045c5;
}
</style>