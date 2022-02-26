import * as React from 'react';
import { Provider as MaterialProvider } from 'react-native-paper';

import { useAppSelector } from './state/store';

function Content(props: { children: React.ReactNode }) {
  const { children } = props;
  const state = useAppSelector((root) => root.global);

  React.useEffect(() => {
    console.log('Theme changed', state.theme);
  }, [state.theme]);
  return (
    <MaterialProvider theme={state.theme as ReactNativePaper.Theme}>{children}</MaterialProvider>
  );
}
export default Content;
