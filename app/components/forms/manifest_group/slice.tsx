import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DropzoneUserProfileFragment,
  LoadEssentialsFragment,
  RigEssentialsFragment,
  SlotDetailsFragment,
} from 'app/api/operations';
import { first, xorBy } from 'lodash';
import { SlotUser } from '../../../api/schema.d';

export type SlotUserWithRig = Omit<SlotUser, 'rig'> & {
  rigId?: number;
  rig?: RigEssentialsFragment;
  avatar?: string;
  name?: string;
};

interface IFields
  extends Pick<
    SlotDetailsFragment & { load: LoadEssentialsFragment },
    'jumpType' | 'load' | 'ticketType' | 'extras'
  > {
  users: SlotUserWithRig[];
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

    setFromSlots: (
      state: ISlotEditState,
      action: PayloadAction<{ load: LoadEssentialsFragment; slots: SlotDetailsFragment[] }>
    ) => {
      console.log('Setting from ', action.payload.slots);
      state.fields.users.value = action.payload.slots.map((slot) => ({
        id: Number(slot.dropzoneUser?.id),
        rigId: Number(slot.rig?.id),
        rig: slot.rig,
        exitWeight: Number(slot.exitWeight),
      })) as SlotUserWithRig[];

      state.fields.jumpType.value = action.payload.slots.find((i) => i)?.jumpType;
      state.fields.load.value = action.payload.load;
      state.fields.extras.value = action.payload.slots.find((i) => i)?.extras;
    },

    setDropzoneUsers: (
      state: ISlotEditState,
      action: PayloadAction<DropzoneUserProfileFragment[]>
    ) => {
      state.fields.users.value = xorBy(
        state.fields.users.value,
        action.payload?.map((dzUser) => {
          const autoSelectedRig = dzUser?.user?.rigs?.length
            ? first(dzUser.user.rigs)
            : first(dzUser.availableRigs);
          return {
            id: Number(dzUser.id),
            rigId: autoSelectedRig?.id ? Number(autoSelectedRig.id) : null,
            rig: autoSelectedRig,
            name: dzUser.user.name,
            avatar: dzUser.user.image,
            exitWeight: Number(dzUser?.user?.exitWeight),
          };
        }) as SlotUserWithRig[],
        'id'
      );
    },

    setOpen: (state: ISlotEditState, action: PayloadAction<boolean | IFields>) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.fields.extras.value = action.payload.extras;
        state.fields.jumpType.value = action.payload.jumpType;
        state.fields.load.value = action.payload.load;
        state.fields.users.value = action.payload.users;
        state.fields.ticketType.value = action.payload.ticketType;
      }
    },

    reset: (state: ISlotEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
