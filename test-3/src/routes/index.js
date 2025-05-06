import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import CategoryManagementView from "@/views/CategoryManagementView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			redirect: "/dashboard", // Redirect root ke dashboard
		},
		{
			path: "/dashboard",
			name: "dashboard",
			component: DashboardView,
		},
		{
			path: "/categories",
			name: "category-management",
			component: CategoryManagementView,
			// Optional: Baca query param untuk selectedCategoryId jika ingin deep linking
			// beforeEnter: (to, from, next) => {
			//    const store = useProductStore(); // Import store jika perlu
			//    if (to.query.cat) {
			//       store.selectCategory(to.query.cat);
			//    } else {
			//       store.selectCategory(null);
			//    }
			//    next();
			// }
		},
		// Tambahkan route lain jika ada
	],
});

export default router;
