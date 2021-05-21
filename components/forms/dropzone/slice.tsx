import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dropzone, Federation } from "../../../graphql/schema";

type Fields = Pick<
  Dropzone,
  | "federation"
  | "name"
  | "secondaryColor"
  | "primaryColor"
  | "banner"
  | "isPublic"
  | "isCreditSystemEnabled"
>;

interface IDropzoneEditState {
  original: Dropzone | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: Dropzone[K] | null;
      error: string | null;
    }
  }
}

export const initialState: IDropzoneEditState = {
  original: null,
  fields: {
    federation: {
      value: null,
      error: null,
    },
    name: {
      value: "",
      error: null,
    },
    secondaryColor: {
      value: "",
      error: null,
    },
    primaryColor: {
      value: "",
      error: null,
    },
    banner: {
      value: "",
      error: null
    },
    isCreditSystemEnabled: {
      value: false,
      error: null,
    },
    isPublic: {
      value: false,
      error: null,
    }
  }
};

export default createSlice({
  name: 'dropzone',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneEditState["fields"]>(state: IDropzoneEditState, action: PayloadAction<[T, IDropzoneEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof IDropzoneEditState["fields"]>(state: IDropzoneEditState, action: PayloadAction<[string, string]>) => {
      const [field, error] = action.payload;

      if (field in state.fields && (state.fields[field as T]).error) {
        state.fields[field as T].error = error;
      }
    },

    setOriginal: (state: IDropzoneEditState, action: PayloadAction<Dropzone>) => {
      state.original = action.payload;
      for (const key in action.payload) {
        if (key in state.fields) {
          const typedKey = key as keyof typeof initialState["fields"];
          state.fields[typedKey].value = action.payload[typedKey];
        }
      }
    },
    
    reset: (state: IDropzoneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


