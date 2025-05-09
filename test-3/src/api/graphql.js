import gql from "graphql-tag";

// Category queries and mutations
export const getCategoriesQuery = gql`
	query GetCategories {
		categories {
			id
			name
			parentId
		}
	}
`;

export const addCategoryMutation = gql`
	mutation AddCategory($input: CategoryInput!) {
		addCategory(input: $input) {
			id
			name
			parentId
		}
	}
`;

export const updateCategoryMutation = gql`
	mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
		updateCategory(id: $id, input: $input) {
			id
			name
			parentId
		}
	}
`;

export const deleteCategoryMutation = gql`
	mutation DeleteCategory($id: ID!) {
		deleteCategory(id: $id) {
			id
		}
	}
`;


// Product queries and mutations
export const getProductsQuery = gql`
	query GetProducts {
		products {
			id
			name
			price
			description
			categoryId
			stock
			image
		}
	}
`;

export const getProductByIdQuery = gql`
	query GetProductById($id: ID!) {
		product(id: $id) {
			id
			name
			price
			description
			categoryId
			stock
			image
		}
	}
`;

export const addProductMutation = gql`
	mutation AddProduct($input: ProductInput!) {
		addProduct(input: $input) {
			id
			name
			price
			description
			categoryId
			stock
			image
		}
	}
`;

export const updateProductMutation = gql`
	mutation UpdateProduct($id: ID!, $input: ProductInput!) {
		updateProduct(id: $id, input: $input) {
			id
			name
			price
			description
			categoryId
			stock
			image
		}
	}
`;

export const deleteProductMutation = gql`
	mutation DeleteProduct($id: ID!) {
		deleteProduct(id: $id)
	}
`;