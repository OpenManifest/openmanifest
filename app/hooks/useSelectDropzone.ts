import * as React from 'react';
import type { DropzoneExtensiveFragment } from 'app/api/operations';
import { actions, useAppDispatch, useSession } from 'app/state';
import { useThemeOverrides } from 'app/theme';

/**
 * Makes a dropzone the current one: the session store keeps its id (persisted), Redux still holds the snapshot until
 * P4.3 removes it. The theme follows the dropzone through Apollo.
 */
export default function useSelectDropzone() {
  const dispatch = useAppDispatch();
  const setDropzone = useSession((session) => session.setDropzone);

  return React.useCallback(
    (dropzone: DropzoneExtensiveFragment | null | undefined) => {
      useThemeOverrides.getState().setPrimary(null);
      dispatch(actions.global.setDropzone(dropzone ?? null));
      setDropzone(dropzone?.id ?? null);
    },
    [dispatch, setDropzone]
  );
}
