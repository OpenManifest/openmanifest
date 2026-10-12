import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import Button from '../Button';
import { colours, flat, onPlatform, renderThemed, SCHEMES } from './render';

// The touch that starts a press, as the responder system sends it
const GRANT = {
  persist: () => undefined,
  nativeEvent: { touches: [] },
  touchHistory: {
    touchBank: [],
    numberActiveTouches: 0,
    indexOfSingleActiveTouch: -1,
    mostRecentTimeStamp: 0,
  },
};

describe('Button', () => {
  it('is a button named by its label', async () => {
    const screen = await renderThemed(<Button label="Save" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('presses', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<Button label="Save" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('can be named more fully than it reads', async () => {
    const screen = await renderThemed(
      <Button label="Add" aria-label="Add a load" onPress={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Add a load' })).toBeTruthy();
  });

  it('ignores presses and says so while disabled', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<Button label="Save" disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Save' });

    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    expect(flat(button).opacity).toBeLessThan(1);
  });

  it('is busy while loading: it keeps its label, shows a spinner and ignores presses', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<Button label="Save" loading onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Save' });

    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ busy: true });
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
  });

  it('dims when pressed', async () => {
    const screen = await renderThemed(<Button label="Save" onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Save' });

    expect(flat(button).opacity).toBe(1);
    await fireEvent(button, 'responderGrant', GRANT);
    expect(flat(screen.getByRole('button', { name: 'Save' })).opacity).toBeLessThan(1);
  });

  it.each(SCHEMES)('uses the brand colours in the %s scheme', async (scheme) => {
    const c = colours[scheme];
    const screen = await renderThemed(
      <>
        <Button label="Primary" onPress={jest.fn()} />
        <Button label="Secondary" variant="secondary" onPress={jest.fn()} />
        <Button label="Tertiary" variant="tertiary" onPress={jest.fn()} />
        <Button label="Delete" variant="destructive" onPress={jest.fn()} />
      </>,
      { scheme }
    );
    const style = (name: string) => flat(screen.getByRole('button', { name }));

    expect(style('Primary').backgroundColor).toBe(c.brand);
    expect(style('Secondary').backgroundColor).toBe(c.brandSoft);
    expect(style('Tertiary').backgroundColor).toBe('transparent');
    expect(style('Delete').backgroundColor).toBe(c.status.blocked.bg);
    expect(flat(screen.getByText('Primary')).color).toBe(c.onBrand);
    expect(flat(screen.getByText('Delete')).color).toBe(c.status.blocked.fg);
  });

  it('follows the density, never below the touch target of the platform', async () => {
    await onPlatform('android', async () => {
      const compact = await renderThemed(<Button label="A" onPress={jest.fn()} />, {
        density: 'compact',
      });
      expect(flat(compact.getByRole('button', { name: 'A' })).minHeight).toBe(48);

      const comfortable = await renderThemed(<Button label="B" onPress={jest.fn()} />, {
        density: 'comfortable',
      });
      expect(flat(comfortable.getByRole('button', { name: 'B' })).minHeight).toBe(56);
    });
    await onPlatform('ios', async () => {
      const compact = await renderThemed(<Button label="C" onPress={jest.fn()} />, {
        density: 'compact',
      });
      expect(flat(compact.getByRole('button', { name: 'C' })).minHeight).toBe(44);
    });
  });
});
