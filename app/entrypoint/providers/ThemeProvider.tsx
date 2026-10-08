import * as React from 'react';
import { PaperProvider } from 'react-native-paper';

import { useAppSelector } from 'app/state/store';

function Content(props: { children: React.ReactNode }) {
  const { children } = props;
  const state = useAppSelector((root) => root.global);

  return <PaperProvider theme={state.theme}>{children}</PaperProvider>;
}
export default Content;
