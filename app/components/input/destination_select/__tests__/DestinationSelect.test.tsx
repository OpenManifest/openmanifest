import * as React from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { DestinationsDocument } from 'app/api/reflection';
import { fullAltitude, hopNPop, reef } from 'app/__fixtures__/destination.fixture';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { scoped } from 'app/test-utils/hosts';
import { fireEvent, render, waitFor } from '../../../../__mocks__/render';
import { DestinationListField, DestinationSelectField } from '../index';

jest.setTimeout(30000);

const destinations = {
  request: { query: DestinationsDocument, variables: { operatorId: '1' } },
  result: {
    data: {
      operator: {
        __typename: 'Operator',
        id: '1',
        destinations: [fullAltitude, hopNPop, reef],
      },
    },
  },
  maxUsageCount: 10,
};

type Fields = { place: string | null; stops: string[] };

function Harness({ values, field }: { values: Partial<Fields>; field: 'select' | 'list' }) {
  const { control, watch } = useForm<Fields>({
    defaultValues: { place: null, stops: [], ...values },
  });
  const { place, stops } = watch();
  return (
    <View testID="under-test">
      {field === 'select' ? (
        <DestinationSelectField {...{ control }} name="place" allowNone />
      ) : (
        <DestinationListField {...{ control }} name="stops" />
      )}
      <View testID="value" accessibilityLabel={JSON.stringify({ place, stops })} />
    </View>
  );
}

const valueOf = (screen: Awaited<ReturnType<typeof render>>) =>
  JSON.parse(screen.getByTestId('value').props.accessibilityLabel);

describe('<DestinationSelectField />', () => {
  it('offers the operator’s destinations, an altitude with its height, and none', async () => {
    const screen = await render(<Harness values={{ place: '1' }} field="select" />, {
      session: authenticatedSession,
      graphql: [destinations],
    });
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('Full altitude (14k)')).toBeTruthy());
    await fireEvent.press(form.getByRole('combobox', { name: 'Destination' }));
    expect(screen.getByRole('option', { name: 'Hop n Pop (4k)' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Reef' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'None' })).toBeTruthy();
  });

  it('chooses one and clears the choice with none', async () => {
    const screen = await render(<Harness values={{ place: '1' }} field="select" />, {
      session: authenticatedSession,
      graphql: [destinations],
    });
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('Full altitude (14k)')).toBeTruthy());
    await fireEvent.press(form.getByRole('combobox', { name: 'Destination' }));
    await fireEvent.press(screen.getByRole('option', { name: 'Reef' }));
    expect(valueOf(screen).place).toBe('3');

    await fireEvent.press(form.getByRole('combobox', { name: 'Destination' }));
    await fireEvent.press(screen.getByRole('option', { name: 'None' }));
    expect(valueOf(screen).place).toBeNull();
  });
});

describe('<DestinationListField />', () => {
  it('adds the chosen destination at the end and leaves out the ones already in', async () => {
    const screen = await render(<Harness values={{ stops: ['3'] }} field="list" />, {
      session: authenticatedSession,
      graphql: [destinations],
    });
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('1. Reef')).toBeTruthy());
    await fireEvent.press(form.getByRole('combobox', { name: 'Add destination' }));
    expect(screen.queryByRole('option', { name: 'Reef' })).toBeNull();
    await fireEvent.press(screen.getByRole('option', { name: 'Hop n Pop (4k)' }));

    expect(valueOf(screen).stops).toEqual(['3', '2']);
    await waitFor(() => expect(form.getByText('2. Hop n Pop')).toBeTruthy());
  });

  it('puts the destinations in order and takes them out', async () => {
    const screen = await render(<Harness values={{ stops: ['3', '2', '1'] }} field="list" />, {
      session: authenticatedSession,
      graphql: [destinations],
    });
    const form = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(form.getByText('1. Reef')).toBeTruthy());
    expect(form.getByRole('button', { name: 'Move Reef up', disabled: true })).toBeTruthy();
    expect(
      form.getByRole('button', { name: 'Move Full altitude down', disabled: true })
    ).toBeTruthy();

    await fireEvent.press(form.getByRole('button', { name: 'Move Full altitude up' }));
    expect(valueOf(screen).stops).toEqual(['3', '1', '2']);

    await fireEvent.press(form.getByRole('button', { name: 'Remove Reef' }));
    expect(valueOf(screen).stops).toEqual(['1', '2']);
  });

  it('says what is missing when there are none', async () => {
    const screen = await render(<Harness values={{}} field="list" />, {
      session: authenticatedSession,
      graphql: [destinations],
    });

    await waitFor(() =>
      expect(
        screen.getByText('No destinations yet. Add one before the load is called.')
      ).toBeTruthy()
    );
  });
});
