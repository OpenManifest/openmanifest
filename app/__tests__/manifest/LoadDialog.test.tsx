import * as React from 'react';
import { View } from 'react-native';
import { scoped } from 'app/test-utils/hosts';
import { Permission } from 'app/api/schema.d';
import { CreateLoadDocument, DestinationsDocument, VehiclesDocument } from 'app/api/reflection';
import { fullAltitude, reef } from 'app/__fixtures__/destination.fixture';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_VEHICLES from './__mocks__/QueryVehicle.mock';
import MOCK_QUERY_MEMBERSHIPS from './__mocks__/QueryMemberships.mock';
import MOCK_QUERY_OPERATOR from './__mocks__/QueryOperator.mock';
import LoadDialog from '../../forms/load/Dialog';
import { NotificationContext } from 'app/providers/notifications/context';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const BEAVER = {
  __typename: 'Vehicle',
  id: '1',
  name: 'Beaver',
  registration: 'ABC123',
  minCapacity: 0,
  capacity: 10,
};

const membership = (id: string, name: string) => ({
  __typename: 'Membership',
  id,
  walletId: id,
  expiresAt: null,
  hasCredits: true,
  hasMembership: true,
  hasLicense: true,
  hasBodyMassKg: true,
  role: null,
  license: null,
  user: {
    __typename: 'User',
    id,
    name,
    nickname: null,
    phone: null,
    email: null,
    bodyMassKg: '80',
    moderationRole: null,
    image: null,
    apfNumber: null,
  },
});

// Builds the mock without touching the shared fixture (the helper merges overrides in place).
function usersWithPermission(permission: Permission, user: Awaited<ReturnType<typeof membership>>) {
  const mock = MOCK_QUERY_MEMBERSHIPS({ permissions: [permission] });
  return {
    ...mock,
    result: {
      data: {
        __typename: 'Query',
        memberships: {
          __typename: 'MembershipConnection',
          edges: [{ __typename: 'MembershipEdge', node: user }],
        },
      },
    },
  };
}

describe('<LoadDialog />', () => {
  it('sends the selected plane, pilot and GCA to CreateLoad', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createLoad: {
          __typename: 'CreateLoadPayload',
          load: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    const screen = await render(<LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />, {
      session: authenticatedSession,
      graphql: [
        MOCK_QUERY_VEHICLES(),
        usersWithPermission(Permission.ActAsGca, membership('31', 'Gina GCA')),
        usersWithPermission(Permission.ActAsPilot, membership('32', 'Pete Pilot')),
        {
          request: {
            query: CreateLoadDocument,
            operationName: 'CreateLoad',
            variables: {
              gca: '31',
              pilot: '32',
              vehicle: '1',
              maxSlots: 10,
              state: 'open',
              name: null,
            },
          },
          result: mutationResult,
        },
      ],
    });

    // Vehicle, GCA and pilot are auto-selected once their queries resolve, and the vehicle sets max slots
    await waitFor(() => expect(screen.getAllByText('Gina GCA').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Pete Pilot').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Beaver').length).toBeGreaterThan(0), {
      timeout: 10000,
    });

    // ManifestContextProvider mounts its own (closed) copy of this dialog, which is never filled in,
    // so pressing every "Create" button only submits ours.
    // One press at a time: overlapping act() calls break React's act queue
    for (const button of screen.getAllByText('Create')) {
      await fireEvent.press(button);
    }

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('sends the places in order when the operator’s loads go to places', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createLoad: {
          __typename: 'CreateLoadPayload',
          load: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    // The manifest provider mounts its own closed copy of the dialog, so queries are scoped to ours
    const screen = await render(
      <View testID="under-test">
        <LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />
      </View>,
      {
        session: authenticatedSession,
        graphql: [
          MOCK_QUERY_OPERATOR({}, {
            operator: { modules: { destinations: { kinds: ['site'], scope: 'per_load' } } },
          } as never),
          {
            request: { query: DestinationsDocument, variables: { operatorId: '1' } },
            result: {
              data: {
                operator: {
                  __typename: 'Operator',
                  id: '1',
                  destinations: [fullAltitude, reef],
                },
              },
            },
            maxUsageCount: 10,
          },
          MOCK_QUERY_VEHICLES(),
          usersWithPermission(Permission.ActAsGca, membership('31', 'Gina GCA')),
          usersWithPermission(Permission.ActAsPilot, membership('32', 'Pete Pilot')),
          {
            request: {
              query: CreateLoadDocument,
              operationName: 'CreateLoad',
              variables: {
                gca: '31',
                pilot: '32',
                vehicle: '1',
                maxSlots: 10,
                state: 'open',
                name: null,
                destinationIds: [3, 1],
              },
            },
            result: mutationResult,
          },
        ],
      }
    );

    await waitFor(() => expect(screen.getAllByText('Gina GCA').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Pete Pilot').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Beaver').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    const form = scoped(screen.getByTestId('under-test'));
    await waitFor(() => expect(form.getByTestId('load-destinations')).toBeTruthy(), {
      timeout: 10000,
    });

    // One at a time: the list leaves out what is already in it
    for (const name of ['Reef', 'Full altitude (14k)']) {
      await fireEvent.press(form.getByRole('combobox', { name: 'Add destination' }));
      await fireEvent.press(screen.getByRole('option', { name }));
    }
    await waitFor(() => expect(form.getByText('2. Full altitude')).toBeTruthy());

    await fireEvent.press(form.getByText('Create'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('sends the vehicles with their roles when the operator has loads with several', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createLoad: {
          __typename: 'CreateLoadPayload',
          load: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const tug = { ...BEAVER, id: '2', name: 'Tug', registration: 'TUG1', capacity: 1 };

    // The manifest provider mounts its own closed copy of the dialog, so queries are scoped to ours
    const screen = await render(
      <View testID="under-test">
        <LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />
      </View>,
      {
        session: authenticatedSession,
        graphql: [
          MOCK_QUERY_OPERATOR({}, { operator: { modules: { multi_vehicle: {} } } } as never),
          {
            request: { query: VehiclesDocument, variables: { operatorId: '1' } },
            result: { data: { __typename: 'Query', vehicles: [BEAVER, tug] } },
            maxUsageCount: 10,
          },
          usersWithPermission(Permission.ActAsGca, membership('31', 'Gina GCA')),
          usersWithPermission(Permission.ActAsPilot, membership('32', 'Pete Pilot')),
          {
            request: {
              query: CreateLoadDocument,
              operationName: 'CreateLoad',
              variables: {
                gca: '31',
                pilot: '32',
                maxSlots: 10,
                state: 'open',
                name: null,
                vehicles: [
                  { vehicleId: '1', role: 'carrying' },
                  { vehicleId: '2', role: 'support' },
                ],
              },
            },
            result: mutationResult,
          },
        ],
      }
    );
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('Gina GCA')).toBeTruthy(), { timeout: 10000 });
    await waitFor(() => expect(form.getByText('Pete Pilot')).toBeTruthy(), { timeout: 10000 });
    await waitFor(() => expect(form.getByText('Carries 10')).toBeTruthy(), { timeout: 10000 });
    await fireEvent.press(form.getByRole('combobox', { name: 'Add vehicle' }));
    await fireEvent.press(screen.getByRole('option', { name: 'Tug' }));
    await fireEvent.press(await form.findByRole('button', { name: 'Make Tug support the load' }));
    await fireEvent.press(form.getByText('Create'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  // BUG-067: creating a load used to run the staff member's own jumper prerequisites (membership, licence, rig
  // inspection, reserve), so manifest staff without a valid membership could not create loads
  describe('as staff without a valid membership of their own', () => {
    const operator = MOCK_QUERY_OPERATOR();
    const data = (operator.result as { data: { operator: Record<string, any> } }).data;
    const withoutMembership = {
      ...operator,
      result: {
        data: {
          ...data,
          operator: {
            ...data.operator,
            settings: { ...data.operator.settings, requireMembership: true },
            currentUser: { ...data.operator.currentUser, hasMembership: false },
          },
        },
      },
    };

    async function renderDialog(
      createLoadResult: jest.Mock,
      notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() }
    ) {
      const screen = await render(
        <NotificationContext.Provider value={notifications}>
          <LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />
        </NotificationContext.Provider>,
        {
          session: authenticatedSession,
          graphql: [
            withoutMembership as never,
            MOCK_QUERY_VEHICLES(),
            usersWithPermission(Permission.ActAsGca, membership('31', 'Gina GCA')),
            usersWithPermission(Permission.ActAsPilot, membership('32', 'Pete Pilot')),
            {
              request: {
                query: CreateLoadDocument,
                operationName: 'CreateLoad',
                variables: {
                  gca: '31',
                  pilot: '32',
                  vehicle: '1',
                  maxSlots: 10,
                  state: 'open',
                  name: null,
                },
              },
              result: createLoadResult,
            },
          ],
        }
      );
      return screen;
    }

    async function submit(screen: Awaited<ReturnType<typeof renderDialog>>) {
      await waitFor(() => expect(screen.getAllByText('Pete Pilot').length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      await waitFor(() => expect(screen.getAllByText('Gina GCA').length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      await waitFor(() => expect(screen.getAllByText('Beaver').length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      // One press at a time: overlapping act() calls break React's act queue
      for (const button of screen.getAllByText('Create')) {
        await fireEvent.press(button);
      }
    }

    it('still creates the load', async () => {
      const createLoadResult = jest.fn(() => ({
        data: {
          createLoad: {
            __typename: 'CreateLoadPayload',
            load: null,
            errors: null,
            fieldErrors: null,
          },
        },
      }));

      await submit(await renderDialog(createLoadResult));

      await waitFor(() => expect(createLoadResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
    });

    it('shows an error of the load as a whole, like a missing GCA', async () => {
      const notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
      const createLoadResult = jest.fn(() => ({
        data: {
          createLoad: {
            __typename: 'CreateLoadPayload',
            load: null,
            errors: ['Every load must have a GCA'],
            fieldErrors: null,
          },
        },
      }));

      await submit(await renderDialog(createLoadResult, notifications));

      await waitFor(
        () => expect(notifications.error).toHaveBeenCalledWith('Every load must have a GCA'),
        { timeout: 10000 }
      );
    });
  });
});
