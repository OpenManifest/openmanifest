import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TicketType } from "../../../graphql/schema";

type Fields = Pick<
  TicketType,
  | "name"
  | "cost"
  | "isTandem"
  | "allowManifestingSelf"
  | "altitude"
  | "extras"
>;

interface ITicketTypeEditState {
  original: TicketType | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: TicketType[K] | null;
      error: string | null;
    }
  }
}


export const initialState: ITicketTypeEditState = {
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
    isTandem: {
      value: false,
      error: null,
    },
    extras: {
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


