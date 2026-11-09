import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import IconButton from '../IconButton';
import { flat, onPlatform, renderThemed } from '../testing';

describe('IconButton', () => {
  it('is a button named by its aria-label', async () => {
    const screen = await renderThemed(
      <IconButton icon="close" aria-label="Close" onPress={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('presses, and ignores presses while disabled', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(
      <>
        <IconButton icon="close" aria-label="Close" onPress={onPress} />
        <IconButton icon="check" aria-label="Done" disabled onPress={onPress} />
      </>
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Done' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('is as big as the touch target of the platform', async () => {
    await onPlatform('ios', async () => {
      const screen = await renderThemed(
        <IconButton icon="close" aria-label="Close" onPress={jest.fn()} />
      );
      expect(flat(screen.getByRole('button', { name: 'Close' }))).toMatchObject({
        minWidth: 44,
        minHeight: 44,
      });
    });
    await onPlatform('android', async () => {
      const screen = await renderThemed(
        <IconButton icon="close" aria-label="Close" onPress={jest.fn()} />
      );
      expect(flat(screen.getByRole('button', { name: 'Close' }))).toMatchObject({
        minWidth: 48,
        minHeight: 48,
      });
    });
  });

  it('keeps a small box and reaches the touch target with hitSlop when dense', async () => {
    await onPlatform('android', async () => {
      const screen = await renderThemed(
        <IconButton icon="close" size={16} dense aria-label="Close" onPress={jest.fn()} />
      );
      const button = screen.getByRole('button', { name: 'Close' });
      const { width, height } = flat(button) as { width: number; height: number };
      const slop = button.props.hitSlop as number;

      expect(width).toBe(24);
      expect(height).toBe(24);
      expect(width + 2 * slop).toBeGreaterThanOrEqual(48);
    });
  });
});
