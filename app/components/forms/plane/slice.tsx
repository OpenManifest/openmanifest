import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plane } from "../../../api/schema.d";

interface IPlaneEditState {
  original: Plane | null;
  open: boolean;
  fields: {
    name: {
      value: string;
      error: string | null;
    },
    registration: {
      value: string;
      error: string | null;
    },
    minSlots: {
      value: number;
      error: string | null;
    },
    maxSlots: {
      value: number;
      error: string | null;
    },
    hours: {
      value: number | null;
      error: string | null;
    },
    nextMaintenanceHours: {
      value: number | null;
      error: string | null;
    },
  }
}

export const initialState: IPlaneEditState = {
  original: null,
  open: false,
  fields: {
    name: {
      value: "",
      error: null,
    },
    registration: {
      value: "",
      error: null
    },
    minSlots: {
      value: 0,
      error: null
    },
    maxSlots: {
      value: 4,
      error: null
    },
    hours: {
      value: null,
      error: null
    },
    nextMaintenanceHours: {
      value: null,
      error: null
    }
  }
};

export default createSlice({
  name: 'Plane',
  initialState,
  reducers: {
    setField: <T extends  keyof IPlaneEditState["fields"]>(state: IPlaneEditState, action: PayloadAction<[T, IPlaneEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields.name.error = null;
    },
    setFieldError: <T extends  keyof IPlaneEditState["fields"]>(state: IPlaneEditState, action: PayloadAction<[T, IPlaneEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IPlaneEditState, action: PayloadAction<boolean | Plane>) => {
      if (typeof action.payload === "boolean") {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.hours.value = action.payload.hours!;
        state.fields.minSlots.value = action.payload.minSlots!;
        state.fields.maxSlots.value = action.payload.maxSlots!;
        state.fields.name.value = action.payload.name!;
        state.fields.registration.value = action.payload.registration!;
        state.fields.nextMaintenanceHours.value = action.payload.nextMaintenanceHours!;
      }
    },
    
    reset: (state: IPlaneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


