import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const link = new HttpLink({
  uri: "http://localhost:8080/v1/graphql", // Hasura GraphQL endpoint
  headers: {
    "x-hasura-admin-secret": "myadminsecretkey", // replace with your secret
  },
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;