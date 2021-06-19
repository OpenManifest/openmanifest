import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DropzoneUser } from "../../../graphql/schema.d";

interface IManifestScreenState {
  isSearchVisible: boolean;
  selectedUsers: DropzoneUser[]
  searchText: string;
}

export const initialState: IManifestScreenState = {
  isSearchVisible: false,
  selectedUsers: [],
  searchText: "",
};


export default createSlice({
  name: 'manifestScreen',
  initialState,
  reducers: {
    setSelected: (state: IManifestScreenState, action: PayloadAction<DropzoneUser[]>) => {
      state.selectedUsers = action.payload;
    },
    setSearchText: (state: IManifestScreenState, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },

    setSearchVisible: (state: IManifestScreenState, action: PayloadAction<boolean>) => {
      state.isSearchVisible = action.payload;
    },
    
    reset: (state: IManifestScreenState) => {
      state.isSearchVisible = initialState.isSearchVisible;
      state.searchText = initialState.searchText;
    },
  }
});


