import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Slot } from '../../../api/schema.d';

export type ManifestUserFields = Pick<
  Slot,
  | 'jumpType'
  | 'load'
  | 'ticketType'
  | 'rig'
  | 'dropzoneUser'
  | 'exitWeight'
  | 'extras'
  | 'passengerExitWeight'
  | 'passengerName'
>;

interface ISlotEditState {
  original: Slot | null;
  open: boolean;
  fields: {
    [K in keyof ManifestUserFields]-?: {
      value: ManifestUserFields[K] | null;
      error: string | null;
    };
  };
}

export const initialState: ISlotEditState = {
  original: null,
  open: false,
  fields: {
    jumpType: {
      value: null,
      error: null,
    },
    extras: {
      value: [],
      error: null,
    },
    load: {
      value: null,
      error: null,
    },
    rig: {
      value: null,
      error: null,
    },
    ticketType: {
      value: null,
      error: null,
    },
    dropzoneUser: {
      value: null,
      error: null,
    },
    exitWeight: {
      value: null,
      error: null,
    },
    passengerName: {
      value: null,
      error: null,
    },
    passengerExitWeight: {
      value: null,
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/manifest',
  initialState,
  reducers: {
    setField: <T extends keyof ISlotEditState['fields']>(
      state: ISlotEditState,
      action: PayloadAction<[T, ISlotEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      if (field in state.fields) {
        state.fields[field].value = value;
        state.fields[field].error = null;
      }
    },
    setFieldError: <T extends keyof ISlotEditState['fields']>(
      state: ISlotEditState,
      action: PayloadAction<[T, ISlotEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      if (field in state.fields) {
        state.fields[field].error = error;
      }
    },

    setOpen: (state: ISlotEditState, action: PayloadAction<boolean | Slot>) => {
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

    reset: (state: ISlotEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
