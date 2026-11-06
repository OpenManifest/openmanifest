import * as React from 'react';
import { View } from 'react-native';
import { CreateEquipmentDocument, UpdateEquipmentDocument } from 'app/api/reflection';
import { currentUserEssentials } from 'app/__fixtures__/equipment.fixture';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import EquipmentDialog from '../../forms/equipment';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

async function renderDialog(
  props: Partial<React.ComponentProps<typeof EquipmentDialog>>,
  graphql: Parameters<typeof render>[1]['graphql'] = []
) {
  const screen = await render(
    <View testID="under-test">
      <EquipmentDialog open userId={1} onClose={jest.fn()} {...props} />
    </View>,
    { session: authenticatedSession, graphql }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<EquipmentDialog />', () => {
  it('starts with the rig being edited', async () => {
    const dialog = await renderDialog({ equipment: currentUserEssentials });

    await waitFor(() => expect(dialog.getByDisplayValue('Pond')).toBeTruthy());
    expect(dialog.getByDisplayValue('Mirage')).toBeTruthy();
    expect(dialog.getByDisplayValue('34567')).toBeTruthy();
    // The canopy size is stored in m² and shown in the operator's unit
    await waitFor(() => expect(dialog.getByDisplayValue('170')).toBeTruthy());
    expect(dialog.getByText('Main canopy size (ft²)')).toBeTruthy();
    // The type of a rig is something only the operator's own rigs have
    expect(dialog.queryByText('Rig type')).toBeNull();
  });

  it("asks for the attributes of the operator's rig, from the schema of its kind", async () => {
    const dialog = await renderDialog({ userId: undefined, operatorId: 1 });

    await waitFor(() => expect(dialog.getByText('Rig type')).toBeTruthy());
    expect(dialog.getByText('Main canopy size (ft²)')).toBeTruthy();
    expect(dialog.getByText('Pack value')).toBeTruthy();
    expect(dialog.getByText('Student')).toBeTruthy();
  });

  it('asks for the details a new rig needs', async () => {
    const dialog = await renderDialog({});

    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(dialog.getByText('Set when the next service is due')).toBeTruthy());
  });

  it('sends the edited values to UpdateRig', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        updateEquipment: {
          __typename: 'UpdateEquipmentPayload',
          equipment: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = await renderDialog({ equipment: currentUserEssentials }, [
      {
        request: {
          query: UpdateEquipmentDocument,
          operationName: 'UpdateEquipment',
          variables: {
            id: 2,
            name: 'Pond',
            make: 'Mirage',
            model: 'G4.1',
            serial: '99999',
            serviceDueAt: currentUserEssentials.serviceDueAt,
            kindId: '1',
            attributes: { canopy_size_m2: 15.7935, pack_value: null },
            userId: 1,
            operatorId: null,
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(dialog.getByDisplayValue('34567')).toBeTruthy());
    await fireEvent.changeText(dialog.getByDisplayValue('34567'), '99999');
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('sends a new rig to CreateRig', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createEquipment: {
          __typename: 'CreateEquipmentPayload',
          equipment: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = await renderDialog(
      { equipment: { ...currentUserEssentials, id: undefined } as never },
      [
        {
          request: {
            query: CreateEquipmentDocument,
            operationName: 'CreateEquipment',
            variables: {
              name: 'Pond',
              make: 'Mirage',
              model: 'G4.1',
              serial: '34567',
              serviceDueAt: currentUserEssentials.serviceDueAt,
              kindId: '1',
              attributes: { canopy_size_m2: 15.7935, pack_value: null },
              userId: 1,
              operatorId: null,
            },
          },
          result: mutationResult,
        },
      ]
    );

    await waitFor(() => expect(dialog.getByDisplayValue('34567')).toBeTruthy());
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
