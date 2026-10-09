import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import { CreateAircraftDocument } from 'app/api/reflection';
import { useDropzoneContext } from 'app/providers';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import AircraftDialog from '../../forms/aircraft/Dialog';
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

describe('<AircraftDialog />', () => {
  it('sends the entered values to CreateAircraft', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createPlane: {
          __typename: 'CreatePlanePayload',
          plane: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    const screen = render(
      <View testID="under-test">
        <DropzoneReady />
        <AircraftDialog open onClose={jest.fn()} />
      </View>,
      {
        initialState: authenticatedState,
        session: authenticatedSession,
        graphql: [
          {
            request: {
              query: CreateAircraftDocument,
              operationName: 'CreateAircraft',
              variables: {
                attributes: {
                  name: 'Beaver',
                  dropzoneId: 1,
                  maxSlots: 8,
                  minSlots: 1,
                  registration: 'VH-JST',
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
    const [name, registration, , maxSlots] = dialog.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(name, 'Beaver');
    fireEvent.changeText(registration, 'VH-JST');
    // The dialog does not pass a default for max slots, so it has to be entered (see BUG-096)
    fireEvent.changeText(maxSlots, '8');
    await waitFor(() => expect(dialog.queryByText('Maximum slots is required')).toBeNull());
    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('asks for the registration and max slots when they are missing', async () => {
    const screen = render(
      <View testID="under-test">
        <AircraftDialog open onClose={jest.fn()} />
      </View>,
      { initialState: authenticatedState, session: authenticatedSession, graphql: [] }
    );

    const dialog = within(screen.getByTestId('under-test'));
    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(dialog.getByText('Registration is required')).toBeTruthy());
    expect(dialog.getByText('Maximum slots is required')).toBeTruthy();
  });

  // The dialog builds `initial` from the (absent) original aircraft, so `maxSlots: undefined` overrides the
  // form's default of 4 and a new aircraft cannot be saved until max slots is typed in.
  it.skip('BUG-096: a new aircraft starts with the default max slots', async () => {
    const screen = render(
      <View testID="under-test">
        <AircraftDialog open onClose={jest.fn()} />
      </View>,
      { initialState: authenticatedState, session: authenticatedSession, graphql: [] }
    );

    const dialog = within(screen.getByTestId('under-test'));
    fireEvent.press(dialog.getByText('Save'));

    // Validation has run once the (legitimately missing) registration is reported
    await waitFor(() => expect(dialog.getByText('Registration is required')).toBeTruthy());
    expect(dialog.queryByText('Maximum slots is required')).toBeNull();
  });
});
