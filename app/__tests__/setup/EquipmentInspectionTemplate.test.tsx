import * as React from 'react';
import { Text, View } from 'react-native';
import { UpdateEquipmentInspectionTemplateDocument } from 'app/api/reflection';
import {
  EquipmentInspectionTemplateForm,
  useEquipmentInspectionTemplateForm,
} from 'app/forms/equipment_inspection_template';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const definition = JSON.stringify([
  { label: 'Reserve date', valueType: 'string', isRequired: true },
  { label: 'Pin check', valueType: 'boolean' },
]);

function Harness() {
  const { control, onSubmit } = useEquipmentInspectionTemplateForm({
    template: { id: '4', definition },
    operatorId: '1',
  });

  return (
    <View testID="under-test">
      <EquipmentInspectionTemplateForm {...{ control }} />
      <Text onPress={onSubmit}>Save template</Text>
    </View>
  );
}

async function renderForm(graphql: Parameters<typeof render>[1]['graphql'] = []) {
  const screen = await render(<Harness />, {
    session: authenticatedSession,
    graphql,
  });
  return within(screen.getByTestId('under-test'));
}

describe('rig inspection template form', () => {
  it('lists the fields of the template', async () => {
    const form = await renderForm();

    await waitFor(() => expect(form.queryAllByText('Reserve date').length).toBeGreaterThan(0));
    expect(form.getByText('Pin check')).toBeTruthy();
  });

  it('saves the template without a field that was removed', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        updateFormTemplate: {
          __typename: 'UpdateFormTemplatePayload',
          formTemplate: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const form = await renderForm([
      {
        request: {
          query: UpdateEquipmentInspectionTemplateDocument,
          operationName: 'UpdateEquipmentInspectionTemplate',
          variables: {
            formId: 4,
            operatorId: 1,
            definition: JSON.stringify([{ label: 'Pin check', valueType: 'boolean' }]),
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(form.queryAllByText('Reserve date').length).toBeGreaterThan(0));
    await fireEvent.press(form.getByLabelText('Remove Reserve date'));
    await waitFor(() => expect(form.queryAllByText('Reserve date')).toHaveLength(0));
    await fireEvent.press(form.getByText('Save template'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
