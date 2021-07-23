import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Federation, User, DropzoneUser } from "../../../api/schema.d";

type Fields = Pick<
  User,
  | "exitWeight"
  | "name"
  | "phone"
  | "email"
  | "license"
> & Pick<DropzoneUser, "role">;

interface IGhostEditState {
  original: User | null;
  open: boolean;
  federation: {
    value: Federation | null,
    error: null,
  },
  fields: {
    [K in keyof Fields] - ?: {
      value: Fields[K] | null;
      error: string | null;
    }
  }
}

export const initialState: IGhostEditState = {
  original: null,
  open: false,
  federation: {
    value: null,
    error: null,
  },
  fields: {
    exitWeight: {
      value: null,
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
    role: {
      value: null,
      error: null,
    },
    license: {
      value: null,
      error: null,
    }
  }
};


export default createSlice({
  name: 'forms/ghost',
  initialState,
  reducers: {
    setFederation: (state: IGhostEditState, action: PayloadAction<Federation>) => {
      state.federation.value = action.payload;
    },
    setField: <T extends keyof IGhostEditState["fields"]>(state: IGhostEditState, action: PayloadAction<[T, IGhostEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;
      if (field in state.fields) {
        state.fields[field].value = value;
        state.fields[field].error = null;
      }
    },
    setFieldError: <T extends  keyof IGhostEditState["fields"]>(state: IGhostEditState, action: PayloadAction<[T, IGhostEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      if (field in state) {
        state.fields[field].error = error;
      } else {
        console.error('Cannot set error on ', field);
      }
      
    },

    setOpen: (state: IGhostEditState, action: PayloadAction<boolean | User>) => {
      console.log('Setting open');
      console.log(action.payload);
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
    
    reset: (state: IGhostEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


