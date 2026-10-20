import { setContext } from '@apollo/client/link/context';
import * as React from 'react';
import { useSession } from 'app/state';
import isEmpty from 'lodash/isEmpty';

export function useAuthenticationLink() {
  const credentials = useSession((session) => session.credentials);
  const authHeaders = React.useMemo(() => {
    if (!credentials?.accessToken) return {};
    return {
      Authorization: `Bearer ${credentials.accessToken}`,
      'access-token': credentials.accessToken,
      'token-type': credentials.tokenType,
      ...credentials,
    };
  }, [credentials]);

  return React.useMemo(() => {
    if (isEmpty(authHeaders)) {
      return undefined;
    }

    return setContext((_, { headers }) => {
      return {
        authHeaders,
        headers: {
          ...headers,
          ...authHeaders,
        },
      };
    });
  }, [authHeaders]);
}
