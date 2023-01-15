import { ApolloLink } from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { getServerUrl } from '../utils/getServerUrl';
import { createWebsocketsLink, hasSubscriptionOperation } from './websockets';

export const abortController = new AbortController();
export const httpLink = new BatchHttpLink({
  batchDebounce: true,
  batchMax: 10,
  uri: getServerUrl(),
  fetchOptions: {
    mode: 'cors',
    method: 'POST',
    signal: abortController.signal,
  },
});

export function createHttpLink() {
  ApolloLink.split(hasSubscriptionOperation, createWebsocketsLink(), httpLink);
}
