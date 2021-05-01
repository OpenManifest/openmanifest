import { round } from "lodash";

export default function calculateWingLoading(exitWeightInKg: number, canopySizeInFt: number) {
  return round((2.20462 * exitWeightInKg) / canopySizeInFt, 2).toFixed(2);
}