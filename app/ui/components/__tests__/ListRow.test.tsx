import * as React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import ListRow from '../ListRow';
import { colours, flat, renderThemed, SCHEMES } from './render';

describe('ListRow', () => {
  it('shows the title, the supporting text, the leading and the trailing content', async () => {
    const screen = await renderThemed(
      <ListRow
        title="Olive Owner"
        supporting="Owner"
        leading={<Text>L</Text>}
        trailing={<Text>T</Text>}
      />
    );

    for (const text of ['Olive Owner', 'Owner', 'L', 'T']) {
      expect(screen.getByText(text)).toBeTruthy();
    }
  });

  it('is plain content without onPress', async () => {
    const screen = await renderThemed(<ListRow title="Olive Owner" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is a button named by its title with onPress', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<ListRow title="Olive Owner" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Olive Owner' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('can be named more fully than its title', async () => {
    const screen = await renderThemed(
      <ListRow title="Olive" aria-label="Open Olive Owner" onPress={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Open Olive Owner' })).toBeTruthy();
  });

  it('ignores presses while disabled', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<ListRow title="Olive" disabled onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Olive' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it.each(SCHEMES)(
    'marks the selected row with aria-current and the brand fill in the %s scheme',
    async (scheme) => {
      const screen = await renderThemed(
        <>
          <ListRow title="Board" selected onPress={jest.fn()} />
          <ListRow title="People" onPress={jest.fn()} />
        </>,
        { scheme }
      );
      const board = screen.getByRole('button', { name: 'Board' });
      const people = screen.getByRole('button', { name: 'People' });

      expect(board.props['aria-current']).toBe(true);
      expect(people.props['aria-current']).toBeUndefined();
      expect(flat(board).backgroundColor).toBe(colours[scheme].brandSoft);
      expect(flat(people).backgroundColor).toBe('transparent');
    }
  );

  it.each([
    ['compact', 40],
    ['regular', 48],
    ['comfortable', 56],
  ] as const)('is at least %s high (%d)', async (density, height) => {
    const screen = await renderThemed(<ListRow title="Row" onPress={jest.fn()} />, { density });

    expect(flat(screen.getByRole('button', { name: 'Row' })).minHeight).toBe(height);
  });
});
