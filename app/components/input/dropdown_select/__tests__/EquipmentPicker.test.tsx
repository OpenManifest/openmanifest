import * as React from 'react';
import { View } from 'react-native';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { currentUserDetailed } from 'app/__fixtures__/currentUser.fixture';
import { rigKind } from 'app/__fixtures__/equipmentKind.fixture';
import MOCK_QUERY_OPERATOR from 'app/__tests__/manifest/__mocks__/QueryOperator.mock';
import MOCK_QUERY_AVAILABLE_EQUIPMENT from 'app/__tests__/manifest/__mocks__/QueryAvailableEquipment.mock';
import { render, waitFor, within } from '../../../../__mocks__/render';
import EquipmentPicker, { kindRequired, requiredKinds } from '../EquipmentPicker';

jest.setTimeout(30000);

const wetsuitKind = {
  ...rigKind,
  id: '2',
  key: 'wetsuit',
  name: 'Wetsuit',
  requiredBy: { ticket_type_ids: [7], activity_type_ids: [3] },
};
const noKind = { ...rigKind, id: '3', key: 'pfd', name: 'PFD', requiredBy: {} };

describe('which kinds of equipment a slot needs', () => {
  it('needs the kinds required by every slot', () => {
    expect(kindRequired(rigKind, {})).toBe(true);
  });

  it('needs a kind listed for the ticket type or the activity type of the slot', () => {
    expect(kindRequired(wetsuitKind, { ticketTypeId: '7' })).toBe(true);
    expect(kindRequired(wetsuitKind, { activityTypeId: '3' })).toBe(true);
    expect(kindRequired(wetsuitKind, { ticketTypeId: '8', activityTypeId: '4' })).toBe(false);
    expect(kindRequired(wetsuitKind, {})).toBe(false);
  });

  it('needs nothing of a kind that is not required by anything', () => {
    expect(kindRequired(noKind, { ticketTypeId: '7' })).toBe(false);
  });

  it('lists the kinds a slot needs', () => {
    expect(
      requiredKinds([rigKind, wetsuitKind, noKind], { ticketTypeId: '7' }).map((kind) => kind.key)
    ).toEqual(['rig', 'wetsuit']);
    expect(requiredKinds(undefined, {})).toEqual([]);
  });
});

async function renderPicker(
  props: Partial<React.ComponentProps<typeof EquipmentPicker>>,
  kinds = [rigKind]
) {
  const screen = await render(
    <View testID="under-test">
      <EquipmentPicker membershipId={1} onChange={jest.fn()} {...props} />
    </View>,
    {
      session: authenticatedSession,
      graphql: [
        MOCK_QUERY_OPERATOR({}, { operator: { equipmentKinds: kinds } as never }),
        MOCK_QUERY_AVAILABLE_EQUIPMENT(),
      ],
    }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<EquipmentPicker />', () => {
  it('shows the item chosen for the rig kind', async () => {
    const [primary] = currentUserDetailed.user.equipment ?? [];
    const picker = await renderPicker({ value: [primary as never] });

    await waitFor(() => expect(picker.getByText('Rig')).toBeTruthy());
    await waitFor(() => expect(picker.getByText('Primary')).toBeTruthy());
  });

  it('chooses the first item of the kind when it is asked to', async () => {
    const onChange = jest.fn();
    await renderPicker({ onChange, autoSelectFirst: true });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0][0]).toHaveLength(1);
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ id: '1', make: 'Vector' });
  });

  it('shows a select for each kind the slot needs and none for the other kinds', async () => {
    const picker = await renderPicker({}, [rigKind, noKind]);

    await waitFor(() => expect(picker.getByText('Rig')).toBeTruthy());
    expect(picker.queryByText('PFD')).toBeNull();
  });
});
