import { LoadState } from 'app/api/schema.d';
import { needsConfirmation, planActions } from '../loadActions';

const base = { callMinutes: [20, 15, 10], canUpdate: true, isToday: true };

describe('planActions', () => {
  it('offers a call on an open load, with departing and cancelling on the side', () => {
    expect(planActions({ ...base, state: LoadState.Open })).toEqual({
      primary: 'call',
      menu: ['depart', 'cancelLoad'],
    });
  });

  it('departs an open load directly when the operator has no call schedule', () => {
    expect(planActions({ ...base, callMinutes: [], state: LoadState.Open })).toEqual({
      primary: 'depart',
      menu: ['cancelLoad'],
    });
  });

  it('departs a load on call, which can be called off or landed', () => {
    expect(planActions({ ...base, state: LoadState.Boarding })).toEqual({
      primary: 'depart',
      menu: ['cancelCall', 'complete'],
    });
  });

  it('lands a load that departed', () => {
    expect(planActions({ ...base, state: LoadState.Departed })).toEqual({
      primary: 'complete',
      menu: [],
    });
  });

  it('re-opens a load that is over, today only', () => {
    expect(planActions({ ...base, state: LoadState.Completed }).primary).toBe('reopen');
    expect(planActions({ ...base, state: LoadState.Cancelled }).primary).toBe('reopen');
    expect(planActions({ ...base, state: LoadState.Cancelled, isToday: false })).toEqual({
      primary: null,
      menu: [],
    });
  });

  it('only cancels a load of another day: it cannot be called or flown yet', () => {
    expect(planActions({ ...base, state: LoadState.Open, isToday: false })).toEqual({
      primary: null,
      menu: ['cancelLoad'],
    });
  });

  it('offers nothing to someone who may not change loads', () => {
    expect(planActions({ ...base, state: LoadState.Open, canUpdate: false })).toEqual({
      primary: null,
      menu: [],
    });
  });

  it('asks before cancelling a load, and before landing one that never departed', () => {
    expect(needsConfirmation('cancelLoad', LoadState.Open)).toBe(true);
    expect(needsConfirmation('complete', LoadState.Boarding)).toBe(true);
    expect(needsConfirmation('complete', LoadState.Departed)).toBe(false);
    expect(needsConfirmation('depart', LoadState.Open)).toBe(false);
  });
});
