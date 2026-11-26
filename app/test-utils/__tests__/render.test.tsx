import * as React from 'react';
import { Pressable, Text, useWindowDimensions } from 'react-native';
import { waitFor } from '@testing-library/react-native';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useTheme } from 'app/ui/theme';
import useTerms from 'app/i18n/useTerms';
import { renderWithProviders, ROLE_PERMISSIONS } from '../render';

function Probe() {
  const canManifest = useRestriction(Permission.CreateUserSlot);
  const canReadLoads = useRestriction(Permission.ReadLoad);
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const term = useTerms();

  return (
    <>
      <Text testID="manifest">{String(canManifest)}</Text>
      <Text testID="read">{String(canReadLoads)}</Text>
      <Text testID="width">{String(width)}</Text>
      <Text testID="scheme">{theme.scheme}</Text>
      <Text testID="breakpoint">{theme.breakpoint}</Text>
      <Text testID="operator">{term('operator')}</Text>
      <Pressable role="button" aria-label="Probe action" onPress={() => undefined} />
    </>
  );
}

describe('role fixtures', () => {
  it('come from the skydiving role presets', () => {
    expect(ROLE_PERMISSIONS.student).toEqual(['readLoad', 'createSlot']);
    expect(ROLE_PERMISSIONS.fun_jumper).toContain('updateSlot');
    expect(ROLE_PERMISSIONS.fun_jumper).not.toContain('createUserSlot');
    expect(ROLE_PERMISSIONS.manifest).toContain('createUserSlot');
    expect(ROLE_PERMISSIONS.owner).toEqual(
      expect.arrayContaining(['updateOperator', 'actAsPilot', 'readLoad'])
    );
  });
});

describe('renderWithProviders', () => {
  it('signs in as the owner, in a phone-sized window and the light scheme, by default', async () => {
    const screen = await renderWithProviders(<Probe />);

    await waitFor(() => expect(screen.getByTestId('manifest').props.children).toBe('true'));
    expect(screen.getByRole('button', { name: 'Probe action' })).toBeTruthy();
    expect(screen.getByTestId('width').props.children).toBe('390');
    expect(screen.getByTestId('scheme').props.children).toBe('light');
    expect(screen.getByTestId('breakpoint').props.children).toBe('compact');
  });

  it('gives a role its permissions', async () => {
    const student = await renderWithProviders(<Probe />, { role: 'student' });

    await waitFor(() => expect(student.getByTestId('read').props.children).toBe('true'));
    expect(student.getByTestId('manifest').props.children).toBe('false');
  });

  it('applies the scheme, the window and the template words', async () => {
    const screen = await renderWithProviders(<Probe />, {
      scheme: 'dark',
      breakpoint: 'expanded',
      industry: 'skydiving',
    });

    expect(screen.getByTestId('scheme').props.children).toBe('dark');
    expect(screen.getByTestId('width').props.children).toBe('1440');
    expect(screen.getByTestId('breakpoint').props.children).toBe('expanded');
    expect(screen.getByTestId('operator').props.children).toBe('Dropzone');
  });
});
