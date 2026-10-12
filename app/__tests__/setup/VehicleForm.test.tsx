import * as React from 'react';
import { Text, View } from 'react-native';
import { CreateVehicleDocument } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import VehicleDialog from '../../forms/vehicle/Dialog';
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

describe('<VehicleDialog />', () => {
  it('sends the entered values to CreateAircraft', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createVehicle: {
          __typename: 'CreateVehiclePayload',
          vehicle: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    const screen = await render(
      <View testID="under-test">
        <OperatorReady />
        <VehicleDialog open onClose={jest.fn()} />
      </View>,
      {
        session: authenticatedSession,
        graphql: [
          {
            request: {
              query: CreateVehicleDocument,
              operationName: 'CreateVehicle',
              variables: {
                attributes: {
                  name: 'Beaver',
                  operatorId: 1,
                  capacity: 8,
                  minCapacity: 1,
                  registration: 'VH-JST',
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
    const [name, registration, , maxSlots] = textInputs(dialog.container);
    await fireEvent.changeText(name, 'Beaver');
    await fireEvent.changeText(registration, 'VH-JST');
    await fireEvent.changeText(maxSlots, '8');
    await waitFor(() => expect(dialog.queryByText('Maximum slots is required')).toBeNull());
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('asks for the registration when it is missing', async () => {
    const screen = await render(
      <View testID="under-test">
        <VehicleDialog open onClose={jest.fn()} />
      </View>,
      { session: authenticatedSession, graphql: [] }
    );

    const dialog = scoped(screen.getByTestId('under-test'));
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(dialog.getByText('Registration is required')).toBeTruthy());
  });

  // The dialog builds `initial` from the (absent) original vehicle, so `capacity: undefined` overrides the
  // form's default of 4 and a new vehicle cannot be saved until max slots is typed in.
  it('BUG-096: a new aircraft starts with the default max slots', async () => {
    const screen = await render(
      <View testID="under-test">
        <VehicleDialog open onClose={jest.fn()} />
      </View>,
      { session: authenticatedSession, graphql: [] }
    );

    const dialog = scoped(screen.getByTestId('under-test'));
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    // Validation has run once the (legitimately missing) registration is reported
    await waitFor(() => expect(dialog.getByText('Registration is required')).toBeTruthy());
    expect(dialog.queryByText('Maximum slots is required')).toBeNull();
  });
});
