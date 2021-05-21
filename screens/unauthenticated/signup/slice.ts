import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Federation, License } from "../../../graphql/schema";

interface ISignUpScreenState {
  federation?: Federation | null,
  fields: {
    name: {
      value: string,
      error: string | null,
    },
    phone: {
      value: string,
      error: string | null,
    },
    email: {
      value: string,
      error: string | null,
    },
    exitWeight: {
      value: number,
      error: string | null,
    },
    password: {
      value: string,
      error: string | null,
    },
    passwordConfirmation: {
      value: string,
      error: string | null,
    },
    license: {
      value: License | null,
      error: string | null,
    },
  }
}

export const initialState = {
  federation: null,
  fields: {
    email: {
      value: "",
      error: null,
    },
    password: {
      value: "",
      error: null,
    },
    passwordConfirmation: {
      value: "",
      error: null,
    },
    exitWeight: {
      value: 50,
      error: null,
    },
    name: {
      value: "",
      error: null,
    },
    phone: {
      value: "",
      error: null,
    },
    license: {
      value: null,
      error: null,
    }
  }
} as ISignUpScreenState;

export default createSlice({
  name: 'login',
  initialState,
  reducers: {
    setFederation: (state: ISignUpScreenState, action: PayloadAction<Federation>) => {
      state.federation = action.payload;
    },
    setField: <T extends keyof ISignUpScreenState["fields"]>(state: ISignUpScreenState, action: PayloadAction<[T, ISignUpScreenState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof ISignUpScreenState["fields"]>(state: ISignUpScreenState, action: PayloadAction<[T, ISignUpScreenState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },
    
    reset: (state: ISignUpScreenState) => {
      state.fields = initialState.fields;
    },
  }
});

