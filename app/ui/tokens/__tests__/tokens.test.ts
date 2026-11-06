import { colour, contrastRatio, DEFAULT_BRAND, deriveBrand, tokens } from '..';
import type { Scheme, StatusKey } from '..';
import { parseHex, relativeLuminance, toHex } from '../contrast';

const SCHEMES: Scheme[] = ['light', 'dark'];
const STATUSES = Object.keys(colour.light.status) as StatusKey[];

describe('contrast', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
    expect(relativeLuminance('#FF0000')).toBeCloseTo(0.2126, 4);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#1D3557', '#E4EAF2')).toBeCloseTo(
      contrastRatio('#E4EAF2', '#1D3557'),
      10
    );
  });

  it('parses short and long hex, with or without #', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('1d3557')).toEqual([29, 53, 87]);
    expect(parseHex('nope')).toBeNull();
    expect(toHex([29, 53, 87])).toBe('#1D3557');
  });
});

describe('colour tokens', () => {
  it.each(SCHEMES)('%s: text pairs reach 4.5:1 on every surface', (scheme) => {
    const c = colour[scheme];
    for (const background of [c.app, c.surface, c.raised]) {
      expect(contrastRatio(c.text, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.textMuted, background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(SCHEMES)('%s: brand pairs reach 4.5:1', (scheme) => {
    const c = colour[scheme];
    expect(contrastRatio(c.onBrand, c.brand)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.brandText, c.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.brandText, c.brandSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onBrandSoft, c.brandSoft)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(SCHEMES)(
    '%s: borders are visible against the surface (3:1 is for controls, 1.1:1 for hairlines)',
    (scheme) => {
      const c = colour[scheme];
      expect(contrastRatio(c.border, c.surface)).toBeGreaterThanOrEqual(1.1);
    }
  );

  describe.each(SCHEMES)('%s status pairs', (scheme) => {
    it.each(STATUSES)('%s reaches 4.5:1', (status) => {
      const { bg, fg } = colour[scheme].status[status];
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('uses the default brand of the design plan in the light scheme', () => {
    expect(colour.light.brand).toBe(DEFAULT_BRAND);
    expect(DEFAULT_BRAND).toBe('#1D3557');
  });
});

describe('scales', () => {
  it('has the type, space, radius, density and motion values of the design plan', () => {
    expect(tokens.type.countdown).toMatchObject({ fontSize: 56, fontWeight: '700' });
    expect(tokens.type.title).toMatchObject({ fontSize: 20, fontWeight: '600' });
    expect(tokens.type.body).toMatchObject({ fontSize: 15, fontWeight: '400' });
    expect(tokens.type.bodyCompact).toMatchObject({ fontSize: 14, fontWeight: '400' });
    expect(tokens.type.label).toMatchObject({ fontSize: 13, fontWeight: '600' });
    expect(tokens.type.caption).toMatchObject({ fontSize: 12, fontWeight: '400' });
    expect(
      Object.values(tokens.type).every((style) => style.fontVariant[0] === 'tabular-nums')
    ).toBe(true);
    expect(Object.values(tokens.space)).toEqual([4, 8, 12, 16, 24, 32, 48]);
    expect(Object.values(tokens.radius).slice(0, 3)).toEqual([4, 8, 12]);
    expect(tokens.density.row).toEqual({ compact: 40, regular: 48, comfortable: 56 });
    expect(tokens.density.touchTarget).toEqual({ ios: 44, android: 48 });
    expect(tokens.motion).toEqual({ fast: 120, base: 200, slow: 300, highlight: 600 });
  });

  it('keeps line height above font size', () => {
    for (const style of Object.values(tokens.type))
      expect(style.lineHeight).toBeGreaterThan(style.fontSize);
  });
});

describe('deriveBrand', () => {
  const named = [
    '#FF1414',
    '#FFFF00',
    '#000000',
    '#FFFFFF',
    DEFAULT_BRAND, // demo navy
    '#35C3CF', // mockup teal
    '#808080',
    '#00FF00',
    '#0000FF',
    '#FF00FF',
    '#00FFFF',
  ];
  // A deterministic sweep: 13 hues × 3 saturation/lightness steps
  const sweep = Array.from({ length: 39 }, (_, i) => {
    const hue = (i % 13) * 27.7;
    const [s, l] = [
      [90, 50],
      [55, 35],
      [70, 72],
    ][Math.floor(i / 13)];
    const k = s * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => {
      const a = (n + hue / 30) % 12;
      return Math.round(255 * (l / 100 - (k / 100) * Math.max(-1, Math.min(a - 3, 9 - a, 1))));
    };
    return toHex([f(0), f(8), f(4)]);
  });
  const colours = [...named, ...sweep];

  it('covers 50 colours', () => {
    expect(new Set(colours).size).toBe(50);
  });

  describe.each(SCHEMES)('%s', (scheme) => {
    it.each(colours)('%s meets every pair', (hex) => {
      const brand = deriveBrand(hex, scheme);
      const { surface } = colour[scheme];

      expect(contrastRatio(brand.onBrand, brand.brand)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(brand.brandText, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(brand.brandText, brand.brandSoft)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(brand.onBrandSoft, brand.brandSoft)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('keeps the operator colour as the fill', () => {
    expect(deriveBrand('#ff1414', 'light').brand).toBe('#FF1414');
    expect(deriveBrand('#f00', 'dark').brand).toBe('#FF0000');
  });

  it('leaves a colour that already passes as it is', () => {
    expect(deriveBrand(DEFAULT_BRAND, 'light').brandText).toBe(DEFAULT_BRAND);
  });

  it('darkens a pale colour for text in the light scheme and lightens a dark one in the dark scheme', () => {
    expect(relativeLuminance(deriveBrand('#FFFF00', 'light').brandText)).toBeLessThan(
      relativeLuminance('#FFFF00')
    );
    expect(relativeLuminance(deriveBrand('#000000', 'dark').brandText)).toBeGreaterThan(
      relativeLuminance('#000000')
    );
  });

  it('keeps the hue when it adjusts lightness', () => {
    const [r, g, b] = parseHex(deriveBrand('#FF1414', 'light').brandText) as number[];
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
  });

  it('falls back to the scheme default for something that is not a colour', () => {
    expect(deriveBrand('banana', 'dark').brand).toBe(colour.dark.brand);
    expect(deriveBrand('', 'light').brandText).toBe(colour.light.brandText);
  });
});
