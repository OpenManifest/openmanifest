import * as React from 'react';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import { useOperatorContext } from 'app/providers/operator/context';
import { useCurrentUserQuery } from 'app/api/reflection';
import { useSession } from 'app/state';
import { Platform } from 'react-native';
import { useAppSignalContext, INITIAL_TAGS } from './AppSignalContext';

function AppSignalSessionTagProvider(props: React.PropsWithChildren<object>) {
  const { children } = props;

  // This can be undefined here because this bondary
  // is rendered at the top of the app to catch errors
  // outside of GraphQL as wele
  const {
    operator: { operator, currentUser: currentMembership },
  } = useOperatorContext();
  const credentials = useSession((session) => session.credentials);
  const { data: currentUserData } = useCurrentUserQuery({ skip: !credentials });
  const currentUser = currentUserData?.currentUser;
  const currentRouteName = useSession((session) => session.currentRouteName);
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { tags, setTags } = useAppSignalContext();

  const sessionTags: { [key: string]: string } = React.useMemo(
    () => ({
      ...INITIAL_TAGS,
      currentOperatorId: (operator?.id || currentOperatorId || 'Unknown')?.toString(),
      currentOperator: operator?.name || 'Unknown',
      currentRouteName: currentRouteName || 'Unknown',
      currentUser: (currentMembership?.id || currentUser?.id || 'Unknown')?.toString(),
      platform: Platform.OS as string,
    }),
    [
      currentOperatorId,
      currentMembership?.id,
      currentRouteName,
      currentUser?.id,
      operator?.id,
      operator?.name,
    ]
  );

  React.useEffect(() => {
    // Update tags only if they're different
    const currentSessionTags = pick(tags, Object.keys(sessionTags));
    if (!isEqual(currentSessionTags, sessionTags)) {
      // Prevent this component from resetting tags when the GraphQL store
      // gets wiped on an error:
      if (isEqual(tags, INITIAL_TAGS) || !isEqual({ ...tags, ...sessionTags }, INITIAL_TAGS)) {
        setTags(sessionTags);
      }
    }
  }, [sessionTags, setTags, tags]);

  return children as React.JSX.Element;
}

export default AppSignalSessionTagProvider;
