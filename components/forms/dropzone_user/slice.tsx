import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DropzoneUser } from "../../../graphql/schema";


type Fields = Pick<
  DropzoneUser,
  | "credits"
  | "role"
  | "expiresAt"
>;

interface IDropzoneUserEditState {
  original: DropzoneUser | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: DropzoneUser[K] | null;
      error: string | null;
    }
  }
}

const initialState: IDropzoneUserEditState = {
  original: null,
  fields: {
    role: {
      value: null,
      error: null,
    },
    credits: {
      value: 0,
      error: null,
    },
    expiresAt: {
      value: null,
      error: null,
    },
  }
};


export default createSlice({
  name: 'dropzoneUserForm',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneUserEditState["fields"]>(state: IDropzoneUserEditState, action: PayloadAction<[T, IDropzoneUserEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof IDropzoneUserEditState["fields"]>(state: IDropzoneUserEditState, action: PayloadAction<[T, IDropzoneUserEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (state: IDropzoneUserEditState, action: PayloadAction<DropzoneUser>) => {
      state.original = action.payload;
      for (const key in action.payload) {
        if (key in state.fields) {
          const typedKey = key as keyof typeof initialState["fields"];
          state.fields[typedKey].value = action.payload[typedKey];
        }
      }
    },
    
    reset: (state: IDropzoneUserEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


