import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserWizardState {
  skipRigSetup: boolean;
}

export const initialState: IUserWizardState = {
  skipRigSetup: false,
};

export default createSlice({
  name: 'screens/userWizard',
  initialState,
  reducers: {
    skipRigSetup: (state: IUserWizardState, action: PayloadAction<boolean>) => {
      state.skipRigSetup = action.payload;
    },
  },
});
