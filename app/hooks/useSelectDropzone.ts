import * as React from 'react';
import { useSession } from 'app/state';
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
    },
    [setDropzone]
  );
}
