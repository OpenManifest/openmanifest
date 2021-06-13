import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rig } from "../../../graphql/schema";


type Fields = Pick<
  Rig,
  | "make"
  | "model"
  | "serial"
  | "canopySize"
  | "repackExpiresAt"
  | "rigType"
>;

interface IRigEditState {
  original: Rig | null;
  open: boolean;
  fields: {
    [K in keyof Fields] - ?: {
      value: Rig[K] | null;
      error: string | null;
    }
  }
}

export const initialState: IRigEditState = {
  original: null,
  open: false,
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
    rigType: {
      value: "sport",
      error: null,
    },
  }
};


export default createSlice({
  name: 'forms/rig',
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

    setOpen: (state: IRigEditState, action: PayloadAction<boolean | Rig>) => {
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
    
    reset: (state: IRigEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


