import * as React from 'react';
import { NavigationState, getPathFromState } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from 'app/state/store';

import { actions } from 'app/state';

export default function useRouteChange() {
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  return React.useCallback(
    (s?: NavigationState) => {
      if (s) {
        const [path] = getPathFromState(s).split(/\?/);
        const [screenName] = path.split(/\//).reverse();
        if (state.currentRouteName !== screenName) {
          dispatch(actions.global.setCurrentRouteName(screenName));
        }
      }
    },
    [dispatch, state.currentRouteName]
  );
}
