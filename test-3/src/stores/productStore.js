import { defineStore } from "pinia";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
	GET_ALL_DATA,
	CREATE_CATEGORY_MUTATION,
	UPDATE_CATEGORY_MUTATION,
	DELETE_CATEGORY_MUTATION,
	CREATE_PRODUCT_MUTATION,
	UPDATE_PRODUCT_MUTATION,
	DELETE_PRODUCT_MUTATION,
} from "@/api/graphql"; // Sesuaikan path import

export const useProductStore = defineStore("product", {
	state: () => ({
		categories: [], // List kategori datar
		products: [], // List produk datar
		loading: false, // Global loading state
		error: null, // Global error state
		selectedCategoryId: null, // ID kategori yang sedang aktif/dipilih
	}),

	getters: {
		// Getter untuk mengubah list datar kategori menjadi tree
		categoryTree: (state) => {
			const categoriesById = state.categories.reduce((acc, category) => {
				acc[category.id] = { ...category, subcategories: [] };
				return acc;
			}, {});

			const tree = [];
			state.categories.forEach((category) => {
				if (category.parentId && categoriesById[category.parentId]) {
					categoriesById[category.parentId].subcategories.push(
						categoriesById[category.id],
					);
				} else {
					// Jika tidak punya parentId valid, anggap top-level
					tree.push(categoriesById[category.id]);
				}
			});
			// Sort tree dan subtrees secara alfabetis berdasarkan nama
			const sortTree = (nodes) => {
				if (!nodes) return [];
				return nodes
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((node) => ({
						...node,
						subcategories: sortTree(node.subcategories),
					}));
			};

			return sortTree(tree);
		},

		// Getter untuk mendapatkan kategori berdasarkan ID dari list datar
		getCategoryById: (state) => (id) => {
			return state.categories.find((cat) => cat.id === id);
		},

		// Getter untuk mendapatkan produk langsung di bawah kategori tertentu
		getProductsByCategoryId: (state) => (categoryId) => {
			if (!categoryId) return []; // Tidak ada kategori dipilih
			return state.products.filter(
				(product) => product.categoryId === categoryId,
			);
		},

		// Getter untuk menghitung total produk REKURSIF dalam sebuah kategori
		getCategoryTotalRecursiveProductCount: (state) => (categoryId) => {
			// Gunakan categoryTree getter untuk navigasi rekursif
			const findCategoryNode = (nodes, id) => {
				for (const node of nodes) {
					if (node.id === id) return node;
					const foundInSub = findCategoryNode(node.subcategories, id);
					if (foundInSub) return foundInSub;
				}
				return null;
			};

			const calculateCount = (node) => {
				if (!node) return 0;

				// Jumlah produk langsung di kategori ini
				const directProductCount = state.products.filter(
					(p) => p.categoryId === node.id,
				).length;

				// Jumlah produk di subkategori rekursif
				const subcategoryCount = node.subcategories.reduce((sum, subnode) => {
					return sum + calculateCount(subnode); // Rekursif call
				}, 0);

				return directProductCount + subcategoryCount;
			};

			const categoryNode = findCategoryNode(state.categoryTree, categoryId);
			return calculateCount(categoryNode);
		},

		// Getter untuk menghitung total harga REKURSIF dalam sebuah kategori
		getCategoryTotalRecursivePrice: (state) => (categoryId) => {
			// Gunakan categoryTree getter untuk navigasi rekursif
			const findCategoryNode = (nodes, id) => {
				for (const node of nodes) {
					if (node.id === id) return node;
					const foundInSub = findCategoryNode(node.subcategories, id);
					if (foundInSub) return foundInSub;
				}
				return null;
			};

			const calculatePrice = (node) => {
				if (!node) return 0;

				// Total harga produk langsung di kategori ini
				const directPrice = state.products
					.filter((p) => p.categoryId === node.id)
					.reduce((sum, p) => sum + p.price, 0);

				// Total harga di subkategori rekursif
				const subcategoryPrice = node.subcategories.reduce((sum, subnode) => {
					return sum + calculatePrice(subnode); // Rekursif call
				}, 0);

				return directPrice + subcategoryPrice;
			};

			const categoryNode = findCategoryNode(state.categoryTree, categoryId);
			return calculatePrice(categoryNode);
		},
	},

	actions: {
		async fetchData() {
			this.loading = true;
			this.error = null;
			try {
				const { onResult, onError, loading } = useQuery(GET_ALL_DATA);

				await new Promise((resolve, reject) => {
					onResult((result) => {
						if (result.data) {
							this.categories = result.data.categories || [];
							this.products = result.data.products || [];
							console.log("Data fetched:", {
								categories: this.categories,
								products: this.products,
							});
						} else {
							this.categories = [];
							this.products = [];
							console.warn("No data returned from GraphQL.");
						}
						// Pastikan loading status terakhir diperbarui
						this.loading = loading.value;
						resolve();
					});
					onError((err) => {
						this.error = err;
						console.error("Error fetching data:", err);
						// Pastikan loading status terakhir diperbarui
						this.loading = loading.value;
						reject(err);
					});
				});
			} catch (err) {
				if (!this.error) {
					// Hindari menimpa error GraphQL
					this.error = err;
					console.error("Unexpected error in fetchData:", err);
				}
				this.loading = false; // Pastikan loading false jika ada error
			} finally {
				this.loading = false; // Pastikan loading false setelah selesai
			}
		},

		// --- CRUD Actions (Menggunakan refetch setelah mutasi untuk update state) ---

		async createCategory(categoryData) {
			this.loading = true;
			this.error = null;
			const { mutate } = useMutation(CREATE_CATEGORY_MUTATION);
			try {
				await mutate(categoryData); // categoryData = { name, parentId }
				await this.fetchData(); // Refetch data setelah sukses
				console.log("Category created, refetching data.");
			} catch (err) {
				this.error = err;
				console.error("Error creating category:", err);
			} finally {
				this.loading = false;
			}
		},

		async updateCategory(id, categoryData) {
			this.loading = true;
			this.error = null;
			const { mutate } = useMutation(UPDATE_CATEGORY_MUTATION);
			try {
				await mutate({ id, ...categoryData }); // categoryData = { name, parentId }
				await this.fetchData(); // Refetch data setelah sukses
				console.log("Category updated, refetching data.");
			} catch (err) {
				this.error = err;
				console.error("Error updating category:", err);
			} finally {
				this.loading = false;
			}
		},

		async deleteCategory(id) {
			// Konfirmasi sebelum delete
			if (
				!confirm(
					"Apakah Anda yakin ingin menghapus kategori ini? (Produk dan subkategori di dalamnya mungkin ikut terhapus)",
				)
			) {
				return;
			}
			this.loading = true;
			this.error = null;
			const { mutate } = useMutation(DELETE_CATEGORY_MUTATION);
			try {
				await mutate({ id });
				await this.fetchData(); // Refetch data setelah sukses
				// Reset selected category if the deleted one was selected
				if (this.selectedCategoryId === id) {
					this.selectedCategoryId = null;
				}
				// If deleted category was a parent of the selected one, update selected
				// Find the parent of the deleted category
				const deletedCat = this.categories.find((cat) => cat.id === id);
				if (deletedCat && this.selectedCategoryId) {
					// Simple check: if selected is a child of deleted (approx)
					const isChildOfDeleted = (childId, deletedParentId) => {
						let current = this.categories.find((cat) => cat.id === childId);
						while (current) {
							if (current.parentId === deletedParentId) return true;
							if (!current.parentId) return false;
							current = this.categories.find(
								(cat) => cat.id === current.parentId,
							);
						}
						return false;
					};
					if (isChildOfDeleted(this.selectedCategoryId, id)) {
						this.selectedCategoryId = deletedCat.parentId || null; // Select the parent or null
					}
				}

				console.log("Category deleted, refetching data.");
			} catch (err) {
				this.error = err;
				console.error("Error deleting category:", err);
			} finally {
				this.loading = false;
			}
		},

		async createProduct(productData) {
			this.loading = true;
			this.error = null;
			const { mutate } = useMutation(CREATE_PRODUCT_MUTATION);
			try {
				await mutate(productData); // productData = { name, price, categoryId }
				await this.fetchData(); // Refetch data setelah sukses
				console.log("Product created, refetching data.");
			} catch (err) {
				this.error = err;
				console.error("Error creating product:", err);
			} finally {
				this.loading = false;
			}
		},

		async updateProduct(id, productData) {
			this.loading = true;
			this.error = null;
			const { mutate } = useMutation(UPDATE_PRODUCT_MUTATION);
			try {
				await mutate({ id, ...productData }); // productData = { name, price, categoryId }
				await this.fetchData(); // Refetch data setelah sukses
				console.log("Product updated, refetching data.");
			} catch (err) {
				this.error = err;
				console.error("Error updating product:", err);
			} finally {
				this.loading = false;
			}
		},

		async deleteProduct(id) {
			// Konfirmasi sebelum delete
			if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
				return;
			}
			this.loading = true;
			this.error = null;
			const { mutate } = useMutation(DELETE_PRODUCT_MUTATION);
			try {
				await mutate({ id });
				await this.fetchData(); // Refetch data setelah sukses
				console.log("Product deleted, refetching data.");
			} catch (err) {
				this.error = err;
				console.error("Error deleting product:", err);
			} finally {
				this.loading = false;
			}
		},

		// Action untuk mengubah kategori yang dipilih
		selectCategory(categoryId) {
			this.selectedCategoryId = categoryId;
			// Optional: update URL router jika ingin deep linking
			// import router from '@/router';
			// router.push({ path: '/categories', query: { cat: categoryId || undefined } });
			console.log("Selected category:", categoryId);
		},
	},
});
