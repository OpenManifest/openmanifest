import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { OperatorState } from 'app/api/schema.d';
import { renderThemed } from 'app/ui/components/testing';
import BarList from '../BarList';
import OperatorList from '../OperatorList';
import StatGroup from '../StatGroup';

describe('<StatGroup />', () => {
  it('shows each figure under its heading, named for screen readers', async () => {
    const { getByRole, getByLabelText, getByTestId } = await renderThemed(
      <StatGroup
        title="Turnaround"
        testID="stats"
        stats={[
          { key: 'revenue', label: 'Revenue', value: '$55.50' },
          { key: 'loads', label: 'Loads flown', value: '5' },
        ]}
      />
    );

    expect(getByRole('heading', { name: 'Turnaround' })).toBeTruthy();
    expect(getByLabelText('Revenue: $55.50')).toBeTruthy();
    expect(getByTestId('stats-loads-value').props.children).toBe('5');
  });
});

describe('<BarList />', () => {
  it('lists each value with its count', async () => {
    const { getByLabelText, getByTestId } = await renderThemed(
      <BarList
        title="Loads by month"
        testID="bars"
        empty="None"
        bars={[
          { key: 'a', label: 'Oct 2026', count: 4 },
          { key: 'b', label: 'Nov 2026', count: 2 },
        ]}
      />
    );

    expect(getByLabelText('Oct 2026: 4')).toBeTruthy();
    expect(getByTestId('bars-b-count').props.children).toBe('2');
  });

  it('says when there is nothing to count', async () => {
    const { getByTestId, getByText } = await renderThemed(
      <BarList title="Loads by month" testID="bars" empty="No loads in this period" bars={[]} />
    );

    expect(getByTestId('bars-empty')).toBeTruthy();
    expect(getByText('No loads in this period')).toBeTruthy();
  });
});

describe('<OperatorList />', () => {
  const operator = {
    id: '1',
    name: 'Skydive Demo',
    status: OperatorState.Public,
    createdAt: '2026-01-02T00:00:00Z',
    timeZone: 'Australia/Brisbane',
    statistics: { loadsCount: 12, activeUserCount: 3 },
  } as never;

  it('shows each operator with its facts and counts it or not', async () => {
    const onToggleCounted = jest.fn();
    const { getByText, getByRole } = await renderThemed(
      <OperatorList
        operators={[operator]}
        counted={['1']}
        onToggleCounted={onToggleCounted}
        onChangeState={jest.fn()}
      />
    );

    expect(getByText('Skydive Demo')).toBeTruthy();
    expect(getByText(/12 loads · 3 active/)).toBeTruthy();
    const chip = getByRole('checkbox', { name: 'Counted', checked: true });
    await fireEvent.press(chip);
    expect(onToggleCounted).toHaveBeenCalledWith('1');
  });
});
