import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CurrentUserDetailedFragment,
  DropzoneUserDetailsFragment,
  FederationEssentialsFragment,
  LicenseDetailsFragment,
  UserDetailedFragment,
} from 'app/api/operations';

export type UserFields = Pick<
  UserDetailedFragment & { license?: LicenseDetailsFragment },
  | 'exitWeight'
  | 'rigs'
  | 'name'
  | 'phone'
  | 'email'
  | 'apfNumber'
  | 'nickname'
  | 'license'
  | 'image'
>;

interface IUserEditState {
  original: DropzoneUserDetailsFragment | null;
  open: boolean;
  federation: {
    value: FederationEssentialsFragment | null;
    error: null;
  };
  fields: {
    [K in keyof UserFields]-?: {
      value: UserFields[K] | null;
      error: string | null;
    };
  };
}

export const initialState: IUserEditState = {
  original: null,
  open: false,
  federation: {
    value: null,
    error: null,
  },
  fields: {
    exitWeight: {
      value: '',
      error: null,
    },
    image: {
      value: null,
      error: null,
    },
    apfNumber: {
      value: '',
      error: null,
    },
    email: {
      value: '',
      error: null,
    },
    phone: {
      value: '',
      error: null,
    },
    name: {
      value: null,
      error: null,
    },
    nickname: {
      value: null,
      error: null,
    },
    rigs: {
      value: [],
      error: null,
    },
    license: {
      value: null,
      error: null,
    },
  },
};

export default createSlice({
  name: 'forms/user',
  initialState,
  reducers: {
    setFederation: (state: IUserEditState, action: PayloadAction<FederationEssentialsFragment>) => {
      state.federation.value = action.payload;
    },
    setField: <T extends keyof IUserEditState['fields']>(
      state: IUserEditState,
      action: PayloadAction<[T, IUserEditState['fields'][T]['value']]>
    ) => {
      const [field, value] = action.payload;

      state.fields[field].value = value;
      state.fields[field].error = null;
    },
    setFieldError: <T extends keyof IUserEditState['fields']>(
      state: IUserEditState,
      action: PayloadAction<[T, IUserEditState['fields'][T]['error']]>
    ) => {
      const [field, error] = action.payload;

      state.fields[field].error = error;
    },

    setOriginal: (
      state: IUserEditState,
      action: PayloadAction<DropzoneUserDetailsFragment | CurrentUserDetailedFragment>
    ) => {
      state.original = action.payload;
      console.debug('--FEDERATION', state.federation);
      console.debug('--FEDERATION2', action.payload.user?.userFederations);
      Object.keys(action.payload.user).forEach((key) => {
        const payloadKey = key as keyof typeof action.payload;
        if (payloadKey in state.fields) {
          const typedKey = payloadKey as keyof typeof initialState['fields'];
          if (typedKey === 'license') {
            console.debug('--LICENSE', action.payload.license);
            state.fields[typedKey].value = (action.payload as DropzoneUserDetailsFragment)[
              typedKey
            ];
          } else {
            state.fields[typedKey].value = (action.payload as DropzoneUserDetailsFragment).user[
              typedKey
            ];
          }
        }
      });
      state.federation.value =
        action.payload.license?.federation ||
        action.payload?.user?.userFederations?.find((i) => i)?.federation ||
        null;
      if (
        state.federation.value &&
        action.payload.user?.userFederations?.find(
          ({ federation }) => federation.id === state.federation.value?.id
        )?.uid
      ) {
        const userFederation = action.payload.user?.userFederations?.find(
          ({ federation }) => federation.id === state.federation.value?.id
        );
        state.fields.apfNumber.value = userFederation?.uid;
        state.fields.license.value =
          state.fields.license.value || userFederation?.license || state?.original?.license;
        console.debug('SET APF NUMBER TO ', state.fields.apfNumber.value);
      }
    },

    setOpen: (
      state: IUserEditState,
      action: PayloadAction<boolean | DropzoneUserDetailsFragment>
    ) => {
      if (typeof action.payload === 'boolean') {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        state.federation.value = action.payload.license?.federation || null;
        state.fields.license.value = action.payload.license || null;

        if (typeof action.payload !== 'boolean') {
          Object.keys(action.payload.user).forEach((key) => {
            const payloadKey = key as keyof typeof action.payload;
            if (payloadKey in state.fields) {
              const typedKey = payloadKey as keyof typeof initialState['fields'];

              if (typedKey === 'license') {
                state.fields[typedKey].value = (action.payload as DropzoneUserDetailsFragment)[
                  typedKey
                ];
              } else {
                state.fields[typedKey].value = (action.payload as DropzoneUserDetailsFragment).user[
                  typedKey
                ];
              }
            }
          });
        }
      }
    },

    reset: (state: IUserEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  },
});
