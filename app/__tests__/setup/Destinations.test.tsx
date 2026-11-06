import * as React from 'react';
import { View } from 'react-native';
import {
  ArchiveDestinationDocument,
  CreateDestinationDocument,
  DestinationsDocument,
} from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { fullAltitude, hopNPop, reef } from 'app/__fixtures__/destination.fixture';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { textInputs, scoped } from 'app/test-utils/hosts';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import mockQueryOperator from '../manifest/__mocks__/QueryOperator.mock';
import DestinationsScreen from '../../screens/authenticated/configuration/destinations/DestinationsScreen';

jest.setTimeout(30000);

const operatorWith = (kinds: string[], scope: string) =>
  mockQueryOperator({}, { operator: { modules: { destinations: { kinds, scope } } } } as never);

const listDestinations = (destinations: object[]) => ({
  request: { query: DestinationsDocument, variables: { operatorId: '1' } },
  result: { data: { operator: { __typename: 'Operator', id: '1', destinations } } },
  maxUsageCount: 5,
});

// The operator provider mounts its own closed form dialogs, so queries are scoped to the screen under test
function Subject() {
  return (
    <View testID="under-test">
      <DestinationsScreen />
    </View>
  );
}

describe('<DestinationsScreen />', () => {
  it('lists the places, an altitude as thousands of feet and a site by its kind', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [
        operatorWith(['altitude', 'site'], 'per_slot'),
        listDestinations([fullAltitude, hopNPop, reef]),
      ],
    });

    await waitFor(() => expect(screen.getByText('Full altitude')).toBeTruthy());
    expect(screen.getByText('14k · 14,000 ft')).toBeTruthy();
    expect(screen.getByText('4k · 4,000 ft')).toBeTruthy();
    expect(screen.getByText('Reef')).toBeTruthy();
    expect(screen.getByText('Site')).toBeTruthy();
  });

  it('says there is nothing yet and offers to add one', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [operatorWith(['altitude'], 'per_slot'), listDestinations([])],
    });

    await waitFor(() => expect(screen.getByText('No destinations yet')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'New destination' })).toBeTruthy();
  });

  it('does not offer to change them to someone who may not', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [],
      graphql: [operatorWith(['altitude'], 'per_slot'), listDestinations([fullAltitude])],
    });

    await waitFor(() => expect(screen.getByText('Full altitude')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Archive Full altitude' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'New destination' })).toBeNull();
  });

  it('creates an altitude from its name and height', async () => {
    const created = jest.fn(() => ({
      data: {
        createDestination: {
          __typename: 'CreateDestinationPayload',
          errors: null,
          fieldErrors: null,
          destination: { ...fullAltitude, id: '9', name: 'Wingsuit', altitudeM: 3657.6 },
        },
      },
    }));
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [
        operatorWith(['altitude'], 'per_slot'),
        listDestinations([]),
        {
          request: {
            query: CreateDestinationDocument,
            variables: {
              attributes: { name: 'Wingsuit', kind: 'altitude', altitudeM: 3657.6, operatorId: 1 },
            },
          },
          result: created,
        },
      ],
    });

    await waitFor(() => expect(screen.getByText('No destinations yet')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'New destination' }));
    const dialog = scoped(screen.getByTestId('under-test'));
    const [name, height] = textInputs(dialog.container);
    await fireEvent.changeText(name, 'Wingsuit');
    await fireEvent.changeText(height, '12000');
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
  });

  it('asks for a name', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [operatorWith(['altitude'], 'per_slot'), listDestinations([])],
    });

    await waitFor(() => expect(screen.getByText('No destinations yet')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'New destination' }));
    const dialog = scoped(screen.getByTestId('under-test'));
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(dialog.getByText('Name is required')).toBeTruthy());
  });

  it('archives a destination', async () => {
    const archived = jest.fn(() => ({
      data: {
        archiveDestination: {
          __typename: 'ArchiveDestinationPayload',
          errors: null,
          fieldErrors: null,
          destination: { ...hopNPop, discardedAt: '2027-10-08T00:00:00Z' },
        },
      },
    }));
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [
        operatorWith(['altitude'], 'per_slot'),
        listDestinations([fullAltitude, hopNPop]),
        {
          request: { query: ArchiveDestinationDocument, variables: { id: 2 } },
          result: archived,
        },
      ],
    });

    await waitFor(() => expect(screen.getByText('Hop n Pop')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Archive Hop n Pop' }));

    await waitFor(() => expect(archived).toHaveBeenCalledTimes(1));
  });
});
