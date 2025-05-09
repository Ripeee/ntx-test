import { defineStore } from "pinia";
import {
	getCategoriesQuery,
	addCategoryMutation,
	updateCategoryMutation,
	deleteCategoryMutation,
} from "@/api/graphql";
import { apolloClient } from "@/apollo"; // ✅ Import Apollo client

export const useCategoryStore = defineStore("categories", {
	state: () => ({
		categories: [],
		loading: false,
		error: null,
	}),
	actions: {
		async fetchCategories() {
			this.loading = true;
			this.error = null;
			try {
				const result = await apolloClient.query({
					query: getCategoriesQuery,
					fetchPolicy: "no-cache", // Optional: always fetch fresh data
				});

				this.categories = Array.isArray(result.data.categories)
					? result.data.categories
					: [];
			} catch (error) {
				this.error = error;
				console.error("Error fetching categories:", error);
				this.categories = [];
			} finally {
				this.loading = false;
			}
		},

		async addCategory(category) {
			this.loading = true;
			this.error = null;
			try {
				await apolloClient.mutate({
					mutation: addCategoryMutation,
					variables: {
						input: category,
					},
				});
				await this.fetchCategories(); // Refresh after add
			} catch (error) {
				this.error = error;
				console.error("Error adding category:", error);
			} finally {
				this.loading = false;
			}
		},

		async updateCategory(category) {
			console.log(category, "category");
			this.loading = true;
			this.error = null;
			try {
				// 1. Prepare the update data
				const updateData = {
					name: category.name,
					parentId: category.parentId || null, // Ensure parentId is null if undefined
				};

				// 2. Convert ID to string if needed (GraphQL IDs are often strings)
				const categoryId = String(category.id);

				// 3. Execute the mutation with proper typing
				const result = await apolloClient.mutate({
					mutation: updateCategoryMutation,
					variables: {
						id: categoryId,
						input: updateData,
					},
					// 4. Optional: Optimistic UI update
					optimisticResponse: {
						__typename: "Mutation",
						updateCategory: {
							__typename: "Category",
							id: categoryId,
							...updateData,
						},
					},
					// 5. Update Apollo cache
					update: (cache, { data: { updateCategory } }) => {
						const existingData = cache.readQuery({ query: getCategoriesQuery });
						if (existingData?.categories) {
							cache.writeQuery({
								query: getCategoriesQuery,
								data: {
									categories: existingData.categories.map((cat) =>
										cat.id === categoryId ? updateCategory : cat,
									),
								},
							});
						}
					},
				});

				// 6. Update local state immediately
				this.categories = this.categories.map((c) =>
					c.id === categoryId ? { ...c, ...updateData } : c,
				);

				// 7. Optional: Refresh from server to ensure consistency
				await this.fetchCategories();
			} catch (error) {
				this.error = error;
				console.error("Error updating category:", error);
				throw error; // Re-throw to allow component handling
			} finally {
				this.loading = false;
			}
		},

		async deleteCategory(id) {
			this.loading = true;
			this.error = null;
			try {
				await apolloClient.mutate({
					mutation: deleteCategoryMutation,
					variables: {
						id,
					},
				});
				await this.fetchCategories(); // Refresh after delete
			} catch (error) {
				this.error = error;
				console.error("Error deleting category:", error);
			} finally {
				this.loading = false;
			}
		},
	},

	getters: {
		categoryTree: (state) => {
			const buildTree = (parentId = null) => {
				return state.categories
					.filter((category) => category.parentId === parentId)
					.map((category) => ({
						...category,
						children: buildTree(category.id),
					}));
			};
			return buildTree();
		},
	},
});
