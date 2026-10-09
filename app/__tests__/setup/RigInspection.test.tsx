import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useController } from 'react-hook-form';
import { CreateRigInspectionDocument } from 'app/api/reflection';
import { RigInspectionForm, useRigInspectionForm } from 'app/forms/rig_inspection';
import type { FieldItem } from 'app/forms/rig_inspection_template';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { Permission } from 'app/api/schema.d';

jest.setTimeout(30000);

const authenticatedState = {
  ...appRedux.initialState,
  global: { ...appRedux.initialState.global, authenticated: true },
};

const template: FieldItem[] = [
  { label: 'Reserve serial', valueType: 'string', isRequired: true },
  { label: 'Notes', valueType: 'string' },
];

function Harness(props: { onSuccess?(): void }) {
  const { control, setValue, onSubmit } = useRigInspectionForm({
    fields: template,
    rigId: '2',
    dropzoneId: '1',
    onSuccess: props.onSuccess,
  });
  const { field: ok } = useController({ name: 'ok', control });

  return (
    <View testID="under-test">
      <RigInspectionForm
        {...{ control }}
        onChangeField={(index, item) => setValue(`fields.${index}`, item, { shouldValidate: true })}
      />
      <Text onPress={() => ok.onChange(!ok.value)}>Toggle OK</Text>
      <Text onPress={onSubmit}>Submit inspection</Text>
    </View>
  );
}

function renderForm(graphql: Parameters<typeof render>[1]['graphql'] = [], onSuccess?: () => void) {
  const screen = render(<Harness {...{ onSuccess }} />, {
    initialState: authenticatedState,
    session: authenticatedSession,
    permissions: [Permission.ActAsRigInspector],
    graphql,
  });
  return within(screen.getByTestId('under-test'));
}

describe('rig inspection form', () => {
  it('shows the fields of the template', async () => {
    const form = renderForm();

    await waitFor(() => expect(form.queryAllByText('Reserve serial').length).toBeGreaterThan(0));
    expect(form.queryAllByText('Notes').length).toBeGreaterThan(0);
  });

  it('wants the required fields filled in before a rig is marked OK to jump', async () => {
    const mutationResult = jest.fn();
    const form = renderForm([
      {
        request: {
          query: CreateRigInspectionDocument,
          operationName: 'CreateRigInspection',
          variables: {},
        },
        result: mutationResult,
      },
    ]);

    fireEvent.press(form.getByText('Toggle OK'));
    fireEvent.press(form.getByText('Submit inspection'));

    await waitFor(() => expect(form.getByText('Reserve serial is required')).toBeTruthy());
    expect(mutationResult).not.toHaveBeenCalled();
  });

  it('saves an inspection with the answers and the verdict', async () => {
    const onSuccess = jest.fn();
    const mutationResult = jest.fn(() => ({
      data: {
        createRigInspection: {
          __typename: 'CreateRigInspectionPayload',
          rigInspection: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const form = renderForm(
      [
        {
          request: {
            query: CreateRigInspectionDocument,
            operationName: 'CreateRigInspection',
            variables: {
              dropzone: '1',
              rig: '2',
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
    fireEvent.changeText(form.UNSAFE_getAllByType(TextInput)[0], 'R-1234');
    fireEvent.press(form.getByText('Toggle OK'));
    fireEvent.press(form.getByText('Submit inspection'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
