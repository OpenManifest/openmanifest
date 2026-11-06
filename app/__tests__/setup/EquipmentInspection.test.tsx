import * as React from 'react';
import { Text, View } from 'react-native';
import { useController } from 'react-hook-form';
import { CreateEquipmentInspectionDocument } from 'app/api/reflection';
import {
  EquipmentInspectionForm,
  useEquipmentInspectionForm,
} from 'app/forms/equipment_inspection';
import type { FieldItem } from 'app/forms/equipment_inspection_template';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { Permission } from 'app/api/schema.d';
import { scoped, textInputs } from 'app/test-utils/hosts';

jest.setTimeout(30000);

const template: FieldItem[] = [
  { label: 'Reserve serial', valueType: 'string', isRequired: true },
  { label: 'Notes', valueType: 'string' },
];

function Harness(props: { onSuccess?(): void }) {
  const { control, setValue, onSubmit } = useEquipmentInspectionForm({
    fields: template,
    equipmentId: '2',
    operatorId: '1',
    onSuccess: props.onSuccess,
  });
  const { field: ok } = useController({ name: 'ok', control });

  return (
    <View testID="under-test">
      <EquipmentInspectionForm
        {...{ control }}
        onChangeField={(index, item) => setValue(`fields.${index}`, item, { shouldValidate: true })}
      />
      <Text onPress={() => ok.onChange(!ok.value)}>Toggle OK</Text>
      <Text onPress={onSubmit}>Submit inspection</Text>
    </View>
  );
}

async function renderForm(
  graphql: Parameters<typeof render>[1]['graphql'] = [],
  onSuccess?: () => void
) {
  const screen = await render(<Harness {...{ onSuccess }} />, {
    session: authenticatedSession,
    permissions: [Permission.ActAsEquipmentInspector],
    graphql,
  });
  return scoped(screen.getByTestId('under-test'));
}

describe('rig inspection form', () => {
  it('shows the fields of the template', async () => {
    const form = await renderForm();

    await waitFor(() => expect(form.queryAllByText('Reserve serial').length).toBeGreaterThan(0));
    expect(form.queryAllByText('Notes').length).toBeGreaterThan(0);
  });

  it('wants the required fields filled in before a rig is marked OK to jump', async () => {
    const mutationResult = jest.fn();
    const form = await renderForm([
      {
        request: {
          query: CreateEquipmentInspectionDocument,
          operationName: 'CreateEquipmentInspection',
          variables: {},
        },
        result: mutationResult,
      },
    ]);

    await fireEvent.press(form.getByText('Toggle OK'));
    await fireEvent.press(form.getByText('Submit inspection'));

    await waitFor(() => expect(form.getByText('Reserve serial is required')).toBeTruthy());
    expect(mutationResult).not.toHaveBeenCalled();
  });

  it('saves an inspection with the answers and the verdict', async () => {
    const onSuccess = jest.fn();
    const mutationResult = jest.fn(() => ({
      data: {
        createEquipmentInspection: {
          __typename: 'CreateEquipmentInspectionPayload',
          equipmentInspection: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const form = await renderForm(
      [
        {
          request: {
            query: CreateEquipmentInspectionDocument,
            operationName: 'CreateEquipmentInspection',
            variables: {
              operator: '1',
              equipment: '2',
              isOk: true,
              definition: JSON.stringify([
                { label: 'Reserve serial', valueType: 'string', isRequired: true, value: 'R-1234' },
                { label: 'Notes', valueType: 'string' },
              ]),
            },
          },
          result: mutationResult,
        },
      ],
      onSuccess
    );

    await waitFor(() => expect(form.queryAllByText('Reserve serial').length).toBeGreaterThan(0));
    await fireEvent.changeText(textInputs(form.container)[0], 'R-1234');
    await fireEvent.press(form.getByText('Toggle OK'));
    await fireEvent.press(form.getByText('Submit inspection'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
