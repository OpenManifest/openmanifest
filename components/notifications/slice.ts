import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Snackbar } from "react-native-paper";

interface INotification {
  message: string;
  variant?: "error" | "success";
  action?: {
    label: string;
    onPress: () => void;
  }
}
interface INotificationState {
  queue: INotification[];
}

export default createSlice({
  name: 'notifications',
  initialState: {
    queue: []
  } as INotificationState,
  reducers: {
    hideSnackbar: (state: INotificationState) => {
      state.queue = state.queue.slice(1);
    },
    showSnackbar: (state: INotificationState, action: PayloadAction<INotification>) => {
      state.queue.push(action.payload);
    }
  }
});


