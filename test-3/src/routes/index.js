import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/DashboardView.vue";
import CategoryManager from "@/components/CategoryManager.vue";
import ProductManager from "@/components/ProductManager.vue";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			redirect: "/dashboard", // Redirect root ke dashboard
		},
		{
			path: "/dashboard",
			name: "dashboard",
			component: Dashboard,
		},
		{
			path: "/categories",
			name: "categories",
			component: CategoryManager,
		},
		{
			path: "/products",
			name: "products",
			component: ProductManager,
		},
		// Tambahkan route lain jika ada
	],
});

export default router;
