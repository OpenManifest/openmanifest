import * as React from 'react';
import type { DropzoneExtensiveFragment } from 'app/api/operations';
import { actions, useAppDispatch, useSession } from 'app/state';

/**
 * Makes a dropzone the current one: the session store keeps its id (persisted), Redux still holds the snapshot and
 * the dropzone's theme colours until P4.2/P4.3 remove them.
 */
export default function useSelectDropzone() {
  const dispatch = useAppDispatch();
  const setDropzone = useSession((session) => session.setDropzone);

  return React.useCallback(
    (dropzone: DropzoneExtensiveFragment | null | undefined) => {
      dispatch(actions.global.setDropzone(dropzone ?? null));
      setDropzone(dropzone?.id ?? null);
    },
    [dispatch, setDropzone]
  );
}
