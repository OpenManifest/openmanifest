import * as React from 'react';
import { Text } from 'react-native';
import type { FetchResult } from '@apollo/client';
import { ReloadWeatherDocument, useReloadWeatherMutation } from 'app/api/reflection';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

// The server finds the dropzone of the weather condition itself (BUG-040): the app sends the id and nothing else
function Reload({ id }: { id: number }) {
  const [reload, { data }] = useReloadWeatherMutation();
  const payload = data?.reloadWeatherCondition;
  return (
    <>
      <Text onPress={() => reload({ variables: { id } })}>Reload</Text>
      <Text testID="exit-spot">{String(payload?.weatherCondition?.exitSpotMiles ?? '')}</Text>
      <Text testID="errors">{(payload?.errors || []).join(',')}</Text>
    </>
  );
}

const condition = {
  __typename: 'WeatherCondition',
  id: '7',
  createdAt: '2026-10-09T00:00:00Z',
  updatedAt: '2026-10-09T01:00:00Z',
  jumpRun: 270,
  temperature: 12,
  offsetDirection: null,
  offsetMiles: 0,
  exitSpotMiles: 0.55,
  winds: [{ __typename: 'Wind', altitude: '3000', speed: '8', direction: '270', temperature: 12 }],
};

function renderReload(result: FetchResult<Record<string, unknown>>) {
  const request = jest.fn(() => result);
  const screen = render(<Reload id={7} />, {
    session: authenticatedSession,
    graphql: [
      {
        request: { query: ReloadWeatherDocument, variables: { id: 7 } },
        result: request,
      },
    ],
  });
  return { screen, request };
}

describe('reloading the weather', () => {
  it('sends the id of the weather condition and shows the reloaded drift with its decimals', async () => {
    const { screen, request } = renderReload({
      data: {
        reloadWeatherCondition: {
          __typename: 'ReloadWeatherConditionPayload',
          errors: null,
          fieldErrors: null,
          weatherCondition: condition,
        },
      },
    });

    fireEvent.press(screen.getByText('Reload'));

    await waitFor(() => expect(screen.getByTestId('exit-spot').props.children).toBe('0.55'), {
      timeout: 10000,
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('shows what the server says when the winds could not be fetched', async () => {
    const { screen } = renderReload({
      data: {
        reloadWeatherCondition: {
          __typename: 'ReloadWeatherConditionPayload',
          errors: ['The winds could not be fetched, try again in a moment'],
          fieldErrors: null,
          weatherCondition: null,
        },
      },
    });

    fireEvent.press(screen.getByText('Reload'));

    await waitFor(
      () =>
        expect(screen.getByTestId('errors').props.children).toBe(
          'The winds could not be fetched, try again in a moment'
        ),
      { timeout: 10000 }
    );
  });
});
