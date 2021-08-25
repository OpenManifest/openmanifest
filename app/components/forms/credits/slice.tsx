import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DropzoneUser, Transaction, TransactionType } from '../../../api/schema.d';

type Fields = Pick<Transaction, 'amount' | 'transactionType' | 'message'>;

interface IDropzoneEditState {
  original: DropzoneUser | null;
  open: boolean;
  fields: {
    [K in keyof Fields]-?: {
      value: Transaction[K] | null;
      error: string | null;
    };
  };
}

export const initialState: IDropzoneEditState = {
  original: null,
  open: false,
  fields: {
    amount: {
      value: null,
      error: null,
    },
    transactionType: {
      value: TransactionType.Deposit,
      error: null,
    },
    message: {
      value: '',
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/credits',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneEditState['fields']>(
      state: IDropzoneEditState,
      action: PayloadAction<[T, IDropzoneEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      console.log({ field });
      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof IDropzoneEditState['fields']>(
      state: IDropzoneEditState,
      action: PayloadAction<[string, string]>
    ) => {
      const [field, error] = action.payload;

      if (field in state.fields && 'error' in state.fields[field as T]) {
        state.fields[field as T].error = error;
      }
    },
    setOpen: (state: IDropzoneEditState, action: PayloadAction<DropzoneUser | boolean>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
      }
    },

    reset: (state: IDropzoneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
