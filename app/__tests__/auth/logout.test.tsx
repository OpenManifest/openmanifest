import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import * as appRedux from '../../state';
import { initialSession, useSession } from '../../state';
import { createStore } from 'redux';
import { Provider as Redux } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render as rtlRender } from '@testing-library/react-native';
import { rootReducer } from '../../state/store';
import { useLogout } from '../../api/hooks/useLogout';
import { abortController } from '../../api/client/links';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

// The real links module needs a browser global (`self`), a server URL and an AbortController at import time.
jest.mock('../../api/client/links', () => ({
  abortController: new (require('abort-controller'))(),
}));

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
  },
};

// Only Redux and Apollo are needed here, so avoid the full app wrapper (its Paper animations outlive a sync test).
function render(ui: React.ReactElement) {
  useSession.setState({ ...initialSession, ...authenticatedSession, hydrated: true });
  const store = createStore(rootReducer, authenticatedState);
  const screen = rtlRender(
    <Redux store={store}>
      <MockedProvider mocks={[]}>{ui}</MockedProvider>
    </Redux>
  );
  return { ...screen, store };
}

function LogoutButton() {
  const logout = useLogout();
  return (
    <TouchableOpacity onPress={logout}>
      <Text>Log out</Text>
    </TouchableOpacity>
  );
}

describe('useLogout', () => {
  it('resets the global state and aborts in-flight requests', () => {
    const abort = jest.spyOn(abortController, 'abort');
    const screen = render(<LogoutButton />);

    expect(useSession.getState().credentials).toBeTruthy();
    fireEvent.press(screen.getByText('Log out'));

    expect(abort).toHaveBeenCalledTimes(1);
    expect(useSession.getState().credentials).toBeNull();
    expect(useSession.getState().currentDropzoneId).toBeNull();
    expect(screen.store.getState().global.authenticated).toBe(false);
    abort.mockRestore();
    screen.unmount();
  });

  // The module-level AbortController is aborted by logout and never replaced, so every request made by the
  // next session carries an already-aborted signal.
  it.skip('BUG-063: logout leaves a usable AbortController for the next session', () => {
    const screen = render(<LogoutButton />);

    fireEvent.press(screen.getByText('Log out'));

    expect(abortController.signal.aborted).toBe(false);
    screen.unmount();
  });
});
