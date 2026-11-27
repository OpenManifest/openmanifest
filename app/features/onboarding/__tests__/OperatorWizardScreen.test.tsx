import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import { CreateOperatorDocument, IndustriesDocument } from 'app/api/reflection';
import { Industry } from 'app/api/schema.d';
import { DEFAULT_BRAND } from 'app/ui';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import OperatorWizardScreen from '../OperatorWizardScreen';
import { localeDefaults } from '../wizard';

jest.setTimeout(30000);

const mockDispatch = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useLinkTo: () => jest.fn(),
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    dispatch: mockDispatch,
    goBack: jest.fn(),
  }),
}));

const summary = (overrides: object = {}) => ({
  __typename: 'IndustryPresetSummary',
  roles: ['Customer', 'Front desk', 'Admin', 'Owner'],
  crewRoles: [],
  ticketTypes: [],
  extras: [],
  destinations: [],
  equipmentKinds: [],
  activityTypes: 0,
  ...overrides,
});

const industries = {
  request: { operationName: 'Industries', query: IndustriesDocument, variables: {} },
  result: {
    data: {
      industries: [
        {
          __typename: 'IndustryTemplate',
          slug: Industry.Skydiving,
          name: 'Skydiving',
          description: 'Vehicles and people',
          icon: 'parachute',
          base: '_aviation',
          modules: ['destinations', 'certifications'],
          units: { altitude: 'ft', mass: 'kg' },
          vehicleKinds: ['boat'],
          presetSummary: summary({ crewRoles: ['Pilot', 'GCA'] }),
        },
        {
          __typename: 'IndustryTemplate',
          slug: Industry.Generic,
          name: 'Other',
          description: 'Any operator that manifests people onto loads',
          icon: 'format-list-bulleted',
          base: null,
          modules: ['destinations', 'multi_vehicle'],
          units: { distance: 'km', mass: 'kg' },
          vehicleKinds: ['vehicle'],
          presetSummary: summary(),
        },
      ],
    },
  },
};

async function renderWizard(graphql: object[] = []) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = await render(<OperatorWizardScreen />, {
    session: authenticatedSession,
    graphql: [industries, industries, industries, ...graphql] as never,
  });
  await waitFor(() => expect(screen.getByTestId('industry-generic')).toBeTruthy(), {
    timeout: 10000,
  });
  return screen;
}

const next = (screen: Awaited<ReturnType<typeof renderWizard>>) =>
  fireEvent.press(screen.getByTestId('wizard-next-primary-action'));

describe('<OperatorWizardScreen />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('starts with the industry, grouped, and asks for one before going on', async () => {
    const screen = await renderWizard();

    expect(screen.getByRole('heading', { name: 'What do you run?' })).toBeTruthy();
    expect(screen.getByLabelText('Step 1 of 7')).toBeTruthy();
    expect(screen.getByText('Air')).toBeTruthy();
    expect(screen.getByTestId('industry-group-other')).toBeTruthy();
    await next(screen);
    await waitFor(() =>
      expect(screen.getByText('Pick the kind of business closest to yours')).toBeTruthy()
    );
  });

  it('previews the presets of the template picked and leaves out the bodies step without certifications', async () => {
    const screen = await renderWizard();

    await fireEvent.press(screen.getByTestId('industry-skydiving'));
    await waitFor(() => expect(screen.getByTestId('industry-preview')).toBeTruthy());
    expect(screen.getByText('Crew roles: Pilot, GCA')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('industry-generic'));
    await waitFor(() => expect(screen.getByLabelText('Step 1 of 7')).toBeTruthy());
    expect(screen.getByText('Crew roles: none')).toBeTruthy();
  });

  it('creates a generic operator with the time zone, currency and units the wizard filled in', async () => {
    const { timeZone, currency } = localeDefaults();
    const created = jest.fn(() => ({
      data: {
        createOperator: {
          __typename: 'CreateOperatorPayload',
          operator: { ...operatorExtensive, id: '42' },
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const screen = await renderWizard([
      {
        request: {
          operationName: 'CreateOperator',
          query: CreateOperatorDocument,
          variables: {
            industry: Industry.Generic,
            name: 'Harbour Tours',
            timeZone,
            lat: null,
            lng: null,
            currency,
            units: { distance: 'km', mass: 'lb' },
            certificationBodyIds: [],
            primaryColor: DEFAULT_BRAND,
          },
        },
        result: created,
      },
    ]);

    await fireEvent.press(screen.getByTestId('industry-generic'));
    await next(screen);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Name' })).toBeTruthy());
    await next(screen);
    await waitFor(() => expect(screen.getByText('Your operator must have a name')).toBeTruthy());
    await fireEvent.changeText(screen.getByTestId('wizard-name'), 'Harbour Tours');
    await next(screen);
    await waitFor(() => expect(screen.getByDisplayValue(timeZone)).toBeTruthy());
    await next(screen);
    await waitFor(() => expect(screen.getByTestId('wizard-unit-mass')).toBeTruthy());
    // The template's units are pre-filled; the owner changes one
    await fireEvent.press(screen.getByTestId('wizard-unit-mass'));
    await fireEvent.press(await screen.findByRole('option', { name: /Pounds/ }));
    await next(screen);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Branding' })).toBeTruthy());
    await next(screen);

    await waitFor(() => expect(created).toHaveBeenCalledTimes(1), { timeout: 10000 });
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Review presets' })).toBeTruthy()
    );
  });
});
