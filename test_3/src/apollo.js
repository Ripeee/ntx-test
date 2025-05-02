import {
	ApolloClient,
	createHttpLink,
	InMemoryCache,
	gql,
} from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";

// HTTP connection to the API
const httpLink = createHttpLink({
	// Menggunakan endpoint GraphQL Hasura yang Anda berikan
	uri: "https://sirefcode.hasura.app/v1/graphql",
	// Menambahkan request headers
	headers: {
		"content-type": "application/json",
		"x-hasura-admin-secret":
			"jw8y3lwW7Vk4HKuROjlbs3flnrYaDsE1vkqNqhtTgv3rIo8bC655Fx6WmSZk4KvO",
	},
});

// Log any GraphQL errors or network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors)
		graphQLErrors.forEach(({ message, locations, path }) =>
			console.error(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
			),
		);
	if (networkError) console.error(`[Network error]: ${networkError}`);
});

// Cache implementation
const cache = new InMemoryCache();

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
	link: errorLink.concat(httpLink), // Gabungkan errorLink dan httpLink
	cache,
});

// --- Definisi GraphQL Operations ---

// Query untuk mengambil data pengiriman
// PASTIKAN nama 'deliveries' dan field-field di dalamnya (id, name, latitude, longitude, status)
// sesuai dengan skema GraphQL yang tersedia di endpoint Hasura Anda.
// Jika nama tabel/view atau kolom berbeda, Anda perlu menyesuaikan query ini.
export const GET_DELIVERIES = gql`
	query GetDeliveries {
		deliveries {
			id
			name
			latitude
			longitude
			status
			# Tambahkan field lain sesuai skema GraphQL Anda jika diperlukan di UI
		}
	}
`;

// Contoh Mutation (sesuai kebutuhan soal, tapi tidak digunakan di peta ini)
export const UPDATE_DELIVERY_STATUS = gql`
	mutation UpdateDeliveryStatus($id: ID!, $status: String!) {
		updateDeliveryStatus(id: $id, status: $status) {
			id
			status
		}
	}
`;
