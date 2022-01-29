import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';

type Fields = Pick<DropzoneUserEssentialsFragment, 'role' | 'expiresAt'>;

interface IDropzoneUserEditState {
  original: DropzoneUserEssentialsFragment | null;
  open: boolean;
  fields: {
    [K in keyof Fields]-?: {
      value: DropzoneUserEssentialsFragment[K] | null;
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

    setOpen: (
      state: IDropzoneUserEditState,
      action: PayloadAction<boolean | DropzoneUserEssentialsFragment>
    ) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.role.value = action.payload.role;
        state.fields.expiresAt.value = action.payload.expiresAt;
      }
    },

    reset: (state: IDropzoneUserEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
