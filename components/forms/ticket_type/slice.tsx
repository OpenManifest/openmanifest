import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TicketType } from "../../../graphql/schema";

interface ITicketTypeEditState {
  original: TicketType | null;
  fields: {
    name: {
      value: string;
      error: string | null;
    },
    cost: {
      value: number | null;
      error: string | null;
    },
    altitude: {
      value: number;
      error: string | null;
    },
    allowManifestingSelf: {
      value: boolean;
      error: string | null;
    },
    extraIds: {
      value: number[];
      error: string | null;
    }
  }
}

const initialState: ITicketTypeEditState = {
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
    altitude: {
      value: 14000,
      error: null,
    },
    allowManifestingSelf: {
      value: false,
      error: null,
    },
    extraIds: {
      value: [],
      error: null,
    },
  }
};

export default createSlice({
  name: 'ticketTypeForm',
  initialState,
  reducers: {
    setField: <T extends  keyof ITicketTypeEditState["fields"]>(state: ITicketTypeEditState, action: PayloadAction<[T, ITicketTypeEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof ITicketTypeEditState["fields"]>(state: ITicketTypeEditState, action: PayloadAction<[T, ITicketTypeEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (state: ITicketTypeEditState, action: PayloadAction<TicketType>) => {
      state.original = action.payload;
      state.fields.altitude.value = action.payload.altitude!;
      state.fields.cost.value = action.payload.cost!;
      state.fields.allowManifestingSelf.value = action.payload.allowManifestingSelf!;
      state.fields.name.value = action.payload.name!;
    },
    
    reset: (state: ITicketTypeEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


