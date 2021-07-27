import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Extra } from '../../../api/schema.d';

export type ExtraFields = Pick<Extra, 'name' | 'cost' | 'ticketTypes'>;
interface IExtraEditState {
  original: Extra | null;
  open: boolean;
  fields: {
    [K in keyof ExtraFields]-?: {
      value: Extra[K] | null;
      error: string | null;
    };
  };
}

export const initialState: IExtraEditState = {
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
    ticketTypes: {
      value: [],
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/extra',
  initialState,
  reducers: {
    setField: <T extends keyof IExtraEditState['fields']>(
      state: IExtraEditState,
      action: PayloadAction<[T, IExtraEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields.name.error = null;
    },
    setFieldError: <T extends keyof IExtraEditState['fields']>(
      state: IExtraEditState,
      action: PayloadAction<[T, IExtraEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOpen: (state: IExtraEditState, action: PayloadAction<boolean | Extra>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.ticketTypes.value = action.payload.ticketTypes;
        state.fields.cost.value = action.payload.cost;
        state.fields.name.value = action.payload.name || '';
      }
    },

    reset: (state: IExtraEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
