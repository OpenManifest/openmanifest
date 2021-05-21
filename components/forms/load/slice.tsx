import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Load } from "../../../graphql/schema";


type Fields = Pick<
  Load,
  | "name"
  | "gca"
  | "dispatchAt"
  | "isOpen"
  | "loadMaster"
  | "pilot"
  | "maxSlots"
  | "plane"
>;

interface ILoadEditState {
  original: Load | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: Load[K] | null;
      error: string | null;
    }
  }
}

export const initialState: ILoadEditState = {
  original: null,
  fields: {
    name: {
      value: "",
      error: null,
    },
    gca: {
      value: null,
      error: null,
    },
    dispatchAt: {
      value: null,
      error: null,
    },
    isOpen: {
      value: true,
      error: null,
    },
    loadMaster: {
      value: null,
      error: null,
    },
    pilot: {
      value: null,
      error: null,
    },
    plane: {
      value: null,
      error: null,
    },
    maxSlots: {
      value: 4,
      error: null,
    },
  }
};


export default createSlice({
  name: 'loadForm',
  initialState,
  reducers: {
    setField: <T extends keyof ILoadEditState["fields"]>(state: ILoadEditState, action: PayloadAction<[T, ILoadEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof ILoadEditState["fields"]>(state: ILoadEditState, action: PayloadAction<[T, ILoadEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (state: ILoadEditState, action: PayloadAction<Load>) => {
      state.original = action.payload;
      for (const key in action.payload) {
        if (key in state.fields) {
          const typedKey = key as keyof typeof initialState["fields"];
          state.fields[typedKey].value = action.payload[typedKey];
        }
      }
    },
    
    reset: (state: ILoadEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


