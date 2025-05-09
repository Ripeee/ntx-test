import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore("main", () => {
	const categories = ref([]);
	const products = ref([]);

	return {
		categories,
		products,
	};
});
