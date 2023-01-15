import * as React from 'react';
import { createAppSignalLink, useAppSignal } from 'app/components/app_signal';

const ERROR_CODE_WHITELIST = ['INSUFFICIENT_PERMISSIONS'];

export function useAppSignalLink() {
  const { appSignal } = useAppSignal();
  return React.useMemo(
    () =>
      createAppSignalLink(appSignal, {
        breadcrumbs: {
          includeQuery: true,
          includeVariables: true,
          includeResponse: false,
        },
        ignore: ({ graphQLErrors }) =>
          graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR') || false,
        excludeError: (err) => ERROR_CODE_WHITELIST.includes(err.extensions?.code as string),
      }),
    [appSignal]
  );
}
