import * as React from 'react';
import { Icon, type TextTone } from 'app/ui';
import { vehicleGlyph } from './vehicleGlyph';

export type VehicleIconProps = {
  /** The `kind` of the vehicle */
  kind?: string | null;
  size?: number;
  tone?: TextTone;
};

/** The glyph of a vehicle's kind: an aeroplane for an aircraft, a boat for a boat; decorative, the name sits beside it */
export default function VehicleIcon({ kind, size = 20, tone = 'muted' }: VehicleIconProps) {
  return <Icon name={vehicleGlyph(kind)} size={size} tone={tone} />;
}
