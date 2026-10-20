import * as React from 'react';
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import { renderWithProviders, type TestRole } from 'app/test-utils/render';
import AppNavigation, { barItems, tabBarPositionFor } from '../AppNavigation';
import { destinationsFor } from '../destinations';

const routes = ['Overview', 'Manifest', 'Notifications', 'Users'].map((name) => ({
  name,
  key: `${name}-key`,
}));

function fakeProps(focused = 'Manifest') {
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const dispatch = jest.fn();
  return {
    props: {
      state: { routes, index: routes.findIndex((route) => route.name === focused) },
      navigation: { navigate, emit, dispatch },
      descriptors: {},
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    } as unknown as React.ComponentProps<typeof AppNavigation>,
    navigate,
    dispatch,
  };
}

describe('tabBarPositionFor', () => {
  it('is the bottom on a phone and the left elsewhere', () => {
    expect(tabBarPositionFor('compact')).toBe('bottom');
    expect(tabBarPositionFor('medium')).toBe('left');
    expect(tabBarPositionFor('expanded')).toBe('left');
  });
});

describe('barItems', () => {
  it('lists, on a wide window, the destinations that have a screen, one per tab', () => {
    const everything = destinationsFor({
      permissions: ['readLoad', 'readUser', 'viewStatistics', 'readUserTransactions'] as never,
      modules: {},
      moderationRole: 'moderator' as never,
    });

    expect(barItems(everything).map((item) => item.key)).toEqual([
      'today',
      'board',
      'people',
      'inbox',
      'money',
      'platform',
    ]);
  });
});

describe('barItems on a phone', () => {
  it('keeps the primary destinations: the rest is under More', () => {
    const everything = destinationsFor({
      permissions: [
        'readLoad',
        'readUser',
        'viewStatistics',
        'readUserTransactions',
        'updateOperator',
      ] as never,
      modules: {},
    });

    expect(barItems(everything, true).map((item) => item.key)).toEqual([
      'today',
      'board',
      'people',
      'inbox',
    ]);
  });
});

describe('AppNavigation', () => {
  const tabs = async (
    role: TestRole,
    breakpoint: 'compact' | 'medium' | 'expanded' = 'compact'
  ) => {
    const { props } = fakeProps();
    const screen = await renderWithProviders(<AppNavigation {...props} />, { role, breakpoint });
    await waitFor(() => expect(screen.getByLabelText('Main')).toBeTruthy());
    return screen;
  };
  const names = (screen: Awaited<ReturnType<typeof tabs>>) =>
    within(screen.getByLabelText('Main'))
      .getAllByRole('button')
      .map((tab) => tab.props['aria-label'] ?? tab.props.accessibilityLabel);

  it('shows an owner today, the board, the inbox and people, in the order of the table', async () => {
    expect(names(await tabs('owner'))).toEqual(['Today', 'Board', 'People', 'Inbox', 'More']);
  });

  it('shows a student today, the board and the inbox', async () => {
    expect(names(await tabs('student'))).toEqual(['Today', 'Board', 'Inbox', 'More']);
  });

  it('marks the focused tab as current and names the landmark', async () => {
    const screen = await tabs('manifest');

    expect(screen.getByLabelText('Main').props.role).toBe('navigation');
    const board = screen.getByRole('button', { name: 'Board' });
    expect(board.props['aria-current']).toBe('page');
    expect(screen.getByRole('button', { name: 'People' }).props['aria-current']).toBeUndefined();
  });

  it('opens a tab when it is pressed', async () => {
    const { props, navigate } = fakeProps();
    const screen = await renderWithProviders(<AppNavigation {...props} />, { role: 'manifest' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'People' })).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: 'People' }));

    expect(navigate).toHaveBeenCalledWith('Users');
  });

  it('shows the operator and the account in the sidebar of a wide window', async () => {
    const screen = await tabs('owner', 'expanded');

    expect(screen.getByRole('button', { name: 'Switch operator' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeTruthy();
  });

  it('has no sidebar on a phone', async () => {
    const screen = await tabs('owner');

    expect(screen.queryByRole('button', { name: 'Switch operator' })).toBeNull();
  });
});
