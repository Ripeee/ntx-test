import { defineStore } from "pinia";

export const useMapStore = defineStore("map", {
	state: () => ({
		locations: [],
		loading: true,
		error: null,
		openPopupMarkerIds: [],
		deliveries: [],
		// Menyimpan data pengiriman yang pop up-nya sedang terbuka
		openPopups: [],
	}),
	actions: {
		setLocations(data) {
			this.locations = data;
		},
		addLocation(loc) {
			this.locations.push(loc);
		},
		deleteLocation(loc) {
			this.locations = this.locations.filter(
				(location) => location.id !== loc.id,
			);
		},
		setLoading(status) {
			this.loading = status;
		},
		setError(err) {
			this.error = err;
		},
		openPopup(markerId) {
			// Sesuaikan tipe data
			if (!this.openPopupMarkerIds.includes(markerId)) {
				this.openPopupMarkerIds.push(markerId);
				console.log(`Popup for marker ${markerId} opened.`);
				// Jika Anda menyimpan data atau posisi, tambahkan logikanya di sini
			}
		},

		// Aksi untuk menutup popup
		closePopup(markerId) {
			// Sesuaikan tipe data
			this.openPopupMarkerIds = this.openPopupMarkerIds.filter(
				(id) => id !== markerId,
			);
			console.log(`Popup for marker ${markerId} closed.`);
		},

		// Optional: Aksi untuk menutup semua popup
		closeAllPopups() {
			this.openPopupMarkerIds = [];
			console.log("All popups closed.");
		},
		async fetchDeliveries() {
			this.loading = true;
			this.error = null;
			try {
				// Menggunakan useQuery dari @vue/apollo-composable di dalam action
				// ini sedikit berbeda dari setup komponen, kita panggil query secara manual
				const { onResult, onError, loading } = useQuery(GET_DELIVERIES);

				// Menunggu hasil query
				await new Promise((resolve, reject) => {
					onResult((result) => {
						if (result.data && result.data.deliveries) {
							this.deliveries = result.data.deliveries;
							console.log("Deliveries fetched:", this.deliveries);
						} else {
							// Handle kasus jika data kosong atau tidak sesuai harapan
							this.deliveries = [];
							console.warn("No deliveries data returned from GraphQL.");
						}
						this.loading = loading.value; // Update loading status terakhir
						resolve();
					});
					onError((err) => {
						this.error = err;
						console.error("Error fetching deliveries:", err);
						this.loading = loading.value; // Update loading status terakhir
						reject(err);
					});
				});
			} catch (err) {
				// Error sudah ditangani onError di atas, tapi catch ini jaga-jaga
				if (!this.error) {
					// Hindari menimpa error GraphQL
					this.error = err;
					console.error("Unexpected error in fetchDeliveries:", err);
				}
				this.loading = false; // Pastikan loading false jika ada error
			} finally {
				this.loading = false; // Pastikan loading false setelah selesai (sukses atau error)
			}
		},

		// Menambahkan data pengiriman ke daftar popup terbuka
		openPopup(deliveryData) {
			// Periksa apakah popup untuk deliveryId ini sudah terbuka
			if (!this.openPopups.find((popup) => popup.id === deliveryData.id)) {
				this.openPopups.push(deliveryData);
				console.log("Popup opened for:", deliveryData.name);
			}
		},

		// Menutup popup berdasarkan ID pengiriman
		closePopup(deliveryId) {
			this.openPopups = this.openPopups.filter(
				(popup) => popup.id !== deliveryId,
			);
			console.log("Popup closed for ID:", deliveryId);
		},

		// Menutup semua popup (opsional, bisa dipanggil saat klik peta)
		closeAllPopups() {
			this.openPopups = [];
			console.log("All popups closed.");
		},
	},
});
