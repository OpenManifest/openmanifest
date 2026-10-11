import * as React from 'react';
import { Text, View } from 'react-native';
import { UpdateRigInspectionTemplateDocument } from 'app/api/reflection';
import {
  RigInspectionTemplateForm,
  useRigInspectionTemplateForm,
} from 'app/forms/rig_inspection_template';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const definition = JSON.stringify([
  { label: 'Reserve date', valueType: 'string', isRequired: true },
  { label: 'Pin check', valueType: 'boolean' },
]);

function Harness() {
  const { control, onSubmit } = useRigInspectionTemplateForm({
    template: { id: '4', definition },
    dropzoneId: '1',
  });

  return (
    <View testID="under-test">
      <RigInspectionTemplateForm {...{ control }} />
      <Text onPress={onSubmit}>Save template</Text>
    </View>
  );
}

function renderForm(graphql: Parameters<typeof render>[1]['graphql'] = []) {
  const screen = render(<Harness />, {
    session: authenticatedSession,
    graphql,
  });
  return within(screen.getByTestId('under-test'));
}

describe('rig inspection template form', () => {
  it('lists the fields of the template', async () => {
    const form = renderForm();

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
    const form = renderForm([
      {
        request: {
          query: UpdateRigInspectionTemplateDocument,
          operationName: 'UpdateRigInspectionTemplate',
          variables: {
            formId: 4,
            dropzoneId: 1,
            definition: JSON.stringify([{ label: 'Pin check', valueType: 'boolean' }]),
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(form.queryAllByText('Reserve date').length).toBeGreaterThan(0));
    fireEvent.press(form.getByLabelText('Remove Reserve date'));
    await waitFor(() => expect(form.queryAllByText('Reserve date')).toHaveLength(0));
    fireEvent.press(form.getByText('Save template'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
