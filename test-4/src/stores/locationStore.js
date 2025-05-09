// stores/location.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import gql from "graphql-tag";
import { apolloClient } from "@/apollo";

export const useLocationStore = defineStore("location", () => {
	const locations = ref([]);
	const loading = ref(false);
	const error = ref(null);

	const GET_LOCATIONS = gql`
		query {
			locations {
				id
				name
				latitude
				longitude
			}
		}
	`;

	const ADD_LOCATION = gql`
		mutation AddLocation(
			$name: String!
			$latitude: Float!
			$longitude: Float!
		) {
			addLocation(name: $name, latitude: $latitude, longitude: $longitude) {
				id
				name
				latitude
				longitude
			}
		}
	`;

	// Action: Fetch all locations
	const fetchLocations = async () => {
		loading.value = true;
		try {
			const { data } = await apolloClient.query({ query: GET_LOCATIONS });
			locations.value = data.locations;
		} catch (err) {
			error.value = err;
		} finally {
			loading.value = false;
		}
	};

	// Action: Add a new location
	const addLocation = async () => {
		try {
			const { data } = await apolloClient.mutate({
				mutation: ADD_LOCATION,
				variables: { name, latitude, longitude },
			});
			locations.value.push(data.addLocation);
		} catch (err) {
			error.value = err;
		}
	};

	return {
		locations,
		loading,
		error,
		fetchLocations,
		addLocation,
	};
});
