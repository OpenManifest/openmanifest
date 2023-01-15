import { setContext } from '@apollo/client/link/context';
import * as React from 'react';
import { useAppSelector } from 'app/state';
import isEmpty from 'lodash/isEmpty';

export function useAuthenticationLink() {
  const credentials = useAppSelector((root) => root.global.credentials);
  const authHeaders = React.useMemo(() => {
    if (!credentials?.accessToken) return {};
    return {
      Authorization: `Bearer ${credentials.accessToken}`,
      'access-token': credentials.accessToken,
      'token-type': credentials.tokenType,
      ...credentials,
    };
  }, [credentials]);

  console.debug('[Apollo::Link::Authentication]: Current: ', { authHeaders, credentials });
  return React.useMemo(() => {
    if (isEmpty(authHeaders)) {
      console.debug('[Apollo::Link::Authentication]: No headers to set', authHeaders);
      return undefined;
    }

    return setContext((_, { headers }) => {
      console.debug('[Apollo::Link::Authentication]: Headers: ', {
        ...headers,
        ...authHeaders,
      });
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
