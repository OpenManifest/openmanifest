import * as React from 'react';
import { NavigationState, getPathFromState } from '@react-navigation/native';
import { useSession } from 'app/state';

export default function useRouteChange() {
  const currentRouteName = useSession((session) => session.currentRouteName);
  const setRoute = useSession((session) => session.setRoute);

  return React.useCallback(
    (s?: NavigationState) => {
      if (s) {
        const [path] = getPathFromState(s).split(/\?/);
        const [screenName] = path.split(/\//).reverse();
        if (currentRouteName !== screenName) {
          setRoute(screenName);
        }
      }
    },
    [currentRouteName, setRoute]
  );
}
