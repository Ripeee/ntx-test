<template>
  <VMap style="height: 100vh;" @click="handleMapClick">
    <VMapOsmTileLayer />
    <VMapZoomControl />

    <VMapMarker
      v-for="loc in locations"
      :key="loc.id"
      :latlng="[loc.latitude, loc.longitude]"
      @click="openCustomPopup(loc)"
    />

  </VMap>

  <!-- Floating Modal -->
  <div
    v-if="selectedLocation"
    class="floating-popup"
    :style="{ top: popupPosition.y + 'px', left: popupPosition.x + 'px' }"
  >
    <div class="popup-header">
      <strong>NAMA LOKASI</strong>
      <button @click="selectedLocation = null">✕</button>
    </div>
    <div class="popup-body">
      <p><strong>{{ selectedLocation.name }}</strong></p>
      <p><small>ID: {{ selectedLocation.id }}</small></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gql from 'graphql-tag'
import { apolloClient } from '../apollo'
import {
  VMap,
  VMapOsmTileLayer,
  VMapZoomControl,
  VMapMarker,
} from 'vue-map-ui'

const locations = ref([])
const selectedLocation = ref(null)
const popupPosition = ref({ x: 0, y: 0 })

const openCustomPopup = (loc) => {
  selectedLocation.value = loc

  // Convert latlng to pixel position (approximation)
  const mapEl = document.querySelector('.v-map')
  const bounds = mapEl.getBoundingClientRect()

  popupPosition.value = {
    x: bounds.width / 2 + Math.random() * 50, // Simulate offset
    y: bounds.height / 2 + Math.random() * 50,
  }
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

onMounted(async () => {
  try {
    const res = await apolloClient.query({ query: GET_LOCATIONS })
    locations.value = res.data.locations
  } catch (err) {
    console.error('Failed to fetch locations:', err)
  }
})
</script>


<style scoped>
.floating-popup {
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 1000;
  border-left: 5px solid #005eff;
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
}

.popup-body p {
  margin: 4px 0;
}
</style>