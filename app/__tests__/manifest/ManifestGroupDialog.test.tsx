import * as React from 'react';
import { View } from 'react-native';
import { ManifestGroupDocument } from 'app/api/reflection';
import type { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { MOCK_QUERY_ALLOWED_ACTIVITY_TYPES } from './__mocks__/QueryAllowedActivityTypes.mock';
import MOCK_QUERY_LOAD from './__mocks__/QueryLoad.mock';
import ManifestGroupDialog from '../../forms/manifest_group';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const load = (MOCK_QUERY_LOAD().result as { data: { load: LoadDetailsFragment } }).data.load;
// The group being edited: the first two slots of the load
const slots = (load.slots as SlotDetailsFragment[]).slice(0, 2);
const userIds = slots.map((slot) => Number(slot.membership?.id));

const ticketType = {
  __typename: 'TicketType',
  id: '1',
  name: 'Height',
  costCents: 4500,
  isTandem: false,
  altitude: 14000,
  allowManifestingSelf: true,
  extras: [],
};

function renderDialog(
  ticketTypes: object[],
  extraGraphql: Parameters<typeof render>[1]['graphql'] = []
) {
  const screen = render(
    <View testID="under-test">
      <ManifestGroupDialog open load={load} slots={slots} onClose={jest.fn()} />
    </View>,
    {
      session: authenticatedSession,
      permissions: [Permission.CreateUserSlot],
      graphql: [
        MOCK_QUERY_ALLOWED_ACTIVITY_TYPES(
          { allowedForMembershipIds: userIds, isPublic: null as never },
          { operator: { ticketTypes } } as never
        ),
        ...extraGraphql,
      ],
    }
  );
  // The manifest context mounts closed copies of its own dialogs, so scope to ours
  return within(screen.getByTestId('under-test'));
}

describe('<ManifestGroupDialog />', () => {
  it('asks for a ticket before manifesting the group', async () => {
    const screen = renderDialog([]);

    fireEvent.press(screen.getAllByText('Next')[0]);
    await waitFor(() => expect(screen.getAllByText('Jump type').length).toBeGreaterThan(0));
    fireEvent.press(screen.getByText('Manifest'));

    await waitFor(() =>
      expect(screen.getByText('You must select a ticket type to manifest')).toBeTruthy()
    );
  });

  it('sends the group to ManifestGroup with the jump, ticket and every jumper', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createSlots: {
          __typename: 'CreateSlotsPayload',
          errors: null,
          fieldErrors: null,
          slots: null,
        },
      },
    }));
    const screen = renderDialog(
      [ticketType],
      [
        {
          request: {
            query: ManifestGroupDocument,
            operationName: 'ManifestGroup',
            variables: {
              activityType: '1',
              ticketType: '1',
              groupNumber: null,
              extras: [],
              load: '1',
              userGroup: slots.map((slot) => ({
                id: Number(slot.membership?.id),
                rig: undefined,
                bodyMassKg: Number(slot.bodyMassKg),
                guestName: undefined,
                guestBodyMassKg: undefined,
              })),
            },
          },
          result: mutationResult,
        },
      ]
    );

    fireEvent.press(screen.getAllByText('Next')[0]);
    await waitFor(() => expect(screen.getAllByText('Jump type').length).toBeGreaterThan(0));
    await waitFor(() => expect(screen.getAllByText('Height').length).toBeGreaterThan(0));
    // Let the jump type and ticket be selected by themselves
    await new Promise((resolve) => setTimeout(resolve, 300));
    fireEvent.press(screen.getByText('Manifest'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
