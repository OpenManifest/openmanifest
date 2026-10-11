import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import '@testing-library/jest-native';
import { CreateGhostDocument } from 'app/api/reflection';
import { useDropzoneContext } from 'app/providers';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import MOCK_QUERY_FEDERATIONS from '../manifest/__mocks__/QueryFederations.mock';
import MOCK_QUERY_LICENSES from '../manifest/__mocks__/QueryLicenses.mock';
import MOCK_QUERY_ROLES from '../manifest/__mocks__/QueryRoles.mock';
import CreateGhostDialog from '../../forms/create_user/Dialog';

jest.setTimeout(30000);

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
    credentials: {
      accessToken: 'jest',
      client: 'jest',
      uid: 'jest@example.com',
      tokenType: 'Bearer',
      expiry: 9999999999,
    },
    currentDropzoneId: 1,
  },
};

// The form refuses to submit until the dropzone has loaded
function DropzoneReady() {
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  return dropzone?.id ? <Text>dropzone ready</Text> : null;
}

// Name and email filled in; the federation and licence are picked automatically (single option), the access level is not.
async function renderFilledDialog(createGhost: jest.Mock) {
  const screen = render(
    <View testID="under-test">
      <DropzoneReady />
      <CreateGhostDialog open onClose={jest.fn()} />
    </View>,
    {
      initialState: authenticatedState,
      graphql: [
        MOCK_QUERY_FEDERATIONS(),
        MOCK_QUERY_LICENSES(),
        MOCK_QUERY_ROLES(),
        // Any CreateGhost request is acceptable here, the point is whether one is made
        {
          request: { query: CreateGhostDocument, operationName: 'CreateGhost', variables: {} },
          result: createGhost,
        },
      ],
    }
  );
  const dialog = within(screen.getByTestId('under-test'));
  await waitFor(() => expect(dialog.getByText('dropzone ready')).toBeTruthy(), { timeout: 10000 });
  await waitFor(() => expect(dialog.getByText('Certificate A')).toBeTruthy(), { timeout: 10000 });
  const inputs = dialog.UNSAFE_getAllByType(TextInput);
  fireEvent.changeText(inputs[0], 'Gina Ghost');
  fireEvent.changeText(inputs[2], 'gina@example.com');
  return dialog;
}

describe('<CreateGhostDialog />', () => {
  it('does not send CreateGhost until an access level is chosen', async () => {
    const createGhost = jest.fn();
    const dialog = await renderFilledDialog(createGhost);

    fireEvent.press(dialog.getByText('Create'));
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(createGhost).not.toHaveBeenCalled();
  });

  // GitHub client#126 "Create Ghost doesn't fire submit button". The button does submit, but the form is invalid
  // (no access level) and `RoleSelect` / `FederationSelect` never pass the `error` prop on to `Select`, so the
  // "You must select a role" message is never shown and nothing appears to happen.
  it.skip('BUG-086: pressing Create without an access level says what is missing', async () => {
    const dialog = await renderFilledDialog(jest.fn());

    fireEvent.press(dialog.getByText('Create'));

    await waitFor(() => expect(dialog.getByText('You must select a role')).toBeTruthy());
  });
});
