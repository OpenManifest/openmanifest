import { actions } from './store';
import type { AppDispatch } from './store';
import { useSession } from './session';

/** Clears the persisted session (credentials, dropzone) and the logged-in Redux state. */
export function logout(dispatch: AppDispatch) {
  useSession.getState().reset();
  dispatch(actions.global.logout());
}
