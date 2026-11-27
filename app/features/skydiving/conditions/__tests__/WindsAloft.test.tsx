import * as React from 'react';
import { NavigationRouteContext } from '@react-navigation/native';
import { Permission } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { fireEvent, render, waitFor } from '../../../../__mocks__/render';
import WindsAloft from '../WindsAloft';

jest.setTimeout(30000);

const mockSetParams = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), setParams: mockSetParams }),
}));

let mockModules: Record<string, unknown> = {};
let mockPermissions: Permission[] = [];
jest.mock('app/providers/operator/context', () => {
  const actual = jest.requireActual('app/providers/operator/context');
  return {
    ...actual,
    useOperatorContext: () => ({
      ...actual.useOperatorContext(),
      operator: {
        operator: {
          id: '1',
          modules: mockModules,
          currentConditions: {
            __typename: 'WeatherCondition',
            id: '1',
            jumpRun: 245,
            temperatureC: 12,
            winds: [{ altitudeM: 4267.2, speedMps: 10.29, direction: 250 }],
          },
        },
        permissions: mockPermissions,
        permissionsLoaded: true,
        called: true,
        loading: false,
      },
    }),
  };
});

const WINDS_ALOFT = { conditions: { kind: 'winds_aloft' } };

async function renderStrip(params?: object) {
  return render(
    <NavigationRouteContext.Provider value={{ key: 'board', name: 'ManifestScreen', params }}>
      <WindsAloft />
    </NavigationRouteContext.Provider>,
    { session: authenticatedSession, graphql: [] }
  );
}

describe('<WindsAloft />', () => {
  beforeEach(() => {
    mockModules = WINDS_ALOFT;
    mockPermissions = [Permission.UpdateWeatherConditions];
    mockSetParams.mockClear();
  });

  it('shows nothing for an operator without winds aloft', async () => {
    mockModules = { conditions: { kind: 'sea_state' } };
    const screen = await renderStrip();
    expect(screen.queryByTestId('board-conditions')).toBeNull();
  });

  it('opens the panel from the strip', async () => {
    const screen = await renderStrip();

    expect(screen.getByTestId('board-conditions')).toBeTruthy();
    expect(screen.queryByTestId('conditions-panel-save')).toBeNull();
    await fireEvent.press(screen.getByText('Update'));
    await waitFor(() => expect(screen.getByTestId('conditions-panel-save')).toBeTruthy());
    expect(screen.getByDisplayValue('245')).toBeTruthy();
  });

  it('offers no update to someone who may not change the conditions', async () => {
    mockPermissions = [];
    const screen = await renderStrip({ conditions: 'open' });

    expect(screen.getByTestId('board-conditions')).toBeTruthy();
    expect(screen.queryByText('Update')).toBeNull();
    await waitFor(() => expect(mockSetParams).toHaveBeenCalledWith({ conditions: undefined }));
    expect(screen.queryByTestId('conditions-panel-save')).toBeNull();
  });

  it('opens the panel when the route asks for it, and clears the request', async () => {
    const screen = await renderStrip({ conditions: 'open' });

    await waitFor(() => expect(screen.getByTestId('conditions-panel-save')).toBeTruthy());
    expect(mockSetParams).toHaveBeenCalledWith({ conditions: undefined });
  });
});
