import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IImageViewer {
  open: boolean;
  image: string | null;
}

export const initialState: IImageViewer = {
  open: false,
  image: null,
};

export default createSlice({
  name: 'dialog/imageViewer',
  initialState,
  reducers: {
    setOpen: (state: IImageViewer, action: PayloadAction<string>) => {
      state.open = true;
      state.image = action.payload;
    },
    close: (state: IImageViewer) => {
      state.open = false;
    },
  },
});
