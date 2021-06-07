import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Slot } from "../../../graphql/schema";


type Fields = Pick<
  Slot,
  | "jumpType"
  | "load"
  | "ticketType"
  | "rig"
  | "user"
  | "exitWeight"
  | "extras"
  | "passengerExitWeight"
  | "passengerName"
>

interface ISlotEditState {
  original: Slot | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: Fields[K] | null;
      error: string | null;
    }
  }
}

export const initialState: ISlotEditState = {
  original: null,
  fields: {
    jumpType: {
      value: null,
      error: null,
    },
    extras: {
      value: [],
      error: null,
    },
    load: {
      value: null,
      error: null,
    },
    rig: {
      value: null,
      error: null,
    },
    ticketType: {
      value: null,
      error: null,
    },
    user: {
      value: null,
      error: null,
    },
    exitWeight: {
      value: null,
      error: null,
    },
    passengerName: {
      value: null,
      error: null,
    },
    passengerExitWeight: {
      value: null,
      error: null,
    },
  }
};


export default createSlice({
  name: 'slotForm',
  initialState,
  reducers: {
    setField: <T extends keyof ISlotEditState["fields"]>(state: ISlotEditState, action: PayloadAction<[T, ISlotEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof ISlotEditState["fields"]>(state: ISlotEditState, action: PayloadAction<[T, ISlotEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (state: ISlotEditState, action: PayloadAction<Slot>) => {
      state.original = action.payload;
      for (const key in action.payload) {
        if (key in state.fields) {
          const typedKey = key as keyof typeof initialState["fields"];
          state.fields[typedKey].value = action.payload[typedKey];
        }
      }
    },
    
    reset: (state: ISlotEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


