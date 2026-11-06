import * as React from 'react';
import { Text } from 'react-native';
import { act, waitFor } from '@testing-library/react-native';
import { render } from '../../__mocks__/render';
import MOCK_QUERY_OPERATOR from '../../__tests__/manifest/__mocks__/QueryOperator.mock';
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

  it('uses the default colour when logged out', async () => {
    const screen = await render(<Probe />, { graphql: [] });

    expect(screen.getByTestId('primary').props.children).toBe(primaryColor);
    expect(screen.getByTestId('dark').props.children).toBe('false');
    await screen.unmount();
  });

  it('follows the colour scheme preference', async () => {
    usePreferences.setState({ colorScheme: 'dark' });
    const screen = await render(<Probe />, { graphql: [] });

    expect(screen.getByTestId('dark').props.children).toBe('true');

    await act(async () => usePreferences.getState().setColorScheme('light'));
    await waitFor(() => expect(screen.getByTestId('dark').props.children).toBe('false'));
    await screen.unmount();
  });

  it('takes the primary colour from the current dropzone', async () => {
    const operator = MOCK_QUERY_OPERATOR();
    const screen = await render(<Probe />, { graphql: [operator], session: authenticatedSession });
    const expected = (operator.result as { data: { operator: { primaryColor: string } } }).data
      .operator.primaryColor;

    expect(expected).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('primary').props.children).toBe(expected));
    expect(screen.getByTestId('palette-primary').props.children).toBe(expected);
    await screen.unmount();
  });

  it('lets a preview colour win until it is cleared', async () => {
    const screen = await render(<Probe />, { graphql: [] });

    await act(async () => useThemeOverrides.getState().setPrimary('#123456'));
    await waitFor(() => expect(screen.getByTestId('primary').props.children).toBe('#123456'));

    await act(async () => useThemeOverrides.getState().setPrimary(null));
    await waitFor(() => expect(screen.getByTestId('primary').props.children).toBe(primaryColor));
    await screen.unmount();
  });
});
