import * as React from 'react';
import '@testing-library/jest-native';
import { Permission } from 'app/api/schema.d';
import set from 'lodash/set';
import { render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_DROPZONE from './__mocks__/QueryDropzone.mock';
import MOCK_QUERY_ALLOWED_TICKET_TYPES from './__mocks__/QueryAllowedTicketTypes.mock';
import { MOCK_QUERY_ALLOWED_JUMP_TYPES } from './__mocks__/QueryAllowedJumpTypes.mock';
import * as appRedux from '../../state';

import ManifestScreen from '../../screens/authenticated/dropzone/manifest/ManifestScreen';

describe('<ManifestScreen />', () => {
  it('should show LoadCards for every load', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        currentDropzoneId: 1,
      },
    };

    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE(),
        MOCK_QUERY_ALLOWED_TICKET_TYPES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
      ],
      permissions: [Permission.ReadLoad, Permission.UpdateSlot],
      initialState,
    });

    await waitFor(async () => {
      const loads = screen.queryAllByTestId('load-card');

      expect(loads.length).toBe(2);
    });
  });

  it('should show an empty message when no loads are available', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        currentDropzoneId: 1,
      },
    };
    const screen = render(<ManifestScreen />, {
      graphql: [
        set({ ...MOCK_QUERY_DROPZONE() }, 'result.data.dropzone.loads.edges', null),
        MOCK_QUERY_ALLOWED_TICKET_TYPES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
      ],
      permissions: [Permission.ReadLoad, Permission.UpdateSlot],
      initialState,
    });

    await waitFor(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      const loads = screen.queryAllByTestId('load-card');
      const text = screen.queryByText(/Setup/);

      expect(loads.length).toBe(0);
      expect(text).toBeTruthy();
    });
  });
  /*
  it('should not be possible to manifest if membership expired', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        currentDropzoneId: 1,
      },
      screens: {
        ...appRedux.initialState.screens,
        manifest: {
          ...appRedux.initialState.screens.manifest,
          display: 'list',
        },
      },
    };
    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE({
          currentUser: {
            hasMembership: false,
          },
        }),
        MOCK_QUERY_ALLOWED_TICKET_TYPES,
        MOCK_QUERY_ALLOWED_JUMP_TYPES,
        MOCK_QUERY_LOAD({}),
      ],
      permissions: ['createSlot'],
      initialState,
    });

    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const [manifestButton] = screen.getAllByTestId('manifest-button');
      await fireEvent.press(manifestButton);

      expect(screen.queryAllByTestId('manifest-form').length).toBe(0);
      expect(screen.queryAllByTestId('snackbar-message').length).toBe(1);
    });
  });

  it('shouldnt be possible to manifest without funds when useCreditSystem = true', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        currentDropzoneId: 1,
      },
      screens: {
        ...appRedux.initialState.screens,
        manifest: {
          ...appRedux.initialState.screens.manifest,
          display: 'list',
        },
      },
    };
    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE({
          currentUser: {
            hasCredits: false,
          },
        }),
        MOCK_QUERY_ALLOWED_TICKET_TYPES,
        MOCK_QUERY_ALLOWED_JUMP_TYPES,
        MOCK_QUERY_LOAD({}),
      ],
      permissions: ['createSlot'],
      initialState,
    });

    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const [manifestButton] = screen.getAllByTestId('manifest-button');
      expect(screen.queryAllByTestId('manifest-form').length).not.toBeVisible();
      await fireEvent.press(manifestButton);
      const notifications = await screen.findAllByTestId('snackbar-message');
      expect(notifications.length).toBe(1);
      expect(screen.queryAllByTestId('manifest-form').length).not.toBeVisible();
    });
  });

  it('should open a bottom sheet or dialog if group manifest button is clicked', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        currentDropzoneId: 1,
      },
      screens: {
        ...appRedux.initialState.screens,
        manifest: {
          ...appRedux.initialState.screens.manifest,
          display: 'list',
        },
      },
    };
    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE(),
        MOCK_QUERY_ALLOWED_TICKET_TYPES,
        MOCK_QUERY_ALLOWED_JUMP_TYPES,
        MOCK_QUERY_LOAD({}),
      ],
      permissions: ['createUserSlot'],
      initialState,
    });

    await waitFor(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const [manifestGroupButton] = screen.getAllByTestId('manifest-group-button');
      await fireEvent.press(manifestGroupButton);

      expect(screen.queryAllByTestId('manifest-group-sheet').length).toBe(1);
    });
  });
  */
});
