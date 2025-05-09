import gql from "graphql-tag";

export const GET_CATEGORIES_PRODUCTS = gql`
	query {
		categories {
			id
			name
			parentId
			products {
				id
				name
				price
			}
			children {
				id
				name
				products {
					id
					name
					price
				}
				children {
					id
					name
					products {
						id
						name
						price
					}
				}
			}
		}
	}
`;

export const ADD_PRODUCT = gql`
	mutation ($name: String!, $price: Float!, $categoryId: ID!) {
		addProduct(name: $name, price: $price, categoryId: $categoryId) {
			id
			name
			price
		}
	}
`;
