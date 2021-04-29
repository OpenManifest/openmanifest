import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DropzoneUser, Transaction } from "../../../graphql/schema";

type Fields = Pick<
  Transaction,
  | "amount"
  | "status"
  | "message"
>;

interface IDropzoneEditState {
  original: DropzoneUser | null;
  fields: {
    [K in keyof Fields] - ?: {
      value: Transaction[K] | null;
      error: string | null;
    }
  }
}

const initialState: IDropzoneEditState = {
  original: null,
  fields: {
    amount: {
      value: null,
      error: null,
    },
    status: {
      value: "deposit",
      error: null,
    },
    message: {
      value: "",
      error: null,
    },
  }
};

export default createSlice({
  name: 'creditsForm',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneEditState["fields"]>(state: IDropzoneEditState, action: PayloadAction<[T, IDropzoneEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof IDropzoneEditState["fields"]>(state: IDropzoneEditState, action: PayloadAction<[string, string]>) => {
      const [field, error] = action.payload;

      if (field in state.fields && (state.fields[field as T]).error) {
        state.fields[field as T].error = error;
      }
    },

    setOriginal: (state: IDropzoneEditState, action: PayloadAction<DropzoneUser>) => {
      state.original = action.payload;
    },
    
    reset: (state: IDropzoneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


