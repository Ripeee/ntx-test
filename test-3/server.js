import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import cors from "cors";
const schema = buildSchema(`
  type Category {
    id: ID!
    name: String!
    parentId: ID
  }
		
	input CategoryInput {
    name: String!
    parentId: ID
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    categoryId: ID!
    stock: Int
    image: String
  }

	input ProductInput {
		name: String!
		price: Float!
		description: String
		categoryId: ID!
		stock: Int
		image: String
	}
		
  type ProductsResponse {
    products: [Product]!
    pagination: Pagination!
  }
	
	type Pagination {
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
    perPage: Int!
  }

  input PaginationInput {
    page: Int
    perPage: Int
  }

  type Query {
    categories: [Category]
    products(pagination: PaginationInput): ProductsResponse
    product(id: ID!): Product
  }

  type Mutation {
    addCategory(input: CategoryInput!): Category
    updateCategory(id: ID!, input: CategoryInput!): Category
    deleteCategory(id: ID!): Category
    addProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: ProductInput!): Product
    deleteProduct(id: ID!): Product
  }
`);

let categories = [
	{ id: "1", name: "Electronics", parentId: null },
	{ id: "2", name: "Laptops", parentId: "1" },
];
let products = [
	{
		id: 1,
		name: "Product 1",
		price: 100,
		description: "Description 1",
		categoryId: 1,
		image: "image1.jpg",	
		stock: 10,
	},
	{
		id: 2,
		name: "Product 2",
		price: 200,
		description: "Description 2",
		categoryId: 2,
		image: "image1.jpg",
		stock: 10,
	},
	{
		id: 3,
		name: "Product 3",
		price: 300,
		description: "Description 3",
		categoryId: 1,
		image: "image1.jpg",
		stock: 10,
	},
];

let nextId = 3;

const root = {
	categories: () => categories,
	addCategory: ({ input }) => {
		const newCat = { id: String(nextId++), ...input };
		categories.push(newCat);
		return newCat;
	},
	updateCategory: ({ id, input }) => {
		const index = categories.findIndex((c) => c.id === id);
		if (index !== -1) {
			categories[index] = { ...categories[index], ...input };
			return categories[index];
		}
	},
	deleteCategory: ({ id }) => {
		const index = categories.findIndex((c) => c.id === id);
		if (index !== -1) {
			const removed = categories.splice(index, 1);
			return removed[0];
		}
	},
	products: ({ pagination = {} }) => {
		const { page = 1, perPage = 2 } = pagination;
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		const paginatedProducts = products.slice(startIndex, endIndex);

		return {
			products: paginatedProducts,
			pagination: {
				totalItems: products.length,
				totalPages: Math.ceil(products.length / perPage),
				currentPage: page,
				perPage: perPage,
			},
		};
	},

	product: ({ id }) => products.find((p) => p.id === id),

	addProduct: ({ input }) => {
		const newProduct = {
			id: String(products.length + 1),
			...input,
		};
		products.push(newProduct);
		return newProduct;
	},
};

const app = express();
app.use(cors());
app.use("/graphql", graphqlHTTP({ schema, rootValue: root, graphiql: true }));
app.listen(4000, () =>
	console.log("GraphQL server running at http://localhost:4000/graphql"),
);
