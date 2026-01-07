const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { InMemoryLRUCache } = require('@apollo/utils.keyvaluecache');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,

  persistedQueries: {
  cache: new InMemoryLRUCache({ maxSize: 1000, ttl: 300 }),
  allowUntrusted: false
}
,

  plugins: [
    {
      requestDidStart() {
        return {
          didResolveOperation({ request }) {
            console.log(
              'APQ extension:',
              request.extensions?.persistedQuery
            );
          }
        };
      }
    }
  ],

  context: ({ req }) => {
    const raw = req.headers['x-user'];

    if (!raw || typeof raw !== 'string') {
      return { user: null };
    }

    const username = raw.trim().toLowerCase();
    if (!username) {
      return { user: null };
    }

    const role = username === 'admin' ? 'ADMIN' : 'USER';

    return {
      user: {
        id: username,
        username,
        role
      }
    };
  }
});



  await server.start();

  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('🚀 GraphQL running at http://localhost:4000/graphql');
  });
}




startServer();
