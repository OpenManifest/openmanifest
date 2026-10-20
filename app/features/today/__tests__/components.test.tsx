import * as React from 'react';
import { makeLoad, slotOf } from 'app/__fixtures__/board.fixture';
import { LoadState } from 'app/api/schema.d';
import { renderThemed } from 'app/ui/components/testing';
import { fireEvent } from '@testing-library/react-native';
import CreditCard from '../CreditCard';
import NextLoadCard from '../NextLoadCard';
import ReadyChecklist from '../ReadyChecklist';
import TodayLoads from '../TodayLoads';

const rule = (code: string, ok: boolean, status: string, message: string | null = null) => ({
  __typename: 'EligibilityResult' as const,
  code,
  ok,
  status,
  message,
  problem: null,
  bypassed: false,
  expiresAt: null,
  amountCents: null,
});

describe('<ReadyChecklist />', () => {
  it('shows what needs fixing first, with the reason and a fix, and what is fine after', async () => {
    const onFix = jest.fn();
    const { getAllByTestId, getByTestId, getByText } = await renderThemed(
      <ReadyChecklist
        rules={[
          rule('age', true, 'PASS'),
          rule('credits', false, 'FAIL', 'Not enough credits to manifest for this jump'),
        ]}
        onFix={onFix}
      />
    );

    expect(getByText('Not enough credits to manifest for this jump')).toBeTruthy();
    expect(getByTestId('today-ready-status')).toBeTruthy();
    expect(getAllByTestId(/^today-ready-(credits|age)$/).map((row) => row.props.testID)).toEqual([
      'today-ready-credits',
      'today-ready-age',
    ]);
    await fireEvent.press(getByTestId('today-ready-credits-fix'));
    expect(onFix).toHaveBeenCalledWith(expect.objectContaining({ code: 'credits' }));
  });

  it('has no fix for a rule that is fine', async () => {
    const { queryByTestId } = await renderThemed(
      <ReadyChecklist rules={[rule('age', true, 'PASS')]} onFix={jest.fn()} />
    );

    expect(queryByTestId('today-ready-age-fix')).toBeNull();
  });
});

describe('<CreditCard />', () => {
  it('shows the credit, and a negative one as a problem', async () => {
    const { getByTestId } = await renderThemed(<CreditCard creditsCents={-4000} />);

    expect(getByTestId('today-credit-amount').props.children).toMatch(/40\.00/);
  });
});

describe('<NextLoadCard />', () => {
  const load = makeLoad({ id: '4', loadNumber: 4, state: LoadState.Open });
  const slot = slotOf('s1', 'Ann Ready');

  it('offers to take the member off when the dropzone lets them', async () => {
    const onTakeOff = jest.fn();
    const { getByTestId, queryByTestId } = await renderThemed(
      <NextLoadCard load={load} slot={slot} canTakeOff onTakeOff={onTakeOff} />
    );

    await fireEvent.press(getByTestId('today-next-load-take-off'));
    expect(onTakeOff).toHaveBeenCalled();
    expect(queryByTestId('today-next-load-desk')).toBeNull();
  });

  it('sends the member to the manifest desk when they may not change their booking', async () => {
    const { getByTestId, queryByTestId, getByText } = await renderThemed(
      <NextLoadCard load={load} slot={slot} deskOnly />
    );

    expect(queryByTestId('today-next-load-take-off')).toBeNull();
    expect(getByTestId('today-next-load-desk')).toBeTruthy();
    expect(getByText('Ask the manifest desk to change your booking')).toBeTruthy();
  });

  it('offers neither once the load has left', async () => {
    const left = makeLoad({ id: '4', loadNumber: 4, state: LoadState.Departed });
    const { queryByTestId } = await renderThemed(
      <NextLoadCard load={left} slot={slot} canTakeOff deskOnly />
    );

    expect(queryByTestId('today-next-load-take-off')).toBeNull();
    expect(queryByTestId('today-next-load-desk')).toBeNull();
  });
});

describe('<TodayLoads />', () => {
  it('lists the loads and marks the ones the member is on', async () => {
    const onOpen = jest.fn();
    const loads = [
      makeLoad({ id: '1', loadNumber: 1 }),
      makeLoad({ id: '2', loadNumber: 2, state: LoadState.Boarding }),
    ];
    const { getByText, getByTestId } = await renderThemed(
      <TodayLoads loads={loads} mineIds={new Set(['2'])} onOpen={onOpen} />
    );

    expect(getByText(/Load #2 · you are on it/)).toBeTruthy();
    await fireEvent.press(getByTestId('today-loads-1'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });
});
