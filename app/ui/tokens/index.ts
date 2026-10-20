import { colour } from './colour';
import { density } from './density';
import { elevation } from './elevation';
import { motion } from './motion';
import { radius } from './radius';
import { space } from './space';
import { type } from './type';

export { colour, DEFAULT_BRAND } from './colour';
export type { ColourTokens, Pair, Scheme, StatusKey } from './colour';
export { contrastRatio, deriveBrand, relativeLuminance } from './contrast';
export type { DerivedBrand } from './contrast';
export { density } from './density';
export type { Density } from './density';
export { elevation } from './elevation';
export type { Elevation, ElevationKey } from './elevation';
export { motion } from './motion';
export type { MotionKey } from './motion';
export { radius } from './radius';
export type { RadiusKey } from './radius';
export { COLOUR_PRESETS } from './presets';
export { space } from './space';
export type { SpaceKey } from './space';
export { type } from './type';
export type { TypeKey, TypeStyle } from './type';

export const tokens = { colour, type, space, radius, elevation, density, motion };

export type Tokens = typeof tokens;
