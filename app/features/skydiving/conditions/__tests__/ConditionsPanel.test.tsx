import * as React from 'react';
import type { WeatherConditionEssentialsFragment } from 'app/api/operations';
import { ReloadWeatherDocument, SaveConditionsDocument } from 'app/api/reflection';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { setOperatorFormat } from 'app/i18n/operatorFormat';
import { fireEvent, render, waitFor } from '../../../../__mocks__/render';
import ConditionsPanel from '../ConditionsPanel';

jest.setTimeout(30000);

const conditions = {
  __typename: 'WeatherCondition',
  id: '3',
  jumpRun: 90,
  temperatureC: 12,
  // 3,000 ft and 8 knots, as the API gives them
  winds: [
    { __typename: 'Wind', altitudeM: 914.4, speedMps: 4.12, direction: 270, temperatureC: 9 },
  ],
} as unknown as WeatherConditionEssentialsFragment;

const saved = {
  ...conditions,
  offsetDirection: null,
  offsetM: 0,
  exitSpotM: 0,
  createdAt: '2026-11-06T00:00:00Z',
  updatedAt: '2026-11-06T01:00:00Z',
};

async function renderPanel(
  graphql: Parameters<typeof render>[1]['graphql'] = [],
  props: Partial<React.ComponentProps<typeof ConditionsPanel>> = {}
) {
  const onClose = jest.fn();
  const screen = await render(
    <ConditionsPanel open onClose={onClose} conditions={conditions} operatorId="1" {...props} />,
    { session: authenticatedSession, graphql }
  );
  return { screen, onClose };
}

describe('<ConditionsPanel />', () => {
  // The operator of the fixtures shows feet, knots and degrees Celsius
  beforeEach(() => setOperatorFormat({ units: { altitude: 'ft', speed: 'kn', temperature: 'c' } }));
  afterEach(() => setOperatorFormat({ units: {} }));

  it('starts with the conditions being edited, in the operator units', async () => {
    const { screen } = await renderPanel();

    await waitFor(() => expect(screen.getByDisplayValue('12')).toBeTruthy());
    expect(screen.getByDisplayValue('90')).toBeTruthy();
    expect(screen.getByDisplayValue('3000')).toBeTruthy();
    expect(screen.getByDisplayValue('8')).toBeTruthy();
    expect(screen.getByDisplayValue('270')).toBeTruthy();
    expect(screen.getByText('ft')).toBeTruthy();
    expect(screen.getByText('kn')).toBeTruthy();
    // No dial: the heading is a number
    expect(screen.getByLabelText('Jump run heading')).toBeTruthy();
  });

  it('sends the edited conditions to SaveConditions and closes', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createWeatherCondition: {
          __typename: 'CreateWeatherConditionPayload',
          errors: null,
          fieldErrors: null,
          weatherCondition: { ...saved, jumpRun: 120 },
        },
      },
    }));
    const { screen, onClose } = await renderPanel([
      {
        request: {
          query: SaveConditionsDocument,
          variables: {
            id: 3,
            operatorId: 1,
            winds: JSON.stringify([
              { altitude_m: 914.4, speed_mps: 4.12, direction: 270, temperature_c: 9 },
            ]),
            temperatureC: 12,
            jumpRun: 120,
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(screen.getByDisplayValue('90')).toBeTruthy());
    await fireEvent.changeText(screen.getByDisplayValue('90'), '120');
    await fireEvent.press(screen.getByTestId('conditions-panel-save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('does not save a jump run outside 0 to 359', async () => {
    const mutationResult = jest.fn();
    const { screen, onClose } = await renderPanel([
      { request: { query: SaveConditionsDocument, variables: {} }, result: mutationResult },
    ]);

    await waitFor(() => expect(screen.getByDisplayValue('90')).toBeTruthy());
    await fireEvent.changeText(screen.getByDisplayValue('90'), '360');
    await fireEvent.press(screen.getByTestId('conditions-panel-save'));

    await waitFor(() => expect(screen.getByText('A heading from 0 to 359°')).toBeTruthy());
    expect(mutationResult).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('adds a height, asks for it, and removes it again', async () => {
    const { screen } = await renderPanel();

    await waitFor(() => expect(screen.getByTestId('conditions-panel-wind-0')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('conditions-panel-add-wind'));
    expect(screen.getByTestId('conditions-panel-wind-1')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('conditions-panel-save'));
    await waitFor(() => expect(screen.getByText('Enter a number')).toBeTruthy());

    await fireEvent.press(screen.getByLabelText('Remove wind 2'));
    expect(screen.queryByTestId('conditions-panel-wind-1')).toBeNull();
    expect(screen.queryByText('Enter a number')).toBeNull();
  });

  it('fetches the winds from the feed when the operator has a location', async () => {
    const fetched = {
      ...saved,
      jumpRun: 245,
      winds: [
        {
          __typename: 'Wind',
          altitudeM: 4267.2,
          speedMps: 10.29,
          direction: 250,
          temperatureC: -12,
        },
      ],
    };
    const request = jest.fn(() => ({
      data: {
        reloadWeatherCondition: {
          __typename: 'ReloadWeatherConditionPayload',
          errors: null,
          fieldErrors: null,
          weatherCondition: fetched,
        },
      },
    }));
    const { screen } = await renderPanel(
      [{ request: { query: ReloadWeatherDocument, variables: { id: 3 } }, result: request }],
      { canFetch: true }
    );

    await fireEvent.press(screen.getByTestId('conditions-panel-fetch'));
    await waitFor(() => expect(screen.getByDisplayValue('245')).toBeTruthy(), { timeout: 10000 });
    expect(screen.getByDisplayValue('14000')).toBeTruthy();
    expect(screen.getByDisplayValue('20')).toBeTruthy();
  });

  it('offers no fetch without a location', async () => {
    const { screen } = await renderPanel();
    await waitFor(() => expect(screen.getByDisplayValue('90')).toBeTruthy());
    expect(screen.queryByTestId('conditions-panel-fetch')).toBeNull();
  });
});
