import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserScreenState {
  isSearchVisible: boolean;
  searchText: string;
}

export const initialState: IUserScreenState = {
  isSearchVisible: false,
  searchText: '',
};

export default createSlice({
  name: 'screens/user',
  initialState,
  reducers: {
    setSearchText: (state: IUserScreenState, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },

    setSearchVisible: (state: IUserScreenState, action: PayloadAction<boolean>) => {
      state.isSearchVisible = action.payload;
    },

    reset: (state: IUserScreenState) => {
      state.isSearchVisible = initialState.isSearchVisible;
      state.searchText = initialState.searchText;
    },
  },
});
