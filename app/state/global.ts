import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IGlobalState {
  authenticated: boolean;
}

export const initialState: IGlobalState = {
  authenticated: false,
};
export default createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAuthenticated: (state: IGlobalState, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
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
