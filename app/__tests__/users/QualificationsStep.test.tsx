import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { View, Text } from 'react-native';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import MOCK_QUERY_OPERATOR from '../manifest/__mocks__/QueryOperator.mock';
import QualificationsStep, {
  useQualificationStepRequired,
  useStep,
} from 'app/forms/user_wizard/steps/Qualifications';

jest.setTimeout(30000);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));

const tandemRating = {
  __typename: 'Qualification',
  id: '7',
  name: 'Tandem rating',
  slug: 'tandem',
} as const;
const camera = {
  __typename: 'Qualification',
  id: '8',
  name: 'Camera rating',
  slug: 'camera',
} as const;

function Harness() {
  const step = useStep();
  const required = useQualificationStepRequired();
  const methods = useForm({ values: step.defaultValues as never });
  return (
    <FormProvider {...methods}>
      <Text>{required ? 'step required' : 'step not required'}</Text>
      <QualificationsStep actions={null} />
    </FormProvider>
  );
}

async function renderStep(requiredQualifications: unknown[]) {
  const screen = await render(
    <View testID="under-test">
      <Harness />
    </View>,
    {
      session: authenticatedSession,
      graphql: [MOCK_QUERY_OPERATOR({}, { operator: { requiredQualifications } as never })],
    }
  );
  return within(screen.getByTestId('under-test'));
}

describe('The qualification step of the user wizard', () => {
  it('asks for a number and an expiry of each qualification the operator requires', async () => {
    const step = await renderStep([tandemRating, camera]);

    await waitFor(() => expect(step.getByText('Tandem rating')).toBeTruthy());
    expect(step.getByText('Camera rating')).toBeTruthy();
    expect(step.getByText('step required')).toBeTruthy();
    expect(step.getAllByText('Number')).toHaveLength(2);
    expect(step.getAllByText('Expires')).toHaveLength(2);
  });

  it('takes the number that is typed', async () => {
    const step = await renderStep([tandemRating]);

    await waitFor(() => expect(step.getByText('Tandem rating')).toBeTruthy());
    const input = step.getByLabelText('Number');
    await fireEvent.changeText(input, 'T-1234');

    await waitFor(() => expect(step.getByDisplayValue('T-1234')).toBeTruthy());
  });

  it('is not part of the wizard when the operator requires nothing', async () => {
    const step = await renderStep([]);

    await waitFor(() => expect(step.getByText('step not required')).toBeTruthy());
    expect(step.queryByText('Tandem rating')).toBeNull();
  });
});
