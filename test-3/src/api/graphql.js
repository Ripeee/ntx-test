import {
	ApolloClient,
	createHttpLink,
	InMemoryCache,
	gql,
} from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";

// Konfigurasi HTTP Link (Ganti URL_GRAPHQL_ANDA dengan endpoint Anda)
const httpLink = createHttpLink({
	uri: "http://localhost:5174/graphql", // Ganti dengan URL GraphQL Anda
	// Tambahkan header jika diperlukan (misal: otentikasi)
	// headers: {
	//   'Authorization': `Bearer ${localStorage.getItem('token')}`,
	//   'Content-Type': 'application/json',
	// },
});

// Error Handling Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors)
		graphQLErrors.forEach(({ message, locations, path }) =>
			console.error(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
			),
		);
	if (networkError) console.error(`[Network error]: ${networkError}`);
});

// Cache
const cache = new InMemoryCache();

// Buat Apollo Client
export const apolloClient = new ApolloClient({
	link: errorLink.concat(httpLink),
	cache,
});

// --- Definisi Operasi GraphQL ---

// Query untuk mengambil semua kategori dan produk (list datar)
export const GET_ALL_DATA = gql`
	query GetAllCategoriesAndProducts {
		categories {
			id
			name
			parentId # Asumsi ada field parentId
		}
		products {
			id
			name
			price
			categoryId # Asumsi ada field categoryId
		}
	}
`;

// Mutasi Kategori
export const CREATE_CATEGORY_MUTATION = gql`
	mutation CreateCategory($name: String!, $parentId: ID) {
		createCategory(input: { name: $name, parentId: $parentId }) {
			id
			name
			parentId
		}
	}
`;

export const UPDATE_CATEGORY_MUTATION = gql`
	mutation UpdateCategory($id: ID!, $name: String!, $parentId: ID) {
		updateCategory(id: $id, input: { name: $name, parentId: $parentId }) {
			id
			name
			parentId
		}
	}
`;

export const DELETE_CATEGORY_MUTATION = gql`
	mutation DeleteCategory($id: ID!) {
		deleteCategory(id: $id) # Asumsi mutasi ini menghapus rekursif jika perlu
	}
`;

// Mutasi Produk
export const CREATE_PRODUCT_MUTATION = gql`
	mutation CreateProduct($name: String!, $price: Float!, $categoryId: ID!) {
		createProduct(
			input: { name: $name, price: $price, categoryId: $categoryId }
		) {
			id
			name
			price
			categoryId
		}
	}
`;

export const UPDATE_PRODUCT_MUTATION = gql`
	mutation UpdateProduct(
		$id: ID!
		$name: String!
		$price: Float!
		$categoryId: ID!
	) {
		updateProduct(
			id: $id
			input: { name: $name, price: $price, categoryId: $categoryId }
		) {
			id
			name
			price
			categoryId
		}
	}
`;

export const DELETE_PRODUCT_MUTATION = gql`
	mutation DeleteProduct($id: ID!) {
		deleteProduct(id: $id)
	}
`;
