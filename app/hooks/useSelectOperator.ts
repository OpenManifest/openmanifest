import * as React from 'react';
import { useSession } from 'app/state';
import { getApolloClient } from 'app/api/client/registry';
import { useJoinOperatorMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { useThemeOverrides } from 'app/theme';

type SelectableOperator = {
  id?: string | null;
  /** null when the user has not joined the operator; undefined when it is not known (then nothing is joined) */
  currentUser?: { id?: string | null } | null;
};

/**
 * Makes an operator the current one: the session store keeps its id (persisted); everything else about it (details,
 * permissions, theme colours) comes from Apollo. An operator the user is not a member of (`currentUser: null`) is joined
 * first, and is not selected if that fails (e.g. a private operator). Resolves to whether the operator was selected.
 */
export default function useSelectOperator() {
  const setOperator = useSession((session) => session.setOperator);
  const [joinOperator] = useJoinOperatorMutation();
  const notify = useNotifications();

  return React.useCallback(
    (operator: SelectableOperator | null | undefined): Promise<boolean> => {
      const select = () => {
        useThemeOverrides.getState().setPrimary(null);
        setOperator(operator?.id ?? null);
        // What was loaded belongs to the previous operator
        getApolloClient()
          ?.resetStore()
          .catch((error) => console.error('[Session::operator]: Could not reset the store', error));
        return true;
      };

      if (!operator?.id || operator.currentUser !== null) {
        return Promise.resolve(select());
      }

      return joinOperator({ variables: { operator: operator.id } })
        .then(({ data }) => {
          const payload = data?.joinOperator;
          if (payload?.membership) {
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
    [joinOperator, notify, setOperator]
  );
}
