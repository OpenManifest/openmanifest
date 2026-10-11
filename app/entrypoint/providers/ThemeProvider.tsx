import * as React from 'react';
import { AppThemeProvider } from 'app/theme';

function Content(props: { children: React.ReactNode }) {
  return <AppThemeProvider>{props.children}</AppThemeProvider>;
}
export default Content;
