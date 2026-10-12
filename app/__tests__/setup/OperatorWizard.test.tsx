import * as React from 'react';
import OperatorWizard from '../../screens/wizards/operator_wizard/OperatorWizard';
import { CreateOperatorDocument } from 'app/api/reflection';
import { resolveTimeZone } from 'app/utils/operatorTime';
import { COLOR_PRESETS } from '../../components/input/colorpicker/ColorPicker';
import { act, fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_CERTIFICATION_BODIES from '../manifest/__mocks__/QueryCertificationBodies.mock';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { textInputs } from 'app/test-utils/hosts';

jest.setTimeout(30000);

// The real carousel reports its own (animated) position back to the wizard, which races with the wizard's index in
// tests; the wizard only needs it to render the steps
jest.mock('react-native-reanimated-carousel', () => {
  const mockReact = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    Carousel: mockReact.forwardRef(
      (
        {
          data,
          renderItem,
        }: { data: unknown[]; renderItem: (info: { item: unknown; index: number }) => unknown },
        ref: unknown
      ) => {
        mockReact.useImperativeHandle(ref, () => ({
          next: () => undefined,
          prev: () => undefined,
          getCurrentIndex: () => 0,
          scrollTo: () => undefined,
        }));
        return mockReact.createElement(
          View,
          null,
          data.map((item, index) =>
            mockReact.createElement(View, { key: index }, renderItem({ item, index }))
          )
        );
      }
    ),
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// The affiliation step selects the only certificationBody by itself, so give it none to choose from
const NO_CERTIFICATION_BODIES = {
  ...MOCK_QUERY_CERTIFICATION_BODIES(),
  result: { data: { certificationBodies: [] } },
};

function renderWizard(
  graphql: Parameters<typeof render>[1]['graphql'] = [NO_CERTIFICATION_BODIES]
) {
  return render(<OperatorWizard />, {
    session: authenticatedSession,
    graphql,
  });
}

describe('<OperatorWizard />', () => {
  // Every step is mounted at once, so the buttons are found by step: Next buttons come in step order
  it('asks for a name before leaving the first step', async () => {
    const screen = await renderWizard();

    await fireEvent.press(screen.getAllByText('Next')[0]);

    await waitFor(() => expect(screen.getByText('Your dropzone must have a name')).toBeTruthy());
  });

  it('clears the error as the name is typed, then asks for an organization on the next step', async () => {
    const screen = await renderWizard();

    await fireEvent.press(screen.getAllByText('Next')[0]);
    await waitFor(() => expect(screen.getByText('Your dropzone must have a name')).toBeTruthy());

    await fireEvent.changeText(textInputs(screen.container)[0], 'Skydive Alpha');
    await waitFor(() => expect(screen.queryByText('Your dropzone must have a name')).toBeNull());
    expect(screen.getByDisplayValue('Skydive Alpha')).toBeTruthy();

    // Next on the name step, then Next on the affiliation step
    await fireEvent.press(screen.getAllByText('Next')[0]);
    await waitFor(() => expect(screen.getAllByText('Next').length).toBeGreaterThan(1));
    await fireEvent.press(screen.getAllByText('Next')[1]);

    await waitFor(() =>
      expect(screen.getByText('Your dropzone must accept at least one organization')).toBeTruthy()
    );
  });

  it('creates the dropzone with what was entered when the banner step is done', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createOperator: {
          __typename: 'CreateOperatorPayload',
          operator: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const screen = await renderWizard([
      MOCK_QUERY_CERTIFICATION_BODIES(),
      {
        request: {
          query: CreateOperatorDocument,
          operationName: 'CreateOperator',
          variables: {
            industry: 'SKYDIVING',
            timeZone: resolveTimeZone(),
            name: 'Skydive Alpha',
            banner: '',
            certificationBodyIds: [1],
            lat: null,
            lng: null,
            primaryColor: COLOR_PRESETS[0],
            secondaryColor: '',
          },
        },
        result: mutationResult,
      },
    ]);

    // Every step has the same Next button, which acts on the current step; let each press settle
    const next = async () => {
      await fireEvent.press(screen.getAllByText('Next')[0]);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
    };

    await fireEvent.changeText(textInputs(screen.container)[0], 'Skydive Alpha');
    await next(); // name
    // The affiliation step selects the only certificationBody once the list has loaded
    await waitFor(() => expect(screen.getAllByText('APF').length).toBeGreaterThan(0));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    await next(); // affiliation
    await next(); // location
    await fireEvent.press(screen.getByLabelText(`Color ${COLOR_PRESETS[0]}`));
    await next(); // branding
    await next(); // banner: creates the operator

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
