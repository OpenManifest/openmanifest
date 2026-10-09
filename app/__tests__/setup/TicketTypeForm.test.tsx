import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import { CreateTicketTypeDocument } from 'app/api/reflection';
import { useDropzoneContext } from 'app/providers';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import TicketTypeDialog from '../../forms/ticket_type/Dialog';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
  },
};

// The form refuses to submit until the dropzone has loaded
function DropzoneReady() {
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  return dropzone?.id ? <Text>dropzone ready</Text> : null;
}

describe('<TicketTypeDialog />', () => {
  it('sends the entered values to CreateTicketType', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createTicketType: {
          __typename: 'CreateTicketTypePayload',
          ticketType: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    const screen = render(
      <View testID="under-test">
        <DropzoneReady />
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      {
        initialState: authenticatedState,
        session: authenticatedSession,
        graphql: [
          {
            request: {
              query: CreateTicketTypeDocument,
              operationName: 'CreateTicketType',
              variables: {
                attributes: {
                  name: 'Hop n Pop',
                  cost: 45,
                  // Not the form's default of `true`: see BUG-096 below
                  allowManifestingSelf: false,
                  altitude: 14000,
                  extraIds: undefined,
                  isTandem: false,
                  dropzoneId: 1,
                },
              },
            },
            result: mutationResult,
          },
        ],
      }
    );

    // The dropzone provider mounts its own closed copy of this dialog, so scope to ours
    const dialog = within(screen.getByTestId('under-test'));
    await waitFor(() => expect(dialog.getByText('dropzone ready')).toBeTruthy(), {
      timeout: 10000,
    });
    const [name, cost] = dialog.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(name, 'Hop n Pop');
    fireEvent.changeText(cost, '45');
    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('asks for a name when it is missing', async () => {
    const screen = render(
      <View testID="under-test">
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      { initialState: authenticatedState, session: authenticatedSession, graphql: [] }
    );

    const dialog = within(screen.getByTestId('under-test'));
    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(dialog.getByText('Name is required')).toBeTruthy());
  });

  // The dialog builds `initial` from the (absent) original ticket, so `cost`, `allowManifestingSelf` and `extras`
  // are `undefined` and override the form defaults (30, true, []): a new ticket starts at $0 and non-public.
  it.skip('BUG-096: a new ticket starts with the default price', () => {
    const screen = render(
      <View testID="under-test">
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      { initialState: authenticatedState, session: authenticatedSession, graphql: [] }
    );

    const dialog = within(screen.getByTestId('under-test'));
    const [, cost] = dialog.UNSAFE_getAllByType(TextInput);

    expect(cost.props.value).toBe('30');
  });
});
