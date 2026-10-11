import * as React from 'react';
import { useSession } from 'app/state';
import { getApolloClient } from 'app/api/client/registry';
import { useJoinDropzoneMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { useThemeOverrides } from 'app/theme';

type SelectableDropzone = {
  id?: string | null;
  /** null when the user has not joined the dropzone; undefined when it is not known (then nothing is joined) */
  currentUser?: { id?: string | null } | null;
};

/**
 * Makes a dropzone the current one: the session store keeps its id (persisted); everything else about it (details,
 * permissions, theme colours) comes from Apollo. A dropzone the user is not a member of (`currentUser: null`) is joined
 * first, and is not selected if that fails (e.g. a private dropzone). Resolves to whether the dropzone was selected.
 */
export default function useSelectDropzone() {
  const setDropzone = useSession((session) => session.setDropzone);
  const [joinDropzone] = useJoinDropzoneMutation();
  const notify = useNotifications();

  return React.useCallback(
    (dropzone: SelectableDropzone | null | undefined): Promise<boolean> => {
      const select = () => {
        useThemeOverrides.getState().setPrimary(null);
        setDropzone(dropzone?.id ?? null);
        // What was loaded belongs to the previous dropzone
        getApolloClient()
          ?.resetStore()
          .catch((error) => console.debug('[Session::dropzone]: Could not reset the store', error));
        return true;
      };

      if (!dropzone?.id || dropzone.currentUser !== null) {
        return Promise.resolve(select());
      }

      return joinDropzone({ variables: { dropzone: dropzone.id } })
        .then(({ data }) => {
          const payload = data?.joinDropzone;
          if (payload?.dropzoneUser) {
            return select();
          }
          notify.error(payload?.errors?.[0] ?? 'This dropzone cannot be joined');
          return false;
        })
        .catch((error) => {
          notify.error(error instanceof Error ? error.message : 'This dropzone cannot be joined');
          return false;
        });
    },
    [joinDropzone, notify, setDropzone]
  );
}
