import * as React from 'react';
import { Text, View } from 'react-native';
import { CreateTicketTypeDocument, DestinationsDocument } from 'app/api/reflection';
import { fullAltitude, hopNPop } from 'app/__fixtures__/destination.fixture';
import mockQueryOperator from '../manifest/__mocks__/QueryOperator.mock';
import { useOperatorContext } from 'app/providers';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import TicketTypeDialog from '../../forms/ticket_type/Dialog';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { scoped, textInputs } from 'app/test-utils/hosts';

jest.setTimeout(30000);

// The form refuses to submit until the operator has loaded
function OperatorReady() {
  const {
    operator: { operator },
  } = useOperatorContext();
  return operator?.id ? <Text>dropzone ready</Text> : null;
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

    const screen = await render(
      <View testID="under-test">
        <OperatorReady />
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      {
        session: authenticatedSession,
        graphql: [
          {
            request: {
              query: CreateTicketTypeDocument,
              operationName: 'CreateTicketType',
              variables: {
                attributes: {
                  name: 'Hop n Pop',
                  costCents: 4500,
                  allowManifestingSelf: true,
                  defaultDestinationId: null,
                  extraIds: [],
                  requiresEscort: false,
                  participantLimits: {},
                  escortCapacity: 1,
                  operatorId: 1,
                },
              },
            },
            result: mutationResult,
          },
        ],
      }
    );

    // The operator provider mounts its own closed copy of this dialog, so scope to ours
    const dialog = scoped(screen.getByTestId('under-test'));
    await waitFor(() => expect(dialog.getByText('dropzone ready')).toBeTruthy(), {
      timeout: 10000,
    });
    const [name, cost] = textInputs(dialog.container);
    await fireEvent.changeText(name, 'Hop n Pop');
    await fireEvent.changeText(cost, '45');
    await fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('sends the default destination chosen from the operator’s destinations', async () => {
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

    const screen = await render(
      <View testID="under-test">
        <OperatorReady />
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      {
        session: authenticatedSession,
        graphql: [
          mockQueryOperator({}, {
            operator: { modules: { destinations: { kinds: ['altitude'], scope: 'per_slot' } } },
          } as never),
          {
            request: { query: DestinationsDocument, variables: { operatorId: '1' } },
            result: {
              data: {
                operator: {
                  __typename: 'Operator',
                  id: '1',
                  destinations: [fullAltitude, hopNPop],
                },
              },
            },
            maxUsageCount: 10,
          },
          {
            request: {
              query: CreateTicketTypeDocument,
              operationName: 'CreateTicketType',
              variables: {
                attributes: {
                  name: 'Hop n Pop',
                  costCents: 4500,
                  allowManifestingSelf: true,
                  defaultDestinationId: 2,
                  extraIds: [],
                  requiresEscort: false,
                  participantLimits: {},
                  escortCapacity: 1,
                  operatorId: 1,
                },
              },
            },
            result: mutationResult,
          },
        ],
      }
    );

    const dialog = scoped(screen.getByTestId('under-test'));
    await waitFor(() => expect(dialog.getByText('dropzone ready')).toBeTruthy(), {
      timeout: 10000,
    });
    const [name, cost] = textInputs(dialog.container);
    await fireEvent.changeText(name, 'Hop n Pop');
    await fireEvent.changeText(cost, '45');
    await fireEvent.press(await dialog.findByRole('combobox', { name: 'Default destination' }));
    await fireEvent.press(await screen.findByRole('option', { name: 'Hop n Pop (4k)' }));
    await fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('asks for a name when it is missing', async () => {
    const screen = await render(
      <View testID="under-test">
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      { session: authenticatedSession, graphql: [] }
    );

    const dialog = scoped(screen.getByTestId('under-test'));
    await fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(dialog.getByText('Name is required')).toBeTruthy());
  });

  // The dialog builds `initial` from the (absent) original ticket, so `cost`, `allowManifestingSelf` and `extras`
  // are `undefined` and override the form defaults (30, true, []): a new ticket starts at $0 and non-public.
  it('BUG-096: a new ticket starts with the default price', async () => {
    const screen = await render(
      <View testID="under-test">
        <TicketTypeDialog open onClose={jest.fn()} />
      </View>,
      { session: authenticatedSession, graphql: [] }
    );

    const dialog = scoped(screen.getByTestId('under-test'));
    const [, cost] = textInputs(dialog.container);

    expect(cost.props.value).toBe('30');
  });
});
