import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { pick, pickBy } from "lodash";
import { SlotUser, Slot, DropzoneUser } from "../../../graphql/schema";


interface IFields extends Pick<
  Slot,
  | "jumpType"
  | "load"
  | "ticketType"
  | "extras"
> {
  users: SlotUser[];
}

interface ISlotEditState {
  original: IFields | null;
  fields: {
    [K in keyof IFields] - ?: {
      value: IFields[K] | null;
      error: string | null;
    }
  },
}

export const initialState: ISlotEditState = {
  original: null,
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
  }
};


export default createSlice({
  name: 'slotMultipleForm',
  initialState,
  reducers: {
    setField: <T extends keyof ISlotEditState["fields"]>(state: ISlotEditState, action: PayloadAction<[T, ISlotEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;

      
      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends  keyof ISlotEditState["fields"]>(state: ISlotEditState, action: PayloadAction<[T, ISlotEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setFromSlots: (state: ISlotEditState, action: PayloadAction<Slot[]>) => {
      state.fields.users.value = action.payload.map((slot) => ({
          id: Number(slot.user?.id),
          rigId: Number(slot.rig?.id),
          exitWeight: Number(slot.exitWeight),
        })
      ) as SlotUser[];

      state.fields.jumpType.value = action.payload.find(i => i)?.jumpType;
      state.fields.load.value = action.payload.find(i => i)?.load!;
      state.fields.extras.value = action.payload.find(i => i)?.extras;
    },

    setDropzoneUsers: (state: ISlotEditState, action: PayloadAction<DropzoneUser[]>) => {
      state.fields.users.value = action.payload.map<SlotUser>((dzUser) => ({
          id: Number(dzUser.user.id),
          rigId: Number(dzUser?.availableRigs?.find(({ id }) => id)?.id),
          exitWeight: Number(dzUser?.user.exitWeight),
        })
      ) as SlotUser[];
    },

    setOriginal: (state: ISlotEditState, action: PayloadAction<IFields>) => {
      state.original = action.payload;
      for (const key in action.payload) {
        if (key in state.fields) {
          const typedKey = key as keyof typeof initialState["fields"];
          state.fields[typedKey].value = action.payload[typedKey];
        }
      }
    },
    
    reset: (state: ISlotEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


