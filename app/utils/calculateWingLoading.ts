import { round } from 'lodash';

export default function calculateWingLoading(bodyMassKgInKg: number, canopySizeInFt: number) {
  return round((2.20462 * bodyMassKgInKg) / canopySizeInFt, 2).toFixed(2);
}
