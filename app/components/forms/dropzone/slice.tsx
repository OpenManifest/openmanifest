import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DropzoneExtensiveFragment } from 'app/api/operations';
import { Dropzone } from '../../../api/schema.d';

export type DropzoneFields = Pick<
  DropzoneExtensiveFragment,
  | 'federation'
  | 'name'
  | 'secondaryColor'
  | 'primaryColor'
  | 'banner'
  | 'isPublic'
  | 'lng'
  | 'lat'
  | 'isCreditSystemEnabled'
  | 'requestPublication'
>;

interface IDropzoneEditState {
  original: DropzoneExtensiveFragment | null;
  open: boolean;
  fields: {
    [K in keyof DropzoneFields]-?: {
      value: Dropzone[K] | null;
      error: string | null;
    };
  };
}

export const initialState: IDropzoneEditState = {
  original: null,
  open: false,
  fields: {
    federation: {
      value: null,
      error: null,
    },
    lat: {
      value: null,
      error: null,
    },
    lng: {
      value: null,
      error: null,
    },
    name: {
      value: '',
      error: null,
    },
    secondaryColor: {
      value: '',
      error: null,
    },
    primaryColor: {
      value: '',
      error: null,
    },
    banner: {
      value: '',
      error: null,
    },
    isCreditSystemEnabled: {
      value: false,
      error: null,
    },
    isPublic: {
      value: false,
      error: null,
    },
    requestPublication: {
      value: false,
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/dropzone',
  initialState,
  reducers: {
    setField: <T extends keyof IDropzoneEditState['fields']>(
      state: IDropzoneEditState,
      action: PayloadAction<[T, IDropzoneEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof IDropzoneEditState['fields']>(
      state: IDropzoneEditState,
      action: PayloadAction<[string, string]>
    ) => {
      const [field, error] = action.payload;

      if (field in state.fields && 'error' in state.fields[field as T]) {
        state.fields[field as T].error = error;
      }
    },

    setOpen: (
      state: IDropzoneEditState,
      action: PayloadAction<boolean | DropzoneExtensiveFragment>
    ) => {
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
            state.fields[typedKey].value = (action.payload as Dropzone)[typedKey];
          }
        });
      }
    },

    setOriginal: (state: IDropzoneEditState, action: PayloadAction<DropzoneExtensiveFragment>) => {
      state.original = action.payload;
      state.open = true;
      Object.keys(action.payload).forEach((key) => {
        const payloadKey = key as keyof typeof action.payload;
        if (payloadKey in state.fields) {
          const typedKey = payloadKey as keyof typeof initialState['fields'];
          state.fields[typedKey].value = (action.payload as Dropzone)[typedKey];
        }
      });
    },

    reset: (state: IDropzoneEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
