import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ILoginScreenState {
  fields: {
    email: {
      value: string;
      error: string | null;
    };
    password: {
      value: string;
      error: string | null;
    };
  };
}

export const initialState = {
  fields: {
    email: {
      value: '',
      error: null,
    },
    password: {
      value: '',
      error: null,
    },
  },
} as ILoginScreenState;

export default createSlice({
  name: 'login',
  initialState,
  reducers: {
    setEmail: (state: ILoginScreenState, action: PayloadAction<string>) => {
      state.fields.email.value = action.payload;
    },
    setPassword: (state: ILoginScreenState, action: PayloadAction<string>) => {
      state.fields.password.value = action.payload;
    },
    setEmailError: (state: ILoginScreenState, action: PayloadAction<string>) => {
      state.fields.email.error = action.payload;
    },
    setPasswordError: (state: ILoginScreenState, action: PayloadAction<string>) => {
      state.fields.password.error = action.payload;
    },
    reset: (state: ILoginScreenState) => {
      state.fields = initialState.fields;
    },
  },
});
