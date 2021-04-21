import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rig } from "../../../graphql/schema";


type Fields = Pick<
  Rig,
  | "make"
  | "model"
  | "serial"
  | "canopySize"
  | "repackExpiresAt"
>;

interface IRigEditState {
  original: Rig | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: Rig[K] | null;
      error: string | null;
    }
  }
}

const initialState: IRigEditState = {
  original: null,
  fields: {
    make: {
      value: "",
      error: null,
    },
    model: {
      value: "",
      error: null,
    },
    serial: {
      value: "",
      error: null,
    },
    repackExpiresAt: {
      value: null,
      error: null,
    },
    canopySize: {
      value: null,
      error: null,
    },
  }
};


export default createSlice({
  name: 'rigForm',
  initialState,
  reducers: {
    setField: <T extends keyof IRigEditState["fields"]>(state: IRigEditState, action: PayloadAction<[T, IRigEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof IRigEditState["fields"]>(state: IRigEditState, action: PayloadAction<[T, IRigEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (state: IRigEditState, action: PayloadAction<Rig>) => {
      state.original = action.payload;
      for (const key in action.payload) {
        if (key in state.fields) {
          const typedKey = key as keyof typeof initialState["fields"];
          state.fields[typedKey].value = action.payload[typedKey];
        }
      }
    },
    
    reset: (state: IRigEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


