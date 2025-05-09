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
		products: [
			{
				id: 1,
				name: "Product 1",
				price: 100,
				description: "Description 1",
				category: { id: 1, name: "Category 1" },
				image: "image1.jpg",
				stock: 10,
			},
		],
		loading: false,
		error: null,
		pagination: {
			// Ensure this is properly initialized
			currentPage: 1,
			totalPages: 0,
			perPage: 10, // Default value
			totalItems: 0,
		},
	}),
	actions: {
		// READ - Fetch all products
		// async fetchProducts(page = 1) {
		// 	this.loading = true;
		// 	this.error = null;

		// 	try {
		// 		const { data } = await apolloClient.query({
		// 			query: getProductsQuery,
		// 			variables: {
		// 				page,
		// 				perPage: this.pagination?.perPage || 10, // Fallback value
		// 			},
		// 		});

		// 		console.log(data, "dataaaaa");
		// 		this.products = data.products.data || [];
		// 		// this.categories = Array.isArray(result.data.categories)
		// 		// 	? result.data.categories
		// 		// 	: [];

		// 		// Update pagination only if response contains pagination data
		// 		if (data.products.pagination) {
		// 			this.pagination = {
		// 				...this.pagination,
		// 				...data.products.pagination,
		// 			};
		// 		}
		// 	} catch (error) {
		// 		this.error = error;
		// 		console.error("Error fetching products:", error);
		// 		this.products = [];
		// 	} finally {
		// 		this.loading = false;
		// 	}
		// },
		async fetchProducts() {
			this.loading = true;
			this.error = null;

			try {
				// if (!this.products.categoryId) {
				// 	throw new Error("Category is required");
				// }

				const { data }= await apolloClient.query({
					query: getProductsQuery,
					fetchPolicy: "no-cache", // Optional: always fetch fresh data
				});
				console.log(data, "dataaaaa");

				this.products = data.products || [];
				// this.categories = Array.isArray(result.data.categories)
				// 	? result.data.categories
				// 	: [];
			} catch (error) {
				this.error = error;
				console.error("Error fetching products:", error);
				this.products = [];
			} finally {
				this.loading = false;
			}
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