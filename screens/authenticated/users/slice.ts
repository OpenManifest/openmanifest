import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DropzoneUser } from "../../../graphql/schema";

interface IUserScreenState {
  isSearchVisible: boolean;
  searchText: string;
}

const initialState: IUserScreenState = {
  isSearchVisible: false,
  searchText: "",
};


export default createSlice({
  name: 'usersScreen',
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
  }
});


