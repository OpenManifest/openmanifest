import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RigInspection, ChecklistValue } from "../../../graphql/schema";

type FieldItem = Pick<ChecklistValue, "checklistItem" | "value"> & { id?: string | null}


interface IRigInspectionEditState {
  original: RigInspection | null;
  fields: FieldItem[],
}

const initialState: IRigInspectionEditState = {
  original: null,
  fields: []
};


export default createSlice({
  name: 'rigInspectionForm',
  initialState,
  reducers: {
    setItem: (state: IRigInspectionEditState, action: PayloadAction<FieldItem>) => {
      state.fields = [
        ...state.fields.filter((item) => item.checklistItem.id !== action.payload.checklistItem.id),
        action.payload
      ]
    },

    setOriginal: (state: IRigInspectionEditState, action: PayloadAction<RigInspection>) => {
      state.original = action.payload;
      state.fields = action.payload.checklistValues;
    },
    
    reset: (state: IRigInspectionEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


