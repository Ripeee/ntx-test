<template>
  <div
    class="floating-popup"
    :style="{ top: popupPosition.y + 'px', left: popupPosition.x + 'px' }"
  >
    <div class="popup-header">
      <span>{{ popupTitle }}</span>
      <button @click="handleCloseClick">×</button> </div>
    <div class="popup-body">
      <p>{{ popupInfo }}</p>
      </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMapStore } from '@/stores/mapStore'; // Sesuaikan path

const props = defineProps({
  markerId: {
    type: String, // Sesuaikan tipe data
    required: true
  },
  markerData: { // Prop untuk menerima data yang ditampilkan
      type: Object,
      default: () => ({})
  },
  position: { // Prop untuk menerima posisi marker
      type: Object,
      required: true
  }
});

const mapStore = useMapStore();

// Gunakan data dari prop untuk konten popup
const popupTitle = computed(() => props.markerData.title || 'Detail Marker');
const popupInfo = computed(() => props.markerData.info || 'Informasi tambahan...');

// Hitung posisi popup relatif terhadap posisi marker
const popupPosition = computed(() => {
    // Ini adalah logika sederhana. Anda mungkin perlu menyesuaikannya
    // agar popup muncul di samping, di atas, atau di bawah marker
    return {
        x: props.position.x + 20, // Geser sedikit ke kanan dari marker
        y: props.position.y - 10 // Geser sedikit ke atas dari marker
    };
});


// Metode untuk menangani klik tombol tutup
const handleCloseClick = () => {
  mapStore.closePopup(props.markerId);
};
</script>

<style scoped>
/* CSS yang Anda berikan */
.floating-popup {
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 1000;
  border-left: 5px solid #005eff;
  /* Gaya posisi akan ditimpa oleh inline style dari computed property */
  /* top: ...; left: ...; */
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