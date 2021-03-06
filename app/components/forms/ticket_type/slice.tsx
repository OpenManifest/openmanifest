import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TicketTypeEssentialsFragment } from 'app/api/operations';

export type TicketTypeFields = Pick<
  TicketTypeEssentialsFragment,
  'name' | 'cost' | 'isTandem' | 'allowManifestingSelf' | 'altitude' | 'extras'
>;

interface ITicketTypeEditState {
  original: TicketTypeEssentialsFragment | null;
  open: boolean;
  fields: {
    [K in keyof TicketTypeFields]-?: {
      value: TicketTypeEssentialsFragment[K] | null;
      error: string | null;
    };
  };
}

export const initialState: ITicketTypeEditState = {
  original: null,
  open: false,
  fields: {
    name: {
      value: '',
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
  },
};

export default createSlice({
  name: 'forms/ticketType',
  initialState,
  reducers: {
    setField: <T extends keyof ITicketTypeEditState['fields']>(
      state: ITicketTypeEditState,
      action: PayloadAction<[T, ITicketTypeEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof ITicketTypeEditState['fields']>(
      state: ITicketTypeEditState,
      action: PayloadAction<[T, ITicketTypeEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (
      state: ITicketTypeEditState,
      action: PayloadAction<TicketTypeEssentialsFragment>
    ) => {
      state.original = action.payload;
      state.open = true;
      state.fields.altitude.value = action.payload.altitude || 0;
      state.fields.cost.value = action.payload.cost || 0;
      state.fields.allowManifestingSelf.value = action.payload.allowManifestingSelf || false;
      state.fields.name.value = action.payload.name || '';
    },

    setOpen: (
      state: ITicketTypeEditState,
      action: PayloadAction<boolean | TicketTypeEssentialsFragment>
    ) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.altitude.value = action.payload.altitude || 0;
        state.fields.cost.value = action.payload.cost || 0;
        state.fields.allowManifestingSelf.value = action.payload.allowManifestingSelf || false;
        state.fields.name.value = action.payload.name || '';
      }
    },

    reset: (state: ITicketTypeEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
