import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DropzoneUser } from "../../../graphql/schema";

interface IUserScreenState {
  isSearchVisible: boolean;
  isSelectEnabled: boolean;
  selectedUsers: DropzoneUser[]
  searchText: string;
}

const initialState: IUserScreenState = {
  isSearchVisible: false,
  isSelectEnabled: false,
  selectedUsers: [],
  searchText: "",
};


export default createSlice({
  name: 'usersScreen',
  initialState,
  reducers: {
    setSelectEnabled: (state: IUserScreenState, action: PayloadAction<boolean>) => {
      state.isSelectEnabled = action.payload;
    },
    setSelected: (state: IUserScreenState, action: PayloadAction<DropzoneUser[]>) => {
      state.selectedUsers = action.payload;
    },
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


