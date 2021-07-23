import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SlotUser, Slot, DropzoneUser } from '../../../api/schema.d';

interface IFields extends Pick<Slot, 'jumpType' | 'load' | 'ticketType' | 'extras'> {
  users: SlotUser[];
}

interface ISlotEditState {
  original: IFields | null;
  open: boolean;
  fields: {
    [K in keyof IFields]-?: {
      value: IFields[K] | null;
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
    ticketType: {
      value: null,
      error: null,
    },
    users: {
      value: [],
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/manifestGroup',
  initialState,
  reducers: {
    setField: <T extends keyof ISlotEditState['fields']>(
      state: ISlotEditState,
      action: PayloadAction<[T, ISlotEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof ISlotEditState['fields']>(
      state: ISlotEditState,
      action: PayloadAction<[T, ISlotEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setFromSlots: (state: ISlotEditState, action: PayloadAction<Slot[]>) => {
      state.fields.users.value = action.payload.map((slot) => ({
        id: Number(slot.dropzoneUser?.id),
        rigId: Number(slot.rig?.id),
        exitWeight: Number(slot.exitWeight),
      })) as SlotUser[];

      state.fields.jumpType.value = action.payload.find((i) => i)?.jumpType;
      state.fields.load.value = action.payload.find((i) => i)?.load || null;
      state.fields.extras.value = action.payload.find((i) => i)?.extras;
    },

    setDropzoneUsers: (state: ISlotEditState, action: PayloadAction<DropzoneUser[]>) => {
      state.fields.users.value = action.payload.map<SlotUser>((dzUser) => ({
        id: Number(dzUser.id),
        rigId: Number(dzUser?.availableRigs?.find(({ id }) => id)?.id),
        exitWeight: Number(dzUser?.user?.exitWeight),
      })) as SlotUser[];
    },

    setOpen: (state: ISlotEditState, action: PayloadAction<boolean | IFields>) => {
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
