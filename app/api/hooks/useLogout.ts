import { useApolloClient } from '@apollo/client';
import { actions, useAppDispatch } from 'app/state';
import React from 'react';
import { abortController } from '../client/links';

export function useLogout() {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  return React.useCallback(() => {
    console.debug('[Hooks::useLogout]: Logging out...');
    abortController.abort();
    client.clearStore();
    dispatch(actions.global.logout());
  }, [client, dispatch]);
}
