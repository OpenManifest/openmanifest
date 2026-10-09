import * as React from 'react';
import { Text } from 'react-native';
import { act, waitFor } from '@testing-library/react-native';
import { render } from '../../__mocks__/render';
import MOCK_QUERY_DROPZONE from '../../__tests__/manifest/__mocks__/QueryDropzone.mock';
import { usePreferences } from '../../state/preferences';
import { useThemeOverrides } from '../overrides';
import { useAppTheme } from '../useAppTheme';
import { authenticatedSession } from '../../__fixtures__/session.fixture';
import { primaryColor } from '../../constants/Colors';

function Probe() {
  const { theme, palette, isDark } = useAppTheme();
  return (
    <>
      <Text testID="primary">{theme.colors.primary}</Text>
      <Text testID="palette-primary">{palette.primary.main}</Text>
      <Text testID="dark">{String(isDark)}</Text>
    </>
  );
}

describe('useAppTheme', () => {
  beforeEach(() => {
    usePreferences.setState({ colorScheme: 'light' });
    useThemeOverrides.setState({ primary: null });
  });

  it('uses the default colour when logged out', () => {
    const screen = render(<Probe />, { graphql: [] });

    expect(screen.getByTestId('primary').props.children).toBe(primaryColor);
    expect(screen.getByTestId('dark').props.children).toBe('false');
    screen.unmount();
  });

  it('follows the colour scheme preference', async () => {
    usePreferences.setState({ colorScheme: 'dark' });
    const screen = render(<Probe />, { graphql: [] });

    expect(screen.getByTestId('dark').props.children).toBe('true');

    await act(async () => usePreferences.getState().setColorScheme('light'));
    await waitFor(() => expect(screen.getByTestId('dark').props.children).toBe('false'));
    screen.unmount();
  });

  it('takes the primary colour from the current dropzone', async () => {
    const dropzone = MOCK_QUERY_DROPZONE();
    const screen = render(<Probe />, { graphql: [dropzone], session: authenticatedSession });
    const expected = (dropzone.result as { data: { dropzone: { primaryColor: string } } }).data
      .dropzone.primaryColor;

    expect(expected).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('primary').props.children).toBe(expected));
    expect(screen.getByTestId('palette-primary').props.children).toBe(expected);
    screen.unmount();
  });

  it('lets a preview colour win until it is cleared', async () => {
    const screen = render(<Probe />, { graphql: [] });

    await act(async () => useThemeOverrides.getState().setPrimary('#123456'));
    await waitFor(() => expect(screen.getByTestId('primary').props.children).toBe('#123456'));

    await act(async () => useThemeOverrides.getState().setPrimary(null));
    await waitFor(() => expect(screen.getByTestId('primary').props.children).toBe(primaryColor));
    screen.unmount();
  });
});
