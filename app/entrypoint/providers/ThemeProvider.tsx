import * as React from 'react';
import { AppThemeProvider } from 'app/theme';
import I18nProvider from 'app/i18n/I18nProvider';

function Content(props: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <I18nProvider>{props.children}</I18nProvider>
    </AppThemeProvider>
  );
}
export default Content;
