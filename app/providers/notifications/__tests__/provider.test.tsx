import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from 'app/i18n';
import { Button, ThemeProvider } from 'app/ui';
import { NotificationsProvider } from '../provider';
import { useNotifications } from '../context';

jest.mock('app/components/LottieView', () => 'LottieView');

function Buttons({ onUndo }: { onUndo?: () => void }) {
  const notify = useNotifications();
  return (
    <>
      <Button label="Fail" onPress={() => notify.error('Could not save')} />
      <Button
        label="Remove"
        onPress={() => notify.info('Slot removed', { label: 'Undo', onPress: onUndo ?? jest.fn() })}
      />
      <Button label="Info" onPress={() => notify.info('FYI')} />
    </>
  );
}

async function renderProvider(onUndo?: () => void) {
  await render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider scheme="light">
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          }}
        >
          <NotificationsProvider>
            <Buttons onUndo={onUndo} />
          </NotificationsProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

describe('NotificationsProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows an error as an alert, and takes it away after four seconds', async () => {
    await renderProvider();

    await fireEvent.press(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByTestId('toast').props.role).toBe('alert');
    expect(screen.getByText('Could not save')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(3900);
    });
    expect(screen.getByText('Could not save')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Could not save')).toBeNull();
  });

  it('keeps a message with an action longer, runs the action and goes away', async () => {
    const onUndo = jest.fn();
    await renderProvider(onUndo);

    await fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Slot removed')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Slot removed')).toBeNull();
  });

  it('can be dismissed, and shows the messages one after the other', async () => {
    await renderProvider();

    await fireEvent.press(screen.getByRole('button', { name: 'Fail' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Info' }));
    expect(screen.getByText('Could not save')).toBeTruthy();
    expect(screen.queryByText('FYI')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getByText('FYI')).toBeTruthy();
  });
});
