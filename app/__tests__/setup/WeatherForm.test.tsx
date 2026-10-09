import * as React from 'react';
import { Text, View } from 'react-native';
import { MUTATION_CREATE_WEATHER_CONDITION } from 'app/api/hooks/useMutationCreateWeatherConditions';
import type { WeatherConditionEssentialsFragment } from 'app/api/operations';
import { useWeatherForm } from 'app/forms/weather';
import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const conditions = {
  __typename: 'WeatherCondition',
  id: '3',
  jumpRun: 90,
  temperature: 12,
  winds: [{ __typename: 'Wind', altitude: '3000', speed: '8', direction: '270' }],
} as unknown as WeatherConditionEssentialsFragment;

let lastSave: Promise<boolean> | undefined;

function Harness() {
  const { open, save } = useWeatherForm();
  const [result, setResult] = React.useState('pending');
  React.useEffect(() => open(conditions), [open]);

  return (
    <View testID="under-test">
      <WeatherConditionForm />
      <Text
        onPress={() => {
          lastSave = save();
          lastSave.then((saved) => setResult(saved ? 'saved' : 'not saved'));
        }}
      >
        Save conditions
      </Text>
      <Text testID="result">{result}</Text>
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

describe('weather conditions form', () => {
  it('starts with the conditions being edited', async () => {
    const form = renderForm();

    await waitFor(() => expect(form.getByDisplayValue('12')).toBeTruthy());
    expect(form.getByDisplayValue('90')).toBeTruthy();
    expect(form.getByText('3000')).toBeTruthy();
    expect(form.getByDisplayValue('8')).toBeTruthy();
    expect(form.getByDisplayValue('270')).toBeTruthy();
  });

  it('sends the edited conditions to CreateWeatherConditions', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createWeatherCondition: {
          __typename: 'CreateWeatherConditionPayload',
          errors: null,
          fieldErrors: null,
          weatherCondition: null,
        },
      },
    }));
    const form = renderForm([
      {
        request: {
          query: MUTATION_CREATE_WEATHER_CONDITION,
          operationName: 'CreateWeatherConditions',
          variables: {
            id: 3,
            dropzoneId: 1,
            winds: JSON.stringify([{ altitude: '3000', direction: '270', speed: '8' }]),
            jumpRun: 120,
            temperature: 12,
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(form.getByDisplayValue('90')).toBeTruthy());
    const jumpRun = form.getByDisplayValue('90');
    fireEvent.changeText(jumpRun, '120');
    fireEvent(jumpRun, 'blur');
    fireEvent.press(form.getByText('Save conditions'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
    await waitFor(() => expect(form.getByTestId('result').props.children).toBe('saved'));
  });

  it('does not save a jump run outside 0 to 360', async () => {
    const mutationResult = jest.fn();
    const form = renderForm([
      {
        request: {
          query: MUTATION_CREATE_WEATHER_CONDITION,
          operationName: 'CreateWeatherConditions',
          variables: {},
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(form.getByDisplayValue('90')).toBeTruthy());
    const jumpRun = form.getByDisplayValue('90');
    fireEvent.changeText(jumpRun, '400');
    fireEvent(jumpRun, 'blur');
    fireEvent.press(form.getByText('Save conditions'));

    await waitFor(() => expect(form.getByTestId('result').props.children).toBe('not saved'));
    expect(mutationResult).not.toHaveBeenCalled();
  });
});
