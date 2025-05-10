import { defineStore } from 'pinia'
import {
	getProductsQuery,
	getProductByIdQuery,
	addProductMutation,
	updateProductMutation,
	deleteProductMutation,
} from "@/api/graphql";
import { apolloClient } from "@/apollo"; 

export const useProductStore = defineStore("products", {
	state: () => ({
		products: [],
		loading: false,
		error: null,
		pagination: {
			// Ensure this is properly initialized
			currentPage: 1,
			totalPages: 0,
			perPage: 2,
			totalItems: 0,
		},
	}),
	actions: {
		// READ - Fetch all products
		async fetchProducts(page = 1) {
			this.loading = true;
			this.error = null;

			try {
				const { data } = await apolloClient.query({
					query: getProductsQuery,
					variables: {
						pagination: {
							page,
							perPage: this.pagination.perPage,
						},
					},
				}); 

				if (data?.products) {
					this.products = data.products.products || [];

					// Ensure pagination data is properly set
					this.pagination = {
							currentPage: page,
							perPage: data.products.pagination?.perPage || this.pagination?.perPage || 2, // Default to 10 if not set
							totalItems: data.products.pagination?.totalItems || 0,
							totalPages: data.products.pagination?.totalPages || 0,
					};
			}
			} catch (error) {
				this.error = error;
				console.error("Error fetching products:", error);
				this.products.products = [];
			} finally {
				this.loading = false;
			}
		},
		// Add method to change items per page
		async setItemsPerPage(perPage) {
			this.pagination.perPage = perPage;
			await this.fetchProducts(1); // Reset to first page
		},

		// CREATE - Add new product
		async fetchProductById(id) {
			this.loading = true;
			try {
				const result = await apolloClient.query({
					query: getProductByIdQuery,
					variables: { id: String(id) },
				});
				return result.data?.product || null;
			} catch (error) {
				this.error = error;
				console.error("Error fetching product:", error);
				return null;
			} finally {
				this.loading = false;
			}
		},

		async addProduct(productData) {
			this.loading = true;
			this.error = null;

			try {
				// Handle file upload separately if needed
				let imageUrl = "";

				if (productData.image instanceof File) {
					imageUrl = await this.uploadImage(productData.image);
				}

				const result = await apolloClient.mutate({
					mutation: addProductMutation,
					variables: {
						input: {
							...productData,
							image: imageUrl, // Use the uploaded URL
						},
					},
				});

				await this.fetchProducts();
				return result.data.addProduct;
			} catch (error) {
				this.error = error;
				throw error;
			} finally {
				this.loading = false;
			}
		},
		async uploadImage(file) {
			const formData = new FormData();
			formData.append("file", file);

			try {
				const response = await fetch("http://localhost:4000/upload", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) throw new Error("Upload failed");

				const data = await response.json();
				return data.url; // Assuming your API returns { url: '...' }
			} catch (error) {
				console.error("Image upload error:", error);
				throw error;
			}
		},
		// async addCategory(category) {
		// 	this.loading = true;
		// 	this.error = null;
		// 	try {
		// 		await apolloClient.mutate({
		// 			mutation: addCategoryMutation,
		// 			variables: {
		// 				input: category,
		// 			},
		// 		});
		// 		await this.fetchCategories(); // Refresh after add
		// 	} catch (error) {
		// 		this.error = error;
		// 		console.error("Error adding category:", error);
		// 	} finally {
		// 		this.loading = false;
		// 	}
		// },

		// UPDATE - Edit existing product
		async updateProduct(id, productInput) {
			this.loading = true;
			this.error = null;

			const { mutate, onDone, onError } = useMutation(gql`
				mutation UpdateProduct($id: ID!, $input: ProductInput!) {
					updateProduct(id: $id, input: $input) {
						id
						name
						price
						description
						category {
							id
							name
						}
					}
				}
			`);

			onDone((result) => {
				const index = this.products.findIndex((p) => p.id === id);
				if (index !== -1) {
					this.products.splice(index, 1, result.data.updateProduct);
				}
			});

			onError((error) => {
				this.error = error;
			});

			try {
				await mutate({ id, input: productInput });
			} finally {
				this.loading = false;
			}
		},

		// DELETE - Remove product
		async deleteProduct(id) {
			this.loading = true;
			this.error = null;

			const { mutate, onDone, onError } = useMutation(gql`
				mutation DeleteProduct($id: ID!) {
					deleteProduct(id: $id)
				}
			`);

			onDone(() => {
				this.products = this.products.filter((p) => p.id !== id);
			});

			onError((error) => {
				this.error = error;
			});

			try {
				await mutate({ id });
			} finally {
				this.loading = false;
			}
		},
	},
	getters: {
		getProductById: (state) => (id) => {
			return state.products.find((product) => product.id === id);
		},
		productsByCategory: (state) => (categoryId) => {
			return state.products.filter(
				(product) => product.category?.id === categoryId,
			);
		},
		paginatedProducts: (state) => {
			const start =
				(state.pagination.currentPage - 1) * state.pagination.perPage;
			const end = start + state.pagination.perPage;
			return state.products.slice(start, end);
		},
	},
});