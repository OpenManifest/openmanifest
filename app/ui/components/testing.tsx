import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from 'app/i18n';
import { ThemeProvider } from '../theme';
import { colour, type Density, type Scheme } from '../tokens';

/** Renders `ui` inside the theme of a scheme and density */
export function renderThemed(
  ui: React.ReactElement,
  { scheme = 'light', density }: { scheme?: Scheme; density?: Density } = {}
) {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider scheme={scheme} density={density}>
        {ui}
      </ThemeProvider>
    </I18nextProvider>
  );
}

export const flat = (element: { props: { style?: unknown } }) =>
  StyleSheet.flatten(element.props.style as never) as Record<string, unknown>;

export const SCHEMES: Scheme[] = ['light', 'dark'];
export const colours = colour;

/** Runs `body` as if on `os`: the touch target is 44 on iOS and 48 elsewhere */
export function onPlatform(os: 'ios' | 'android', body: () => void | Promise<void>) {
  const original = Platform.OS;
  Platform.OS = os;
  return Promise.resolve(body()).finally(() => {
    Platform.OS = original;
  });
}
