import * as React from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { VehiclesDocument } from 'app/api/reflection';
import { LoadVehicleRole } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { scoped } from 'app/test-utils/hosts';
import { fireEvent, render, waitFor } from '../../../../__mocks__/render';
import { VehicleListField, VehicleRole } from '../VehicleListField';

jest.setTimeout(30000);

const beaver = {
  __typename: 'Vehicle' as const,
  id: '1',
  name: 'Beaver',
  registration: 'ABC123',
  minCapacity: 1,
  capacity: 10,
};
const tug = { ...beaver, id: '2', name: 'Tug', registration: 'TUG1', capacity: 1 };
const otter = { ...beaver, id: '3', name: 'Otter', registration: 'OTT1', capacity: 4 };

const vehicles = {
  request: { query: VehiclesDocument, variables: { operatorId: '1' } },
  result: { data: { __typename: 'Query', vehicles: [beaver, tug, otter] } },
  maxUsageCount: 10,
};

function Harness({ values = [] }: { values?: VehicleRole[] }) {
  const { control, watch } = useForm<{ rows: VehicleRole[] }>({ defaultValues: { rows: values } });
  const { rows } = watch();
  return (
    <View testID="under-test">
      <VehicleListField {...{ control }} name="rows" />
      <View
        testID="value"
        accessibilityLabel={JSON.stringify(rows.map(({ vehicle, role }) => [vehicle.id, role]))}
      />
    </View>
  );
}

const valueOf = (screen: Awaited<ReturnType<typeof render>>) =>
  JSON.parse(screen.getByTestId('value').props.accessibilityLabel);

describe('<VehicleListField />', () => {
  it('starts with the first vehicle of the operator, carrying', async () => {
    const screen = await render(<Harness />, {
      session: authenticatedSession,
      graphql: [vehicles],
    });
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('Beaver')).toBeTruthy());
    expect(form.getByText('Carries 10')).toBeTruthy();
    expect(valueOf(screen)).toEqual([['1', LoadVehicleRole.Carrying]]);
  });

  it('adds a vehicle that carries and turns another into one that supports', async () => {
    const screen = await render(<Harness />, {
      session: authenticatedSession,
      graphql: [vehicles],
    });
    const form = scoped(screen.getByTestId('under-test'));
    await waitFor(() => expect(form.getByText('Beaver')).toBeTruthy());

    await fireEvent.press(form.getByRole('combobox', { name: 'Add vehicle' }));
    expect(screen.queryByRole('option', { name: 'Beaver' })).toBeNull();
    await fireEvent.press(screen.getByRole('option', { name: 'Tug' }));
    await fireEvent.press(await form.findByRole('button', { name: 'Make Tug support the load' }));

    expect(valueOf(screen)).toEqual([
      ['1', LoadVehicleRole.Carrying],
      ['2', LoadVehicleRole.Support],
    ]);
    expect(form.getByText('Supports the load')).toBeTruthy();
    expect(form.getByRole('button', { name: 'Make Tug carry' })).toBeTruthy();
  });

  it('keeps one vehicle that carries', async () => {
    const screen = await render(
      <Harness
        values={[
          { vehicle: beaver, role: LoadVehicleRole.Carrying },
          { vehicle: tug, role: LoadVehicleRole.Support },
        ]}
      />,
      { session: authenticatedSession, graphql: [vehicles] }
    );
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('Tug')).toBeTruthy());
    expect(
      form.getByRole('button', { name: 'Make Beaver support the load', disabled: true })
    ).toBeTruthy();
    expect(form.getByRole('button', { name: 'Remove Beaver', disabled: true })).toBeTruthy();

    await fireEvent.press(form.getByRole('button', { name: 'Remove Tug' }));
    expect(valueOf(screen)).toEqual([['1', LoadVehicleRole.Carrying]]);
  });
});
