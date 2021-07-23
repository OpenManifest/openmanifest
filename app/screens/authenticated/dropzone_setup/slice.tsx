import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dropzone } from "../../../api/schema.d";
interface IDropzoneWizardState {
  open: boolean;
  complete: boolean;
  fields: {
    dropzone: {
      value: Dropzone;
      error: string | null;
    },
  }
}

export const initialState: IDropzoneWizardState = {
  open: false,
  complete: false,
  fields: {
    dropzone: {
      value: null,
      error: null,
    },
  }
};

export default createSlice({
  name: 'forms/dropzoneWizard',
  initialState,
  reducers: {
    setField: <T extends  keyof IDropzoneWizardState["fields"]>(state: IDropzoneWizardState, action: PayloadAction<[T, IDropzoneWizardState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
    },
    setFieldError: <T extends  keyof IDropzoneWizardState["fields"]>(state: IDropzoneWizardState, action: PayloadAction<[T, IDropzoneWizardState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IDropzoneWizardState, action: PayloadAction<boolean | Dropzone>) => {
      if (typeof action.payload === "boolean") {
        state.open = action.payload;
        state.fields = initialState.fields;
      } else {
        state.fields.dropzone.value = action.payload;
        state.open = true;
      }
    },

    complete: (state: IDropzoneWizardState, action: PayloadAction<boolean | undefined>) => {
      state.complete = action.payload !== undefined ? action.payload : true;
    },
    
    reset: (state: IDropzoneWizardState) => {
      state.fields = initialState.fields;
    },
  }
});


