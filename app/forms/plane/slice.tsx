import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlaneEssentialsFragment } from 'app/api/operations';

export type PlaneFields = Omit<PlaneEssentialsFragment, 'id' | '__typename'>;

interface IPlaneEditState {
  original: PlaneEssentialsFragment | null;
  open: boolean;
  fields: {
    [K in keyof PlaneFields]-?: {
      value: PlaneEssentialsFragment[K] | null;
      error: string | null;
    };
  };
}

export const initialState: IPlaneEditState = {
  original: null,
  open: false,
  fields: {
    name: {
      value: '',
      error: null,
    },
    registration: {
      value: '',
      error: null,
    },
    minSlots: {
      value: 0,
      error: null,
    },
    maxSlots: {
      value: 4,
      error: null,
    },
  },
};

export default createSlice({
  name: 'Plane',
  initialState,
  reducers: {
    setField: <T extends keyof IPlaneEditState['fields']>(
      state: IPlaneEditState,
      action: PayloadAction<[T, IPlaneEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields.name.error = null;
    },
    setFieldError: <T extends keyof IPlaneEditState['fields']>(
      state: IPlaneEditState,
      action: PayloadAction<[T, IPlaneEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IPlaneEditState, action: PayloadAction<boolean | PlaneEssentialsFragment>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.minSlots.value = action.payload.minSlots || 0;
        state.fields.maxSlots.value = action.payload.maxSlots || 3;
        state.fields.name.value = action.payload.name || '';
        state.fields.registration.value = action.payload.registration || '';
      }
    },

    setOriginal: (state: IPlaneEditState, action: PayloadAction<PlaneEssentialsFragment>) => {
      state.original = action.payload;
      state.open = true;
      state.fields.minSlots.value = action.payload.minSlots || 0;
      state.fields.maxSlots.value = action.payload.maxSlots || 3;
      state.fields.name.value = action.payload.name || '';
      state.fields.registration.value = action.payload.registration || '';
    },

    reset: (state: IPlaneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
