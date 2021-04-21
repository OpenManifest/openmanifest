import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plane } from "../../../graphql/schema";

interface IPlaneEditState {
  original: Plane | null;
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

const initialState: IPlaneEditState = {
  original: null,
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

    setOriginal: (state: IPlaneEditState, action: PayloadAction<Plane>) => {
      state.original = action.payload;
      state.fields.hours.value = action.payload.hours!;
      state.fields.minSlots.value = action.payload.minSlots!;
      state.fields.maxSlots.value = action.payload.maxSlots!;
      state.fields.name.value = action.payload.name!;
      state.fields.registration.value = action.payload.registration!;
      state.fields.nextMaintenanceHours.value = action.payload.nextMaintenanceHours!;
    },
    
    reset: (state: IPlaneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


