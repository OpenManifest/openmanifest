import { actions } from './store';
import type { AppDispatch } from './store';
import { useSession } from './session';
import { useThemeOverrides } from '../theme/overrides';

/** Clears the persisted session (credentials, dropzone) and the logged-in Redux state. */
export function logout(dispatch: AppDispatch) {
  useSession.getState().reset();
  useThemeOverrides.getState().setPrimary(null);
  dispatch(actions.global.logout());
}
