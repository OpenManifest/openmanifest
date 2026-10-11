import * as React from 'react';
import { ManifestUserDocument } from 'app/api/reflection';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_ALLOWED_TICKET_TYPES from './__mocks__/QueryAllowedTicketTypes.mock';
import { MOCK_QUERY_ALLOWED_JUMP_TYPES } from './__mocks__/QueryAllowedJumpTypes.mock';
import ManifestUserDialog from '../../forms/manifest_user/Dialog';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const LOAD = { id: '7', loadNumber: 7, name: 'Load 7' };
const DROPZONE_USER = { id: '55', user: { id: '55', name: 'Test Jumper', exitWeight: '82' } };

describe('<ManifestUserDialog />', () => {
  it('sends the selected load, user, ticket, jump type and exit weight to ManifestUser', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createSlot: {
          __typename: 'CreateSlotPayload',
          errors: null,
          fieldErrors: null,
          slot: null,
        },
      },
    }));

    const screen = render(
      <ManifestUserDialog
        open
        load={LOAD}
        slot={{ dropzoneUser: DROPZONE_USER } as never}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
      {
        session: authenticatedSession,
        graphql: [
          MOCK_QUERY_ALLOWED_JUMP_TYPES({ allowedForDropzoneUserIds: [55] }),
          MOCK_QUERY_ALLOWED_TICKET_TYPES(),
          {
            request: {
              query: ManifestUserDocument,
              operationName: 'ManifestUser',
              variables: {
                jumpType: '1',
                extras: undefined,
                load: '7',
                rig: undefined,
                ticketType: '1',
                dropzoneUser: '55',
                exitWeight: 82,
              },
            },
            result: mutationResult,
          },
        ],
      }
    );

    // Jump and ticket type are auto-selected once their queries resolve
    await waitFor(() => expect(screen.getByText('Freefly')).toBeTruthy(), { timeout: 10000 });
    await waitFor(() => expect(screen.getAllByText('Height ($45)').length).toBeGreaterThan(0), {
      timeout: 10000,
    });

    // ManifestContextProvider mounts its own (closed) copy of this dialog, which cannot submit
    // because it has no load or user, so pressing every "Manifest" button only submits ours.
    screen.getAllByText('Manifest').forEach((button) => fireEvent.press(button));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
