import * as users from './authenticated/users/slice';
import * as login from './unauthenticated/login/slice';
import * as manifest from './authenticated/manifest/slice';
import * as signup from './unauthenticated/signup/slice';

export const initialState = {
  manifest: manifest.initialState,
  users: users.initialState,
  login: login.initialState,
  signup: signup.initialState,
};
export const reducers = {
  manifest: manifest.default,
  users: users.default,
  login: login.default,
  signup: signup.default,
};
