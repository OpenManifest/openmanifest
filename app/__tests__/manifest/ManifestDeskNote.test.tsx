import * as React from 'react';
import { Text } from 'react-native';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import { Permission } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import ManifestDeskNote from 'app/components/ManifestDeskNote';
import { useOperatorContext } from 'app/providers/operator/context';
import { render } from '../../__mocks__/render';
import MOCK_QUERY_OPERATOR from './__mocks__/QueryOperator.mock';

jest.setTimeout(30000);

/** Shows the setting once the operator and the permissions have loaded, so absence checks are not vacuous */
function LoadedProbe() {
  const {
    operator: { operator, permissions },
  } = useOperatorContext();
  return operator && permissions ? (
    <Text testID="loaded">{`allowSelfManifest=${operator.settings?.allowSelfManifest}`}</Text>
  ) : null;
}

function renderNote(allowSelfManifest: boolean, permissions: Permission[]) {
  const operator = set(
    cloneDeep(MOCK_QUERY_OPERATOR()),
    'result.data.operator.settings.allowSelfManifest',
    allowSelfManifest
  );
  return render(
    <>
      <LoadedProbe />
      <ManifestDeskNote />
    </>,
    {
      session: authenticatedSession,
      permissions,
      graphql: [operator],
    }
  );
}

describe('<ManifestDeskNote />', () => {
  it('tells a member who cannot manifest that bookings are made at the desk when self-manifesting is off', async () => {
    const screen = renderNote(false, []);

    expect(await screen.findByTestId('manifest-desk-note')).toBeTruthy();
    expect(screen.getByText('Bookings are made at the manifest desk')).toBeTruthy();
  });

  it('shows nothing when self-manifesting is allowed', async () => {
    const screen = renderNote(true, []);

    expect(await screen.findByText('allowSelfManifest=true')).toBeTruthy();
    expect(screen.queryByTestId('manifest-desk-note')).toBeNull();
  });

  it('shows nothing to staff who can manifest other people', async () => {
    const screen = renderNote(false, [Permission.CreateUserSlot, Permission.CreateSlot]);

    expect(await screen.findByText('allowSelfManifest=false')).toBeTruthy();
    expect(screen.queryByTestId('manifest-desk-note')).toBeNull();
  });
});
