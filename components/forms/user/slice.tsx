import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Federation, User } from "../../../graphql/schema";

type Fields = Pick<
  User,
  | "exitWeight"
  | "rigs"
  | "name"
  | "phone"
  | "email"
  | "license"
>;

interface IUserEditState {
  original: User | null;
  open: boolean;
  federation: {
    value: Federation | null,
    error: null,
  },
  fields: {
    [K in keyof Fields] - ?: {
      value: User[K] | null;
      error: string | null;
    }
  }
}

export const initialState: IUserEditState = {
  original: null,
  open: false,
  federation: {
    value: null,
    error: null,
  },
  fields: {
    exitWeight: {
      value: "",
      error: null,
    },
    email: {
      value: "",
      error: null,
    },
    phone: {
      value: "",
      error: null,
    },
    name: {
      value: null,
      error: null,
    },
    rigs: {
      value: [],
      error: null,
    },
    license: {
      value: null,
      error: null,
    }
  }
};


export default createSlice({
  name: 'forms/user',
  initialState,
  reducers: {
    setFederation: (state: IUserEditState, action: PayloadAction<Federation>) => {
      state.federation.value = action.payload;
    },
    setField: <T extends keyof IUserEditState["fields"]>(state: IUserEditState, action: PayloadAction<[T, IUserEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof IUserEditState["fields"]>(state: IUserEditState, action: PayloadAction<[T, IUserEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IUserEditState, action: PayloadAction<boolean | User>) => {
      if (typeof action.payload === "boolean") {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.federation.value = action.payload.license?.federation!;
        for (const key in action.payload) {
          if (key in state.fields) {
            const typedKey = key as keyof typeof initialState["fields"];
            state.fields[typedKey].value = action.payload[typedKey];
          }
        }
      }
    },
    
    reset: (state: IUserEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


