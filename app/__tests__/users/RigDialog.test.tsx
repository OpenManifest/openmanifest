import * as React from 'react';
import { View } from 'react-native';
import { UpdateEquipmentDocument } from 'app/api/reflection';
import { MUTATION_CREATE_EQUIPMENT } from 'app/api/hooks/useMutationCreateEquipment';
import { currentUserEssentials } from 'app/__fixtures__/rig.fixture';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import RigDialog from '../../forms/rig';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

async function renderDialog(
  props: Partial<React.ComponentProps<typeof RigDialog>>,
  graphql: Parameters<typeof render>[1]['graphql'] = []
) {
  const screen = await render(
    <View testID="under-test">
      <RigDialog open userId={1} onClose={jest.fn()} {...props} />
    </View>,
    { session: authenticatedSession, graphql }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<RigDialog />', () => {
  it('starts with the rig being edited', async () => {
    const dialog = await renderDialog({ rig: currentUserEssentials });

    await waitFor(() => expect(dialog.getByDisplayValue('Pond')).toBeTruthy());
    expect(dialog.getByDisplayValue('Mirage')).toBeTruthy();
    expect(dialog.getByDisplayValue('34567')).toBeTruthy();
    expect(dialog.getByDisplayValue('170')).toBeTruthy();
  });

  it('asks for the details a new rig needs', async () => {
    const dialog = await renderDialog({});

    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(dialog.getByText('Make is required')).toBeTruthy());
    expect(dialog.getByText('Model is required')).toBeTruthy();
    expect(
      dialog.getByText('You must set a reserve repack expiry date', { exact: false })
    ).toBeTruthy();
  });

  it('sends the edited values to UpdateRig', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        updateEquipment: {
          __typename: 'UpdateEquipmentPayload',
          rig: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = await renderDialog({ rig: currentUserEssentials }, [
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
            canopySize: 170,
            rigType: 'sport',
            repackExpiresAt: currentUserEssentials.repackExpiresAt,
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
          rig: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = await renderDialog(
      { rig: { ...currentUserEssentials, id: undefined } as never },
      [
        {
          request: {
            query: MUTATION_CREATE_EQUIPMENT,
            operationName: 'CreateEquipment',
            variables: {
              name: 'Pond',
              make: 'Mirage',
              model: 'G4.1',
              serial: '34567',
              canopySize: 170,
              rigType: 'sport',
              repackExpiresAt: currentUserEssentials.repackExpiresAt,
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
