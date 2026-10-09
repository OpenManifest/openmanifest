import { primaryColor } from 'app/constants/Colors';
import { createAppTheme, createPalette } from '../palette';

describe('createAppTheme', () => {
  it('uses the light theme and the default primary colour without a dropzone', () => {
    const theme = createAppTheme(false);

    expect(theme.dark).toBe(false);
    expect(theme.colors.primary).toBe(primaryColor);
  });

  it('uses the dark theme', () => {
    const theme = createAppTheme(true);

    expect(theme.dark).toBe(true);
    expect(theme.colors.primary).toBe(primaryColor);
    expect(theme.colors.background).not.toBe(createAppTheme(false).colors.background);
  });

  it('applies the dropzone colours in both schemes', () => {
    for (const isDark of [false, true]) {
      const theme = createAppTheme(isDark, { primary: '#112233', accent: '#445566' });

      expect(theme.colors.primary).toBe('#112233');
      expect(theme.colors.accent).toBe('#445566');
    }
  });

  it('falls back to the defaults for missing or empty dropzone colours', () => {
    const defaults = createAppTheme(false);
    const theme = createAppTheme(false, { primary: null, accent: '' });

    expect(theme.colors.primary).toBe(defaults.colors.primary);
    expect(theme.colors.accent).toBe(defaults.colors.accent);
  });

  it('does not share colour objects between themes', () => {
    const themed = createAppTheme(false, { primary: '#112233' });

    expect(createAppTheme(false).colors.primary).toBe(primaryColor);
    expect(themed.colors).not.toBe(createAppTheme(false).colors);
  });
});

describe('createPalette', () => {
  it('expands primary and accent into shades', () => {
    const palette = createPalette(createAppTheme(false, { primary: '#808080', accent: '#ff0000' }));

    expect(palette.primary.main).toBe('#808080');
    expect(palette.primary.dark).toBe('#4D4D4D');
    expect(palette.primary.light).toBe('#CDCDCD');
    expect(palette.accent.main).toBe('#ff0000');
  });

  it('keeps the remaining theme colours', () => {
    const theme = createAppTheme(true);
    const palette = createPalette(theme);

    expect(palette.background).toBe(theme.colors.background);
    expect(palette.surface).toBe(theme.colors.surface);
  });
});
