import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoadDetailsFragment } from 'app/api/operations';

export type LoadFields = Pick<
  LoadDetailsFragment,
  'name' | 'gca' | 'dispatchAt' | 'isOpen' | 'loadMaster' | 'pilot' | 'maxSlots' | 'plane'
>;

interface ILoadEditState {
  original: LoadDetailsFragment | null;
  open: boolean;
  fields: {
    [K in keyof LoadFields]-?: {
      value: LoadDetailsFragment[K] | null;
      error: string | null;
    };
  };
}

export const initialState: ILoadEditState = {
  original: null,
  open: false,
  fields: {
    name: {
      value: '',
      error: null,
    },
    gca: {
      value: null,
      error: null,
    },
    dispatchAt: {
      value: null,
      error: null,
    },
    isOpen: {
      value: true,
      error: null,
    },
    loadMaster: {
      value: null,
      error: null,
    },
    pilot: {
      value: null,
      error: null,
    },
    plane: {
      value: null,
      error: null,
    },
    maxSlots: {
      value: 4,
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/load',
  initialState,
  reducers: {
    setField: <T extends keyof ILoadEditState['fields']>(
      state: ILoadEditState,
      action: PayloadAction<[T, ILoadEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof ILoadEditState['fields']>(
      state: ILoadEditState,
      action: PayloadAction<[T, ILoadEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: ILoadEditState, action: PayloadAction<boolean | LoadDetailsFragment>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.dispatchAt.value = action.payload.dispatchAt;
        state.fields.gca.value = action.payload.gca;
        state.fields.isOpen.value = action.payload.isOpen;
        state.fields.loadMaster.value = action.payload.loadMaster;
        state.fields.maxSlots.value = action.payload.maxSlots;
        state.fields.name.value = action.payload.name;
        state.fields.pilot.value = action.payload.pilot;
        state.fields.plane.value = action.payload.plane;
      }
    },

    reset: (state: ILoadEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
