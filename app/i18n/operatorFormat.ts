import { create } from 'zustand';
import type { UnitSystem } from './units';

interface OperatorFormat {
  units: UnitSystem;
  currency: string;
}

/**
 * The units and the currency of the operator the app shows: set when the operator loads, read by the formatters that are
 * not hooks (`formatQuantity`, `formatMoney`, `formatCents`). Components that must redraw when they change use
 * `useOperatorFormat`.
 */
export const useOperatorFormat = create<OperatorFormat>()(() => ({ units: {}, currency: 'AUD' }));

export function setOperatorFormat(next: Partial<OperatorFormat>) {
  useOperatorFormat.setState(next);
}

export const activeUnits = () => useOperatorFormat.getState().units;

export const activeCurrency = () => useOperatorFormat.getState().currency;
