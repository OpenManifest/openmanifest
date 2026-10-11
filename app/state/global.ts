import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DropzoneExtensiveFragment, UserDetailedFragment } from '../api/operations';

interface IGlobalState {
  authenticated: boolean;
  // @deprecated
  currentUser: UserDetailedFragment | null;
  // @deprecated
  currentDropzone: DropzoneExtensiveFragment | null;
  permissions: string[];
}

export const initialState: IGlobalState = {
  currentUser: null,
  currentDropzone: null,
  permissions: [],
  authenticated: false,
};
export default createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAuthenticated: (state: IGlobalState, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
    },
    setUser: (state: IGlobalState, action: PayloadAction<UserDetailedFragment>) => {
      state.currentUser = action.payload;
    },
    setPermissions: (state: IGlobalState, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    setDropzone: (state: IGlobalState, action: PayloadAction<DropzoneExtensiveFragment | null>) => {
      state.currentDropzone = action.payload;
    },
    logout: (state: IGlobalState) => {
      console.debug('Logout called?');
      Object.keys(initialState).forEach((key) => {
        const payloadKey = key as keyof Required<IGlobalState>;
        if (payloadKey in state) {
          const typedKey = payloadKey as keyof typeof initialState;

          // @ts-ignore We know this is right
          state[payloadKey] = initialState[typedKey];
        }
      });
    },
  },
});
