import * as React from 'react';
import '@testing-library/jest-native';
import { Permission } from 'app/api/schema.d';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_DROPZONE from './__mocks__/QueryDropzone.mock';
import MOCK_QUERY_ALLOWED_TICKET_TYPES from './__mocks__/QueryAllowedTicketTypes.mock';
import { MOCK_QUERY_ALLOWED_JUMP_TYPES } from './__mocks__/QueryAllowedJumpTypes.mock';
import MOCK_QUERY_FEDERATIONS from './__mocks__/QueryFederations.mock';
import MOCK_QUERY_ROLES from './__mocks__/QueryRoles.mock';
import MOCK_QUERY_LICENSES from './__mocks__/QueryLicenses.mock';
import MOCK_QUERY_LOADS from './__mocks__/QueryLoads.mock';
import MOCK_QUERY_PLANES from './__mocks__/QueryPlane.mock';
import MOCK_QUERY_DROPZONE_USERS from './__mocks__/QueryDropzoneUsers.mock';
import mockSubscriptionLoadCreated from './__mocks__/SubscriptionLoadCreated.mock';
import * as appRedux from '../../state';

import ManifestScreen from '../../screens/authenticated/dropzone/manifest/ManifestScreen';

describe('<ManifestScreen />', () => {
  it('should show LoadCards for every load', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        authenticated: true,
        credentials: { accessToken: 'jest', client: 'jest', uid: 'jest@example.com', tokenType: 'Bearer', expiry: 9999999999 },
        currentDropzoneId: 1,
      },
    };

    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE(),
        MOCK_QUERY_ALLOWED_TICKET_TYPES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_FEDERATIONS(),
        MOCK_QUERY_ROLES(),
        MOCK_QUERY_LICENSES(),
        MOCK_QUERY_LOADS(),
        MOCK_QUERY_PLANES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
        mockSubscriptionLoadCreated(),
      ],
      permissions: [Permission.ReadLoad, Permission.UpdateSlot],
      initialState,
    });

    await waitFor(async () => {
      const loads = screen.queryAllByTestId('load-card');

      expect(loads.length).toBe(2);
    }, { timeout: 10000 });
  });

  it('should show an empty message when no loads are available', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        authenticated: true,
        credentials: { accessToken: 'jest', client: 'jest', uid: 'jest@example.com', tokenType: 'Bearer', expiry: 9999999999 },
        currentDropzoneId: 1,
      },
    };
    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE(),
        MOCK_QUERY_ALLOWED_TICKET_TYPES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_FEDERATIONS(),
        MOCK_QUERY_ROLES(),
        MOCK_QUERY_LICENSES(),
        set(cloneDeep(MOCK_QUERY_LOADS()), 'result.data.loads.edges', []),
        MOCK_QUERY_PLANES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
        mockSubscriptionLoadCreated(),
      ],
      permissions: [Permission.ReadLoad, Permission.UpdateSlot],
      initialState,
    });

    await waitFor(
      () => {
        const loads = screen.queryAllByTestId('load-card');
        const text = screen.queryByText(/No loads so far today/);

        expect(loads.length).toBe(0);
        expect(text).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });
  /*
  it('should not be possible to manifest if membership expired', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        authenticated: true,
        credentials: { accessToken: 'jest', client: 'jest', uid: 'jest@example.com', tokenType: 'Bearer', expiry: 9999999999 },
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
        authenticated: true,
        credentials: { accessToken: 'jest', client: 'jest', uid: 'jest@example.com', tokenType: 'Bearer', expiry: 9999999999 },
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
        authenticated: true,
        credentials: { accessToken: 'jest', client: 'jest', uid: 'jest@example.com', tokenType: 'Bearer', expiry: 9999999999 },
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
