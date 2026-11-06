import type { Scheme } from './colour';
import { colour } from './colour';

type Rgb = [number, number, number];
type Oklch = { l: number; c: number; h: number };

/** Parses `#rgb` or `#rrggbb` (the `#` is optional) into 0–255 channels; `null` when it is not a colour. */
export function parseHex(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as Rgb;
}

export function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
    .toUpperCase()}`;
}

const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (linear: number) => {
  const c = linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
  return c * 255;
};

/** WCAG 2.x relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Not a hex colour: ${hex}`);
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function hexToOklch(hex: string): Oklch {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Not a hex colour: ${hex}`);
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bb);
  return { l: lightness, c: chroma, h: chroma < 1e-4 ? 0 : (Math.atan2(bb, a) * 180) / Math.PI };
}

/** Linear sRGB of an OKLCH colour, not clamped. */
function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (linear: Rgb) => linear.every((channel) => channel >= -0.0005 && channel <= 1.0005);

/** Hex of an OKLCH colour; chroma is reduced until the colour fits in sRGB. */
function oklchToHex(colourValue: Oklch): string {
  let { c } = colourValue;
  let linear = oklchToLinear({ ...colourValue, c });
  if (!inGamut(linear)) {
    let [low, high] = [0, c];
    for (let i = 0; i < 24; i += 1) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinear({ ...colourValue, c: mid }))) low = mid;
      else high = mid;
    }
    c = low;
    linear = oklchToLinear({ ...colourValue, c });
  }
  return toHex(linear.map((channel) => fromLinear(Math.min(1, Math.max(0, channel)))) as Rgb);
}

/**
 * The colour with OKLCH lightness moved as little as needed (towards black or white, as `toward` says)
 * until it reaches `target` contrast on every background. Hue and chroma are kept as far as the gamut allows.
 */
function ensureContrast(
  hex: string,
  backgrounds: string[],
  target: number,
  toward: 'dark' | 'light'
): string {
  const passes = (candidate: string) =>
    backgrounds.every((bg) => contrastRatio(candidate, bg) >= target);
  const normalised = toHex(parseHex(hex) as Rgb);
  if (passes(normalised)) return normalised;

  const start = hexToOklch(normalised);
  const end = toward === 'dark' ? 0 : 1;
  const at = (l: number) => oklchToHex({ ...start, l });
  // Bisect between the start (fails) and the extreme (black or white always passes against the backgrounds used here)
  let [failing, passing] = [start.l, end];
  for (let i = 0; i < 24; i += 1) {
    const mid = (failing + passing) / 2;
    if (passes(at(mid))) passing = mid;
    else failing = mid;
  }
  const result = at(passing);
  return passes(result) ? result : toHex(toward === 'dark' ? [0, 0, 0] : [255, 255, 255]);
}

export type DerivedBrand = {
  brand: string;
  /** Text and icons on `brand`. */
  onBrand: string;
  /** The brand as text or an icon on the scheme's surface and on `brandSoft`. */
  brandText: string;
  brandSoft: string;
  /** Body text on `brandSoft`. */
  onBrandSoft: string;
};

const WHITE = '#FFFFFF';
const NEAR_BLACK = '#0B0E13';

/**
 * Accessible shades of an operator's brand colour for a scheme (design plan §3.2): the colour itself as the fill
 * with white or near-black text, a lightness-adjusted copy for text on surfaces (4.5:1), and a tint with its text.
 * An unparseable colour falls back to the default brand of the scheme.
 */
export function deriveBrand(hex: string, scheme: Scheme): DerivedBrand {
  const defaults = colour[scheme];
  const rgb = parseHex(hex);
  if (!rgb) {
    const { brand, onBrand, brandText, brandSoft, onBrandSoft } = defaults;
    return { brand, onBrand, brandText, brandSoft, onBrandSoft };
  }

  const operatorColour = toHex(rgb);
  const onBrand =
    contrastRatio(operatorColour, WHITE) >= contrastRatio(operatorColour, NEAR_BLACK)
      ? WHITE
      : NEAR_BLACK;
  // Almost every colour already reaches 4.5:1 with white or near-black; the few mid-tones that do not move away from the text
  const brand = ensureContrast(
    operatorColour,
    [onBrand],
    4.5,
    onBrand === WHITE ? 'dark' : 'light'
  );

  const origin = hexToOklch(brand);
  const brandSoft = oklchToHex({
    l: scheme === 'light' ? 0.94 : 0.28,
    c: Math.min(origin.c, scheme === 'light' ? 0.035 : 0.06),
    h: origin.h,
  });
  const toward = scheme === 'light' ? 'dark' : 'light';
  const brandText = ensureContrast(brand, [defaults.surface, brandSoft], 4.5, toward);
  const onBrandSoft = ensureContrast(brand, [brandSoft], 7, toward);

  return { brand, onBrand, brandText, brandSoft, onBrandSoft };
}
