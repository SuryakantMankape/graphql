import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      'x-user': JSON.parse(localStorage.getItem('user') || 'null')?.username ?? ''
    }
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' }
  }
});
