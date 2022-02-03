import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';

interface IManifestScreenState {
  isSearchVisible: boolean;
  selectedUsers: DropzoneUserEssentialsFragment[];
  searchText: string;
  display: 'list' | 'cards';
}

export const initialState: IManifestScreenState = {
  isSearchVisible: false,
  selectedUsers: [],
  searchText: '',
  display: 'cards',
};

export default createSlice({
  name: 'manifestScreen',
  initialState,
  reducers: {
    setSelected: (
      state: IManifestScreenState,
      action: PayloadAction<DropzoneUserEssentialsFragment[]>
    ) => {
      state.selectedUsers = action.payload;
    },
    setSearchText: (state: IManifestScreenState, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },

    setSearchVisible: (state: IManifestScreenState, action: PayloadAction<boolean>) => {
      state.isSearchVisible = action.payload;
    },

    setDisplayStyle: (state: IManifestScreenState, action: PayloadAction<'cards' | 'list'>) => {
      state.display = action.payload;
    },

    reset: (state: IManifestScreenState) => {
      state.isSearchVisible = initialState.isSearchVisible;
      state.searchText = initialState.searchText;
    },
  },
});
