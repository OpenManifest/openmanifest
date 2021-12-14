import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum DropzoneWizardStep {
  Name = 0,
  Federation = 1,
  Location = 2,
  Branding = 3,
  Aircraft = 4,
  Tickets = 5,
}

interface IDropzoneWizardState {
  currentIndex: number;
  completed: {
    [K in DropzoneWizardStep]: boolean;
  };
}

export const initialState: IDropzoneWizardState = {
  currentIndex: -1,
  completed: {
    [DropzoneWizardStep.Name]: false,
    [DropzoneWizardStep.Federation]: false,
    [DropzoneWizardStep.Location]: false,
    [DropzoneWizardStep.Aircraft]: false,
    [DropzoneWizardStep.Tickets]: false,
    [DropzoneWizardStep.Branding]: false,
  },
};

export default createSlice({
  name: 'screens/dropzoneWizard',
  initialState,
  reducers: {
    setIndex: (state: IDropzoneWizardState, action: PayloadAction<DropzoneWizardStep>) => {
      state.currentIndex = action.payload;
    },
    complete: (
      state: IDropzoneWizardState,
      action: PayloadAction<{ [K in DropzoneWizardStep]: boolean } | undefined>
    ) => {
      state.completed = {
        ...state.completed,
        ...(action.payload || {
          [DropzoneWizardStep.Name]: true,
          [DropzoneWizardStep.Federation]: true,
          [DropzoneWizardStep.Location]: true,
          [DropzoneWizardStep.Aircraft]: true,
          [DropzoneWizardStep.Tickets]: true,
          [DropzoneWizardStep.Branding]: true,
        }),
      };
    },
  },
});
