import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SlotDetailsFragment, SlotExhaustiveFragment } from 'app/api/operations';

export type ManifestUserFields = Pick<
  SlotExhaustiveFragment,
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
  original: SlotDetailsFragment | null;
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

    setOpen: (state: ISlotEditState, action: PayloadAction<boolean | SlotDetailsFragment>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.jumpType.value = action.payload.jumpType;
        state.fields.extras.value = action.payload.extras;
        state.fields.rig.value = action.payload.rig;
        state.fields.ticketType.value = action.payload.ticketType;
        state.fields.dropzoneUser.value = action.payload.dropzoneUser;
        state.fields.exitWeight.value = action.payload.exitWeight;
        state.fields.passengerName.value = action.payload.passengerName;
        state.fields.passengerExitWeight.value = action.payload.passengerExitWeight;
      }
    },

    reset: (state: ISlotEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
