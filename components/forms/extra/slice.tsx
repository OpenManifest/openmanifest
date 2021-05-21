import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Extra } from "../../../graphql/schema";

interface IExtraEditState {
  original: Extra | null;
  fields: {
    name: {
      value: string;
      error: string | null;
    },
    cost: {
      value: number | null;
      error: string | null;
    },
    ticketTypeIds: {
      value: number[],
      error: null,
    }
  }
}

export const initialState: IExtraEditState = {
  original: null,
  fields: {
    name: {
      value: "",
      error: null,
    },
    cost: {
      value: null,
      error: null,
    },
    ticketTypeIds: {
      value: [],
      error: null,
    }
  }
};

export default createSlice({
  name: 'ExtraForm',
  initialState,
  reducers: {
    setField: <T extends  keyof IExtraEditState["fields"]>(state: IExtraEditState, action: PayloadAction<[T, IExtraEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields.name.error = null;
    },
    setFieldError: <T extends  keyof IExtraEditState["fields"]>(state: IExtraEditState, action: PayloadAction<[T, IExtraEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (state: IExtraEditState, action: PayloadAction<Extra>) => {
      state.original = action.payload;
      state.fields.ticketTypeIds.value = action.payload.ticketTypes.map(({ id }) => Number(id));
      state.fields.cost.value = action.payload.cost;
      state.fields.name.value = action.payload.name!;
    },
    
    reset: (state: IExtraEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


