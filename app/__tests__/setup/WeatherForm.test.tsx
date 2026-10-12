import * as React from 'react';
import { Text, View } from 'react-native';
import { MUTATION_CREATE_WEATHER_CONDITION } from 'app/api/hooks/useMutationCreateWeatherConditions';
import type { WeatherConditionEssentialsFragment } from 'app/api/operations';
import { useWeatherForm } from 'app/forms/weather';
import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { setOperatorFormat } from 'app/i18n/operatorFormat';

jest.setTimeout(30000);

const conditions = {
  __typename: 'WeatherCondition',
  id: '3',
  jumpRun: 90,
  temperatureC: 12,
  // 3,000 ft and 8 knots, as the API gives them
  winds: [{ __typename: 'Wind', altitudeM: 914.4, speedMps: 4.12, direction: 270 }],
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

async function renderForm(graphql: Parameters<typeof render>[1]['graphql'] = []) {
  const screen = await render(<Harness />, {
    session: authenticatedSession,
    graphql,
  });
  return within(screen.getByTestId('under-test'));
}

describe('weather conditions form', () => {
  // The operator of the fixtures shows feet, knots and degrees Celsius
  beforeEach(() => setOperatorFormat({ units: { altitude: 'ft', speed: 'kn', temperature: 'c' } }));
  afterEach(() => setOperatorFormat({ units: {} }));

  it('starts with the conditions being edited', async () => {
    const form = await renderForm();

    await waitFor(() => expect(form.getByDisplayValue('12')).toBeTruthy());
    expect(form.getByDisplayValue('90')).toBeTruthy();
    expect(form.getByText('3000 ft')).toBeTruthy();
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
    const form = await renderForm([
      {
        request: {
          query: MUTATION_CREATE_WEATHER_CONDITION,
          operationName: 'CreateWeatherConditions',
          variables: {
            id: 3,
            operatorId: 1,
            winds: JSON.stringify([{ altitude_m: 914.4, speed_mps: 4.12, direction: 270 }]),
            jumpRun: 120,
            temperatureC: 12,
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(form.getByDisplayValue('90')).toBeTruthy());
    const jumpRun = form.getByDisplayValue('90');
    await fireEvent.changeText(jumpRun, '120');
    await fireEvent(jumpRun, 'blur');
    await fireEvent.press(form.getByText('Save conditions'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
    await waitFor(() => expect(form.getByTestId('result').props.children).toBe('saved'));
  });

  it('does not save a jump run outside 0 to 360', async () => {
    const mutationResult = jest.fn();
    const form = await renderForm([
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
    await fireEvent.changeText(jumpRun, '400');
    await fireEvent(jumpRun, 'blur');
    await fireEvent.press(form.getByText('Save conditions'));

    await waitFor(() => expect(form.getByTestId('result').props.children).toBe('not saved'));
    expect(mutationResult).not.toHaveBeenCalled();
  });
});
