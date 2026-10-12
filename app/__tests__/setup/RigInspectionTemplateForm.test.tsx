import * as React from 'react';
import { Text as NativeText } from 'react-native';
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import RigInspectionTemplateForm from '../../forms/rig_inspection_template/RigInspectionTemplateForm';
import type { RigInspectionTemplateFields } from '../../forms/rig_inspection_template/useForm';
import { renderWithProviders } from 'app/test-utils/render';

function Harness({ onFields }: { onFields(fields: unknown): void }) {
  const { control, watch } = useForm<RigInspectionTemplateFields>({
    defaultValues: {
      fields: [{ label: 'Reserve packed', valueType: 'boolean', isRequired: true } as never],
    },
  });
  onFields(watch('fields'));
  return <RigInspectionTemplateForm control={control} />;
}

async function renderForm() {
  const fields = jest.fn();
  const screen = await renderWithProviders(
    <>
      <Harness onFields={fields} />
      <NativeText>harness</NativeText>
    </>
  );
  const last = () => fields.mock.calls[fields.mock.calls.length - 1][0] as { label: string }[];
  // The manifest context mounts dialogs of its own: look inside the field dialog only
  const dialog = () => within(screen.getByTestId('field-dialog'));
  return { screen, last, dialog };
}

describe('<RigInspectionTemplateForm />', () => {
  it('lists the fields, each with its own edit and remove buttons', async () => {
    const { screen } = await renderForm();

    expect(screen.getByRole('button', { name: 'Edit Reserve packed' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove Reserve packed' })).toBeTruthy();
  });

  it('removes a field', async () => {
    const { screen, last, dialog } = await renderForm();

    await fireEvent.press(screen.getByRole('button', { name: 'Remove Reserve packed' }));

    await waitFor(() => expect(last()).toHaveLength(0));
  });

  it('adds a field of the kind chosen in the menu, named in a dialog', async () => {
    const { screen, last, dialog } = await renderForm();

    await fireEvent.press(screen.getByRole('button', { name: 'Add a field' }));
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Text' }));
    await waitFor(() => expect(dialog().getByLabelText('Name')).toBeTruthy());
    await fireEvent.changeText(dialog().getByLabelText('Name'), 'Harness checked');
    await fireEvent.press(dialog().getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(last()).toHaveLength(2));
    expect(last()[1]).toMatchObject({ label: 'Harness checked', valueType: 'string' });
  });

  it('edits a field in place', async () => {
    const { screen, last, dialog } = await renderForm();

    await fireEvent.press(screen.getByRole('button', { name: 'Edit Reserve packed' }));
    await waitFor(() => expect(dialog().getByLabelText('Name')).toBeTruthy());
    await fireEvent.changeText(dialog().getByLabelText('Name'), 'Reserve repacked');
    await fireEvent.press(dialog().getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(last()[0]).toMatchObject({ label: 'Reserve repacked' }));
    expect(last()).toHaveLength(1);
  });

  it('closes the dialog without adding anything on Cancel', async () => {
    const { screen, last, dialog } = await renderForm();

    await fireEvent.press(screen.getByRole('button', { name: 'Add a field' }));
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Date' }));
    await waitFor(() => expect(dialog().getByLabelText('Name')).toBeTruthy());
    await fireEvent.press(dialog().getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByTestId('field-dialog')).toBeNull());
    expect(last()).toHaveLength(1);
  });
});
