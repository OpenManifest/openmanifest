import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FieldItem } from "../rig_inspection_template/slice";



interface IRigInspectionEditState {
  fields: FieldItem[],
  open: boolean;
  ok: boolean;
}

export const initialState: IRigInspectionEditState = {
  fields: [],
  open: false,
  ok: false
};


export default createSlice({
  name: 'forms/rig',
  initialState,
  reducers: {

    setOk: (state: IRigInspectionEditState, action: PayloadAction<boolean>) => {
      state.ok = action.payload;
    },
    setField: (state: IRigInspectionEditState, action: PayloadAction<[number, FieldItem]>) => {
      const [index, item] = action.payload;

      console.log({ item, index, fields: state.fields });
      state.fields = state.fields.map((field, idx) => idx === index ? item : field);
    },

    setFields: (state: IRigInspectionEditState, action: PayloadAction<string>) => {
      try {
        state.fields = JSON.parse(action.payload)
      } catch (error) {
        console.error("Failed to read rig inspection template", error.message, action.payload);
      }
    },
    
    reset: (state: IRigInspectionEditState) => {
      state.fields = initialState.fields;
      state.ok = initialState.ok;
    },
  }
});


