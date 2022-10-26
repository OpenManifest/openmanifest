import Appsignal from '@appsignal/javascript';
import noop from 'lodash/noop';
import * as React from 'react';
import { Platform } from 'react-native';
import AppSignalClient from './AppSignalClient';

export interface IAppSignalDefaultTags {
  platform: string;
  currentDropzoneId: string;
  currentUserId: string;
  currentDropzone: string;
  currentUser: string;
}
export interface IAppSignalContext {
  appSignal: Appsignal;
  tags: { [key: string]: string } & IAppSignalDefaultTags;
  setTags(tags: Partial<IAppSignalDefaultTags> | { [key: string]: string }): void;
}

export const INITIAL_TAGS = {
  platform: Platform.OS,
  currentDropzoneId: 'Unknown',
  currentDropzone: 'Unknown',
  currentUserId: 'Unknown',
  currentUser: 'Unknown',
};

export const INITIAL_CONTEXT: IAppSignalContext = {
  appSignal: AppSignalClient,
  tags: INITIAL_TAGS,
  setTags: noop,
};

const AppSignalContext = React.createContext(INITIAL_CONTEXT);

export function useAppSignalContext() {
  return React.useContext(AppSignalContext);
}

export default AppSignalContext;
