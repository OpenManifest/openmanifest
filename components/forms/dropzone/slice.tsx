import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dropzone, Federation } from "../../../graphql/schema.d";

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
  open: boolean;
  fields: {
    [K in keyof Fields] - ?: {
      value: Dropzone[K] | null;
      error: string | null;
    }
  }
}

export const initialState: IDropzoneEditState = {
  original: null,
  open: false,
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
  name: 'forms/dropzone',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneEditState["fields"]>(state: IDropzoneEditState, action: PayloadAction<[T, IDropzoneEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof IDropzoneEditState["fields"]>(state: IDropzoneEditState, action: PayloadAction<[string, string]>) => {
      const [field, error] = action.payload;

      if (field in state.fields && "error" in (state.fields[field as T])) {
        state.fields[field as T].error = error;
      }
    },

    setOpen: (state: IDropzoneEditState, action: PayloadAction<boolean | Dropzone>) => {
      if (typeof action.payload === "boolean") {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        for (const key in action.payload) {
          if (key in state.fields) {
            const typedKey = key as keyof typeof initialState["fields"];
            state.fields[typedKey].value = action.payload[typedKey];
          }
        }
      }
    },
    
    reset: (state: IDropzoneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


