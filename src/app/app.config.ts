import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, HttpHeaders } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { routes } from './app.routes';

import { PersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const authLink = new ApolloLink((operation, forward) => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;

        operation.setContext({
          headers: new HttpHeaders({
            'x-user': user?.username ?? ''
          })
        });

        return forward(operation);
      });
return {
  cache: new InMemoryCache(),

  link: ApolloLink.from([
    authLink,
    httpLink.create({
      uri: 'http://localhost:4000/graphql'
    })
  ]),

  clients: {
    admin: {
      cache: new InMemoryCache(),
      link: httpLink.create({
        uri: 'http://localhost:4000/admin-graphql'
      })
    }
  }
};

     })
  ]
};
