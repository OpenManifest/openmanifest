import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rig, User } from "../../../api/schema.d";

interface IUserWizardState {
  open: boolean;
  fields: {
    user: {
      value: User;
      error: string | null;
    },
    rig: {
      value: Rig;
      error: string | null;
    },
  }
}

export const initialState: IUserWizardState = {
  open: false,
  fields: {
    user: {
      value: null,
      error: null,
    },
    rig: {
      value: null,
      error: null,
    }
  }
};

export default createSlice({
  name: 'forms/userWizard',
  initialState,
  reducers: {
    setField: <T extends  keyof IUserWizardState["fields"]>(state: IUserWizardState, action: PayloadAction<[T, IUserWizardState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
    },
    setFieldError: <T extends  keyof IUserWizardState["fields"]>(state: IUserWizardState, action: PayloadAction<[T, IUserWizardState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IUserWizardState, action: PayloadAction<boolean | User>) => {
      if (typeof action.payload === "boolean") {
        state.open = action.payload;
        state.fields = initialState.fields;
      } else {
        state.fields.user.value = action.payload;
        state.open = true;
      }
    },
    
    reset: (state: IUserWizardState) => {
      state.fields = initialState.fields;
    },
  }
});


