import * as React from 'react';
import { Text as NativeText } from 'react-native';
import { fireEvent, within } from '@testing-library/react-native';
import { renderThemed } from '../../components/testing';
import ResourceForm, { resourceFormPresentation } from '../ResourceForm';
import ResourceList from '../ResourceList';

type Vehicle = { id: string; name: string; registration: string };
const VEHICLES: Vehicle[] = [
  { id: '1', name: 'Otter', registration: 'VH-OTR' },
  { id: '2', name: 'Caravan', registration: 'VH-CRV' },
];

function List(props: Partial<React.ComponentProps<typeof ResourceList<Vehicle>>>) {
  return (
    <ResourceList<Vehicle>
      testID="vehicles"
      items={VEHICLES}
      keyOf={(vehicle) => vehicle.id}
      titleOf={(vehicle) => vehicle.name}
      factsOf={(vehicle) => [{ label: 'Registration', value: vehicle.registration }]}
      empty={{ title: 'No vehicles yet', body: 'Add one to start' }}
      {...props}
    />
  );
}

describe('ResourceList', () => {
  it('lists each item with its labelled facts', async () => {
    const screen = await renderThemed(<List />);

    expect(screen.getByText('Otter')).toBeTruthy();
    expect(screen.getAllByText('Registration')).toHaveLength(2);
    expect(screen.getByText('VH-CRV')).toBeTruthy();
  });

  it('opens an item from its row, named by its title, and adds one from the button', async () => {
    const onOpen = jest.fn();
    const onNew = jest.fn();
    const screen = await renderThemed(
      <List
        onOpen={onOpen}
        create={{ label: 'New vehicle', onPress: onNew, testID: 'new-vehicle' }}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Caravan' }));
    expect(onOpen).toHaveBeenCalledWith(VEHICLES[1]);
    await fireEvent.press(screen.getByTestId('new-vehicle'));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('shows rows as plain content to someone who may not change them', async () => {
    const screen = await renderThemed(<List />);

    expect(screen.queryByRole('button', { name: 'Otter' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'New vehicle' })).toBeNull();
  });

  it('says there is nothing yet and offers the one way out', async () => {
    const onNew = jest.fn();
    const screen = await renderThemed(
      <List items={[]} create={{ label: 'New vehicle', onPress: onNew }} />
    );

    expect(screen.getByRole('heading', { name: 'No vehicles yet' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'New vehicle' }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('keeps a control beside the row, outside its button', async () => {
    const screen = await renderThemed(
      <List
        onOpen={jest.fn()}
        trailingOf={(vehicle) => <NativeText>{`switch ${vehicle.id}`}</NativeText>}
      />
    );

    expect(screen.getByText('switch 1')).toBeTruthy();
    expect(
      within(screen.getByRole('button', { name: 'Otter' })).queryByText('switch 1')
    ).toBeNull();
  });
});

describe('ResourceForm', () => {
  it('is a sheet on a phone, a panel on a wide window and a dialog in between', () => {
    expect(resourceFormPresentation('compact')).toBe('sheet');
    expect(resourceFormPresentation('medium')).toBe('auto');
    expect(resourceFormPresentation('expanded')).toBe('auto');
  });

  it('saves and archives from its pinned buttons', async () => {
    const onSubmit = jest.fn();
    const onArchive = jest.fn();
    const screen = await renderThemed(
      <ResourceForm
        open
        title="Edit Otter"
        onClose={jest.fn()}
        onSubmit={onSubmit}
        onArchive={onArchive}
      >
        <NativeText>fields</NativeText>
      </ResourceForm>
    );

    expect(screen.getByText('fields')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Archive' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it('has no save button when there is nothing to save, only the archive button', async () => {
    const screen = await renderThemed(
      <ResourceForm
        open
        title="Otter"
        onClose={jest.fn()}
        onArchive={jest.fn()}
        archiveLabel="Stop using"
      />
    );

    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Stop using' })).toBeTruthy();
  });
});
