import { InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const cache = new InMemoryCache({
  typePolicies: {
    Event: relayStylePagination(),
    DropzoneUsers: relayStylePagination(),
    Loads: relayStylePagination(),
  },
});
