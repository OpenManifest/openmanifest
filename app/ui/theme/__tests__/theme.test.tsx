import * as React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { contrastRatio, DEFAULT_BRAND, colour } from '../../tokens';
import { createTheme } from '../theme';
import { densityOf } from '../useDevice';
import { ThemeProvider, useDevice, useStyles, useTheme } from '..';

describe('createTheme', () => {
  it('uses the default brand of the scheme without an operator colour', () => {
    expect(createTheme({ scheme: 'light' }).colour.brand).toBe(DEFAULT_BRAND);
    expect(createTheme({ scheme: 'dark' }).colour.brand).toBe(colour.dark.brand);
    expect(createTheme({ scheme: 'light', brand: null }).colour).toEqual(colour.light);
  });

  it('derives accessible brand shades from the operator colour', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const { colour: c } = createTheme({ scheme, brand: '#FFFF00' });

      expect(c.brand).toBe('#FFFF00');
      expect(contrastRatio(c.onBrand, c.brand)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.brandText, c.surface)).toBeGreaterThanOrEqual(4.5);
      expect(c.surface).toBe(colour[scheme].surface);
    }
  });

  it('takes the row height from the density and the touch target from the platform', () => {
    expect(createTheme({ scheme: 'light', density: 'compact' }).density).toMatchObject({
      name: 'compact',
      row: 40,
    });
    expect(createTheme({ scheme: 'light', density: 'comfortable' }).density.row).toBe(56);
    expect(createTheme({ scheme: 'light', platform: 'ios' }).density.touchTarget).toBe(44);
    expect(createTheme({ scheme: 'light', platform: 'android' }).density.touchTarget).toBe(48);
    expect(createTheme({ scheme: 'light', platform: 'web' }).density.touchTarget).toBe(48);
  });
});

describe('densityOf', () => {
  it('is compact only for a mouse on a wide window', () => {
    expect(densityOf('expanded', 'fine')).toBe('compact');
    expect(densityOf('expanded', 'coarse')).toBe('regular');
    expect(densityOf('medium', 'fine')).toBe('regular');
    expect(densityOf('compact', 'coarse')).toBe('regular');
  });
});

function Probe() {
  const theme = useTheme();
  const device = useDevice();
  const styles = useStyles((t) => ({
    box: { padding: t.space.lg, backgroundColor: t.colour.surface },
  }));

  return (
    <>
      <Text testID="scheme">{theme.scheme}</Text>
      <Text testID="brand">{theme.colour.brand}</Text>
      <Text testID="pointer">{device.pointer}</Text>
      <Text testID="padding">{String(styles.box.padding)}</Text>
      <Text testID="surface">{String(styles.box.backgroundColor)}</Text>
    </>
  );
}

describe('ThemeProvider', () => {
  it('provides the theme of the scheme and brand', async () => {
    const screen = await render(
      <ThemeProvider scheme="dark" brand="#336699">
        <Probe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('scheme').props.children).toBe('dark');
    expect(screen.getByTestId('brand').props.children).toBe('#336699');
    expect(screen.getByTestId('surface').props.children).toBe(colour.dark.surface);
    expect(screen.getByTestId('padding').props.children).toBe('16');
  });

  it('falls back to the light default theme outside a provider', async () => {
    const screen = await render(<Probe />);

    expect(screen.getByTestId('scheme').props.children).toBe('light');
    expect(screen.getByTestId('brand').props.children).toBe(DEFAULT_BRAND);
  });

  it('reports a coarse pointer on native', async () => {
    const screen = await render(<Probe />);

    expect(screen.getByTestId('pointer').props.children).toBe('coarse');
  });

  it('keeps styles stable until the theme changes', async () => {
    const seen: unknown[] = [];
    function Capture() {
      seen.push(useStyles((t) => ({ box: { padding: t.space.sm } })));
      return null;
    }
    const tree = (scheme: 'light' | 'dark') => (
      <ThemeProvider scheme={scheme}>
        <Capture />
      </ThemeProvider>
    );
    const screen = await render(tree('light'));
    await screen.rerender(tree('light'));
    await screen.rerender(tree('dark'));

    expect(seen[1]).toBe(seen[0]);
    expect(seen[2]).not.toBe(seen[0]);
  });
});
