import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plane } from '../../../api/schema.d';

export type PlaneFields = Pick<
  Plane,
  'name' | 'registration' | 'minSlots' | 'maxSlots' | 'hours' | 'nextMaintenanceHours'
>;

interface IPlaneEditState {
  original: Plane | null;
  open: boolean;
  fields: {
    [K in keyof PlaneFields]-?: {
      value: Plane[K] | null;
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
    hours: {
      value: null,
      error: null,
    },
    nextMaintenanceHours: {
      value: null,
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

    setOpen: (state: IPlaneEditState, action: PayloadAction<boolean | Plane>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.hours.value = action.payload.hours || 0;
        state.fields.minSlots.value = action.payload.minSlots || 0;
        state.fields.maxSlots.value = action.payload.maxSlots || 3;
        state.fields.name.value = action.payload.name || '';
        state.fields.registration.value = action.payload.registration || '';
        state.fields.nextMaintenanceHours.value = action.payload.nextMaintenanceHours || 0;
      }
    },

    reset: (state: IPlaneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
