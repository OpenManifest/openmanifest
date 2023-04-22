import * as users from './authenticated/user/user_list/slice';
import * as login from './unauthenticated/login/slice';
import * as manifest from './authenticated/dropzone/manifest/slice';
import * as signup from './unauthenticated/signup/slice';
import * as dropzoneWizard from './wizards/dropzone_wizard/slice';

export const initialState = {
  manifest: manifest.initialState,
  users: users.initialState,
  login: login.initialState,
  signup: signup.initialState,
  dropzoneWizard: dropzoneWizard.initialState,
};
export const reducers = {
  manifest: manifest.default,
  users: users.default,
  login: login.default,
  signup: signup.default,
  dropzoneWizard: dropzoneWizard.default,
};
