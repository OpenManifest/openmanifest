import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import { IndustriesDocument, UpdateOperatorDocument } from 'app/api/reflection';
import { Industry, Permission } from 'app/api/schema.d';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import RulesScreen from '../RulesScreen';
import { moduleSwitches, rulesInput, rulesOf } from '../rules';

jest.setTimeout(30000);

const TEMPLATE_MODULES = ['destinations', 'certifications', 'equipment', 'conditions'];

const industries = {
  request: { operationName: 'Industries', query: IndustriesDocument, variables: {} },
  result: {
    data: {
      industries: [
        {
          __typename: 'IndustryTemplate',
          slug: Industry.Skydiving,
          name: 'Skydiving',
          icon: 'parachute',
          modules: TEMPLATE_MODULES,
        },
      ],
    },
  },
};

/** The update the page sends when self-manifesting is switched off and nothing else changes */
function updateMock() {
  const switches = moduleSwitches(TEMPLATE_MODULES, operatorExtensive.modules as never);
  const initial = rulesOf(operatorExtensive, switches);
  const attributes = rulesInput(operatorExtensive, initial, {
    ...initial,
    rules: { ...initial.rules, allowSelfManifest: false },
  });
  const result = jest.fn(() => ({
    data: {
      updateOperator: {
        __typename: 'UpdateOperatorPayload',
        errors: null,
        fieldErrors: null,
        operator: {
          ...operatorExtensive,
          settings: { ...operatorExtensive.settings, allowSelfManifest: false },
        },
      },
    },
  }));
  return {
    mock: {
      request: {
        operationName: 'UpdateOperator',
        query: UpdateOperatorDocument,
        variables: { id: 1, attributes },
      },
      result,
    },
    result,
  };
}

async function renderRules(graphql: object[] = []) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = await render(<RulesScreen />, {
    session: authenticatedSession,
    permissions: [Permission.UpdateOperator],
    graphql: [industries, industries, ...graphql] as never,
  });
  await waitFor(() => expect(screen.getByTestId('rules')).toBeTruthy(), { timeout: 10000 });
  await waitFor(() => expect(screen.getByTestId('module-conditions')).toBeTruthy());
  return screen;
}

describe('<RulesScreen />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows the rules, the calls and the modules of the template', async () => {
    const screen = await renderRules();

    expect(
      screen.getByRole('switch', { name: 'Members can book themselves on loads', checked: true })
    ).toBeTruthy();
    // Without the certifications module there is no certification rule
    expect(screen.getByTestId('rule-requireCredits')).toBeTruthy();
    expect(screen.queryByTestId('rule-requireCertification')).toBeNull();
    expect(screen.getByTestId('call-schedule-call-20')).toBeTruthy();
    expect(screen.getByTestId('call-schedule-call-10')).toBeTruthy();
    // The operator of the fixture has turned every module off
    expect(screen.getByRole('switch', { name: 'Destinations', checked: false })).toBeTruthy();
    expect(screen.queryByTestId('rules-save-primary-action')).toBeNull();
  });

  it('saves a change with the other settings as they were', async () => {
    const { mock, result } = updateMock();
    const screen = await renderRules([mock]);

    await fireEvent.press(screen.getByTestId('rule-allowSelfManifest'));
    expect(
      screen.getByRole('switch', { name: 'Members can book themselves on loads', checked: false })
    ).toBeTruthy();
    await fireEvent.press(screen.getByTestId('rules-save-primary-action'));

    await waitFor(() => expect(result).toHaveBeenCalled());
  });

  it('adds a call in its place and takes one away', async () => {
    const screen = await renderRules();

    await fireEvent.changeText(screen.getByTestId('call-schedule-minutes'), '12');
    await fireEvent.press(screen.getByTestId('call-schedule-add'));
    const calls = screen.getByTestId('call-schedule-calls');
    expect(
      calls.children.map((chip) => (chip as { props: { testID?: string } }).props.testID)
    ).toEqual([
      'call-schedule-call-20',
      'call-schedule-call-15',
      'call-schedule-call-12',
      'call-schedule-call-10',
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Remove the 15 minute call' }));
    expect(screen.queryByTestId('call-schedule-call-15')).toBeNull();
    expect(screen.getByTestId('rules-save-primary-action')).toBeTruthy();
  });

  it('says why a call cannot be added', async () => {
    const screen = await renderRules();

    await fireEvent.changeText(screen.getByTestId('call-schedule-minutes'), '15');
    await fireEvent.press(screen.getByTestId('call-schedule-add'));

    expect(screen.getByText('There is a call at that time already')).toBeTruthy();
  });
});
