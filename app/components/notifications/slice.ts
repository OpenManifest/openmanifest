import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';

interface INotification {
  message: string;
  variant?: 'error' | 'success' | 'info';
  action?: {
    label: string;
    onPress: () => void;
  };
}
interface INotificationState {
  queue: INotification[];
}

export const initialState = { queue: [] } as INotificationState;
export default createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    hideSnackbar: (state: INotificationState) => {
      const [, ...newQueue] = state.queue;
      state.queue = newQueue;
    },
    showSnackbar: (state: INotificationState, action: PayloadAction<INotification>) => {
      if (!isEqual(last(state.queue), action.payload)) {
        state.queue.push(action.payload);
      }
    },
  },
});
