import * as React from 'react';
import { useSession } from 'app/state';
import { getApolloClient } from 'app/api/client/registry';
import { useThemeOverrides } from 'app/theme';

/**
 * Makes a dropzone the current one: the session store keeps its id (persisted); everything else about it (details,
 * permissions, theme colours) comes from Apollo.
 */
export default function useSelectDropzone() {
  const setDropzone = useSession((session) => session.setDropzone);

  return React.useCallback(
    (dropzone: { id?: string | null } | null | undefined) => {
      useThemeOverrides.getState().setPrimary(null);
      setDropzone(dropzone?.id ?? null);
      // What was loaded belongs to the previous dropzone
      getApolloClient()
        ?.resetStore()
        .catch((error) => console.debug('[Session::dropzone]: Could not reset the store', error));
    },
    [setDropzone]
  );
}
