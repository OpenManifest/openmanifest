import * as React from 'react';
import { Text as NativeText } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import Button from '../Button';
import IconButton from '../IconButton';
import Banner from '../overlay/Banner';
import Menu from '../overlay/Menu';
import Overlay from '../overlay/Overlay';
import Popover from '../overlay/Popover';
import { resolvePresentation } from '../overlay/presentation';
import Toast from '../overlay/Toast';
import Tooltip from '../overlay/Tooltip';
import { colours, flat, renderThemed, SCHEMES } from '../testing';

describe('resolvePresentation', () => {
  it('is a sheet on a native phone, a panel on a wide window and a dialog elsewhere', () => {
    expect(resolvePresentation('auto', { breakpoint: 'compact', native: true })).toBe('sheet');
    expect(resolvePresentation('auto', { breakpoint: 'compact', native: false })).toBe('dialog');
    expect(resolvePresentation('auto', { breakpoint: 'medium', native: true })).toBe('dialog');
    expect(resolvePresentation('auto', { breakpoint: 'expanded', native: true })).toBe('panel');
    expect(resolvePresentation('auto', { breakpoint: 'expanded', native: false })).toBe('panel');
  });

  it('leaves an explicit choice alone', () => {
    expect(resolvePresentation('dialog', { breakpoint: 'expanded', native: true })).toBe('dialog');
    expect(resolvePresentation('sheet', { breakpoint: 'expanded', native: false })).toBe('sheet');
  });
});

describe('Banner', () => {
  it('says how urgent it is: an alert when blocked, a status otherwise', async () => {
    const screen = await renderThemed(
      <>
        <Banner message="Closed" tone="blocked" testID="blocked" />
        <Banner message="Winds" tone="warning" testID="warning" />
        <Banner message="Repack" testID="info" />
      </>
    );

    expect(screen.getByTestId('blocked').props.role).toBe('alert');
    expect(screen.getByTestId('warning').props.role).toBe('status');
    expect(screen.getByTestId('info').props.role).toBe('status');
  });

  it.each(SCHEMES)('uses the status colours in the %s scheme', async (scheme) => {
    const screen = await renderThemed(<Banner message="Winds" tone="warning" testID="b" />, {
      scheme,
    });

    expect(flat(screen.getByTestId('b')).backgroundColor).toBe(colours[scheme].status.warning.bg);
    expect(flat(screen.getByText('Winds')).color).toBe(colours[scheme].status.warning.fg);
  });

  it('has an action and a dismiss button when given', async () => {
    const onPress = jest.fn();
    const onDismiss = jest.fn();
    const screen = await renderThemed(
      <Banner message="Repack due" action={{ label: 'Update', onPress }} onDismiss={onDismiss} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Update' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has no buttons by default', async () => {
    const screen = await renderThemed(<Banner message="Repack due" />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Toast', () => {
  it('is an alert for an error and a status for the rest', async () => {
    const screen = await renderThemed(
      <>
        <Toast message="Could not save" tone="error" testID="error" />
        <Toast message="Saved" tone="success" testID="success" />
        <Toast message="FYI" testID="info" />
      </>
    );

    expect(screen.getByTestId('error').props.role).toBe('alert');
    expect(screen.getByTestId('success').props.role).toBe('status');
    expect(screen.getByTestId('info').props.role).toBe('status');
  });

  it.each(SCHEMES)('uses the colours of its tone in the %s scheme', async (scheme) => {
    const screen = await renderThemed(
      <>
        <Toast message="Could not save" tone="error" testID="error" />
        <Toast message="Saved" tone="success" testID="success" />
      </>,
      { scheme }
    );

    expect(flat(screen.getByTestId('error')).backgroundColor).toBe(
      colours[scheme].status.blocked.bg
    );
    expect(flat(screen.getByTestId('success')).backgroundColor).toBe(colours[scheme].status.ok.bg);
  });

  it('dismisses and acts', async () => {
    const onDismiss = jest.fn();
    const onPress = jest.fn();
    const screen = await renderThemed(
      <Toast message="Slot removed" action={{ label: 'Undo', onPress }} onDismiss={onDismiss} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Overlay', () => {
  it('shows nothing while closed', async () => {
    const screen = await renderThemed(
      <Overlay open={false} onClose={jest.fn()} title="Edit load" presentation="dialog">
        <NativeText>Body</NativeText>
      </Overlay>
    );

    expect(screen.queryByText('Edit load')).toBeNull();
  });

  it.each(['dialog', 'panel'] as const)(
    'is a dialog named by its title as a %s',
    async (presentation) => {
      const screen = await renderThemed(
        <Overlay
          open
          onClose={jest.fn()}
          title="Edit load"
          presentation={presentation}
          testID="overlay"
          footer={<Button label="Save" onPress={jest.fn()} />}
        >
          <NativeText>Body</NativeText>
        </Overlay>
      );

      expect(screen.getByTestId('overlay').props.role).toBe('dialog');
      expect(screen.getByTestId('overlay').props['aria-label']).toBe('Edit load');
      expect(screen.getByRole('heading', { name: 'Edit load' })).toBeTruthy();
      expect(screen.getByText('Body')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    }
  );

  it('closes from its close button and from the backdrop', async () => {
    const onClose = jest.fn();
    const screen = await renderThemed(
      <Overlay open onClose={onClose} title="Edit load" presentation="dialog" />
    );

    const closers = screen.getAllByRole('button', { name: 'Close' });
    expect(closers).toHaveLength(2);
    for (const closer of closers) {
      await fireEvent.press(closer);
    }

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('is pinned to the right as a panel and centred as a dialog', async () => {
    const panel = await renderThemed(
      <Overlay open onClose={jest.fn()} title="Edit" presentation="panel" testID="panel" />
    );
    expect(flat(panel.getByTestId('panel'))).toMatchObject({ maxWidth: 400 });

    const dialog = await renderThemed(
      <Overlay open onClose={jest.fn()} title="Edit" presentation="dialog" testID="dialog" />
    );
    expect(flat(dialog.getByTestId('dialog'))).toMatchObject({ maxWidth: 560 });
  });
});

describe('Popover', () => {
  it('opens from its trigger and closes from its content', async () => {
    const screen = await renderThemed(
      <Popover label="Weather" trigger={<Button label="Details" />}>
        {(close) => <Button label="Got it" onPress={close} />}
      </Popover>
    );

    expect(screen.queryByRole('button', { name: 'Got it' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByRole('button', { name: 'Got it' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Got it' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Got it' })).toBeNull());
  });

  it('is a dialog named by its label, and can be controlled', async () => {
    const onOpenChange = jest.fn();
    const screen = await renderThemed(
      <Popover
        label="Weather"
        open
        onOpenChange={onOpenChange}
        testID="popover"
        trigger={<Button label="Details" />}
      >
        <NativeText>Wind 8 kt</NativeText>
      </Popover>
    );

    expect(screen.getByTestId('popover').props['aria-label']).toBe('Weather');
    expect(screen.getByText('Wind 8 kt')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Menu', () => {
  const items = (onPress = jest.fn()) => [
    { label: 'Edit', onPress },
    { label: 'Archive', onPress, disabled: true },
    { label: 'Delete', onPress, destructive: true },
  ];

  it('opens from an icon button named by its label and lists the actions as menu items', async () => {
    const screen = await renderThemed(<Menu label="More actions" items={items()} />);

    expect(screen.queryByRole('menuitem')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'More actions' }));

    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Archive', disabled: true })).toBeTruthy();
  });

  it('runs the action and closes', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<Menu label="More actions" items={items(onPress)} />);

    await fireEvent.press(screen.getByRole('button', { name: 'More actions' }));
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menuitem')).toBeNull());
  });

  it('does not run a disabled action', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<Menu label="More actions" items={items(onPress)} />);

    await fireEvent.press(screen.getByRole('button', { name: 'More actions' }));
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Archive' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it.each(SCHEMES)(
    'shows a destructive action in the blocked colour in the %s scheme',
    async (scheme) => {
      const screen = await renderThemed(<Menu label="More actions" items={items()} />, { scheme });

      await fireEvent.press(screen.getByRole('button', { name: 'More actions' }));

      expect(flat(screen.getByText('Delete')).color).toBe(colours[scheme].status.blocked.fg);
      expect(flat(screen.getByText('Edit')).color).toBe(colours[scheme].text);
    }
  );

  it('can open from a trigger of your own', async () => {
    const screen = await renderThemed(
      <Menu
        label="Actions"
        items={items()}
        trigger={<IconButton icon="cog" aria-label="Settings" />}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });
});

describe('Tooltip', () => {
  it('leaves the control as it is on native, where there is no hover', async () => {
    const screen = await renderThemed(
      <Tooltip label="Open the settings">
        <IconButton icon="cog" aria-label="Settings" />
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
    expect(screen.queryByText('Open the settings')).toBeNull();
  });
});
