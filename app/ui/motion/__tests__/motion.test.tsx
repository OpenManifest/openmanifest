import * as React from 'react';
import { AccessibilityInfo, Animated, Text as NativeText } from 'react-native';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Overlay from '../../components/overlay/Overlay';
import { renderThemed } from '../../components/testing';
import { motion } from '../../tokens/motion';
import { haptic } from '../haptics';
import { hapticOf } from '../hapticEvents';
import { cssEasing, overlayTransition } from '../transitions';
import { useHighlight } from '../useHighlight';
import { resetReduceMotion, useReduceMotion } from '../useReduceMotion';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

/** What the system answers when asked whether it wants less motion */
function systemReducesMotion(reduce: boolean) {
  resetReduceMotion();
  return jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduce);
}

afterEach(() => jest.restoreAllMocks());

describe('overlayTransition', () => {
  it('slides a sheet and a panel over motion.slow and fades a dialog over motion.base', () => {
    expect(overlayTransition('sheet', false)).toEqual({ duration: motion.slow, modal: 'slide' });
    expect(overlayTransition('panel', false)).toEqual({ duration: motion.slow, modal: 'slide' });
    expect(overlayTransition('dialog', false)).toEqual({ duration: motion.base, modal: 'fade' });
  });

  it.each(['sheet', 'panel', 'dialog'] as const)(
    'shows a %s at once with reduced motion',
    (kind) => {
      expect(overlayTransition(kind, true)).toEqual({ duration: 0, modal: 'none' });
    }
  );

  it('uses the standard easing', () => {
    expect(cssEasing).toBe('cubic-bezier(0.2, 0, 0, 1)');
  });
});

describe('useReduceMotion', () => {
  it.each([true, false])('follows the system setting (%s)', async (reduce) => {
    systemReducesMotion(reduce);
    const { result } = await renderHook(() => useReduceMotion());

    await waitFor(() => expect(result.current).toBe(reduce));
  });
});

describe('useHighlight', () => {
  it('fades out over motion.highlight', async () => {
    systemReducesMotion(false);
    const timing = jest.spyOn(Animated, 'timing');
    await renderHook(() => useHighlight(true));

    await waitFor(() =>
      expect(timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ toValue: 0, duration: motion.highlight })
      )
    );
  });

  it('stands still with reduced motion: shown while active, gone after', async () => {
    systemReducesMotion(true);
    const { result, rerender } = await renderHook(
      ({ active }: { active: boolean }) => useHighlight(active),
      {
        initialProps: { active: true },
      }
    );
    const reduce = await renderHook(() => useReduceMotion());
    await waitFor(() => expect(reduce.result.current).toBe(true));
    const timing = jest.spyOn(Animated, 'timing');
    // A new change once the setting is known
    await rerender({ active: false });
    await rerender({ active: true });

    expect(timing).not.toHaveBeenCalled();
    expect((result.current as unknown as { __getValue(): number }).__getValue()).toBe(1);
    await rerender({ active: false });
    expect((result.current as unknown as { __getValue(): number }).__getValue()).toBe(0);
  });
});

describe('Overlay motion (native)', () => {
  it('fades a dialog in, and shows it at once with reduced motion', async () => {
    systemReducesMotion(false);
    const moving = await renderThemed(
      <Overlay open onClose={jest.fn()} title="Edit" presentation="dialog" testID="o">
        <NativeText>Body</NativeText>
      </Overlay>
    );
    expect(moving.getByTestId('o-modal').props.animationType).toBe('fade');
    await moving.unmount();

    systemReducesMotion(true);
    const still = await renderThemed(
      <Overlay open onClose={jest.fn()} title="Edit" presentation="panel" testID="o">
        <NativeText>Body</NativeText>
      </Overlay>
    );
    await waitFor(() => expect(still.getByTestId('o-modal').props.animationType).toBe('none'));
  });
});

describe('haptics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('taps firmly on a call and plays a success on departure and landing', () => {
    expect(hapticOf('call')).toEqual({ kind: 'impact', style: 'medium' });
    expect(hapticOf('depart')).toEqual({ kind: 'notification', type: 'success' });
    expect(hapticOf('land')).toEqual({ kind: 'notification', type: 'success' });
  });

  it('plays them through expo-haptics on native', () => {
    haptic('call');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    haptic('land');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('does nothing on the web', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const web = require('../haptics.web') as typeof import('../haptics.web');
    web.haptic('depart');
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
