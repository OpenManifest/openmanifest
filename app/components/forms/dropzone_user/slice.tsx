import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DropzoneUser } from '../../../api/schema.d';

type Fields = Pick<DropzoneUser, 'role' | 'expiresAt'>;

interface IDropzoneUserEditState {
  original: DropzoneUser | null;
  open: boolean;
  fields: {
    [K in keyof Fields]-?: {
      value: DropzoneUser[K] | null;
      error: string | null;
    };
  };
}

export const initialState: IDropzoneUserEditState = {
  original: null,
  open: false,
  fields: {
    role: {
      value: null,
      error: null,
    },
    expiresAt: {
      value: null,
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/dropzoneUser',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneUserEditState['fields']>(
      state: IDropzoneUserEditState,
      action: PayloadAction<[T, IDropzoneUserEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof IDropzoneUserEditState['fields']>(
      state: IDropzoneUserEditState,
      action: PayloadAction<[T, IDropzoneUserEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IDropzoneUserEditState, action: PayloadAction<boolean | DropzoneUser>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        Object.keys(action.payload).forEach((key) => {
          const payloadKey = key as keyof typeof action.payload;
          if (payloadKey in state.fields) {
            const typedKey = payloadKey as keyof typeof initialState['fields'];
            state.fields[typedKey].value = action.payload[typedKey as typeof payloadKey];
          }
        });
      }
    },

    reset: (state: IDropzoneUserEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
