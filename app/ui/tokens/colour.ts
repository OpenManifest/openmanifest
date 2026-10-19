export type Scheme = 'light' | 'dark';

/** A background and the text/icon colour that sits on it. */
export type Pair = { bg: string; fg: string };

export type StatusKey =
  'open' | 'boarding' | 'departed' | 'landed' | 'cancelled' | 'warning' | 'blocked' | 'ok' | 'info';

export type ColourTokens = {
  app: string;
  surface: string;
  raised: string;
  border: string;
  /** Dims what is behind an overlay */
  scrim: string;
  text: string;
  textMuted: string;
  /** Operator brand as a fill; text on it is `onBrand`. */
  brand: string;
  onBrand: string;
  /** Brand colour for text and icons on `surface` and `brandSoft`. */
  brandText: string;
  brandSoft: string;
  onBrandSoft: string;
  status: Record<StatusKey, Pair>;
  /** Over satellite imagery, whatever the scheme: text and icons, the halo behind them, and the guide line of a jump run */
  map: { text: string; halo: string; guide: string };
};

/** Brand used when an operator has not chosen a colour (D-UI3). */
export const DEFAULT_BRAND = '#1D3557';

const light: ColourTokens = {
  app: '#F4F5F7',
  surface: '#FFFFFF',
  raised: '#EEF0F3',
  border: '#DDE1E6',
  scrim: 'rgba(14, 17, 22, 0.45)',
  text: '#14181F',
  textMuted: '#5B6472',
  brand: DEFAULT_BRAND,
  onBrand: '#FFFFFF',
  brandText: DEFAULT_BRAND,
  brandSoft: '#E4EAF2',
  onBrandSoft: DEFAULT_BRAND,
  status: {
    open: { bg: '#E1EEFB', fg: '#0A4F96' },
    boarding: { bg: '#FFE6A8', fg: '#5C3B00' },
    departed: { bg: '#EBE3FA', fg: '#43287A' },
    landed: { bg: '#DDF2E3', fg: '#17592F' },
    cancelled: { bg: '#ECEEF1', fg: '#4A5260' },
    warning: { bg: '#FFE9D6', fg: '#7A3300' },
    blocked: { bg: '#FDE3E5', fg: '#8E1119' },
    ok: { bg: '#DDF2E3', fg: '#17592F' },
    info: { bg: '#E1EEFB', fg: '#0A4F96' },
  },
  map: { text: '#FFFFFF', halo: 'rgba(15, 15, 15, 0.5)', guide: '#FF1414' },
};

const dark: ColourTokens = {
  app: '#0E1116',
  surface: '#171B22',
  raised: '#232A34',
  border: '#2A313C',
  scrim: 'rgba(0, 0, 0, 0.6)',
  text: '#E8EBF0',
  textMuted: '#A9B2BF',
  brand: '#35C3CF',
  onBrand: '#04262A',
  brandText: '#35C3CF',
  brandSoft: '#13353A',
  onBrandSoft: '#35C3CF',
  status: {
    open: { bg: '#10304F', fg: '#9CCBFF' },
    boarding: { bg: '#4A3A12', fg: '#FFE08A' },
    departed: { bg: '#2B2147', fg: '#CDBBF5' },
    landed: { bg: '#12351F', fg: '#8FE3AE' },
    cancelled: { bg: '#262B33', fg: '#B4BCC8' },
    warning: { bg: '#4A2A0C', fg: '#FFC98A' },
    blocked: { bg: '#4A1519', fg: '#FFB3B8' },
    ok: { bg: '#12351F', fg: '#8FE3AE' },
    info: { bg: '#10304F', fg: '#9CCBFF' },
  },
  map: { text: '#FFFFFF', halo: 'rgba(15, 15, 15, 0.5)', guide: '#FF1414' },
};

export const colour: Record<Scheme, ColourTokens> = { light, dark };
