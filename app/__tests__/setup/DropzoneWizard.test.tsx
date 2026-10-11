import * as React from 'react';
import { TextInput } from 'react-native';
import DropzoneWizard from '../../screens/wizards/dropzone_wizard/DropzoneWizard';
import { CreateDropzoneDocument } from 'app/api/reflection';
import { COLOR_PRESETS } from '../../components/input/colorpicker/ColorPicker';
import { act, fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_FEDERATIONS from '../manifest/__mocks__/QueryFederations.mock';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

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

// The affiliation step selects the only federation by itself, so give it none to choose from
const NO_FEDERATIONS = { ...MOCK_QUERY_FEDERATIONS(), result: { data: { federations: [] } } };

function renderWizard(graphql: Parameters<typeof render>[1]['graphql'] = [NO_FEDERATIONS]) {
  return render(<DropzoneWizard />, {
    session: authenticatedSession,
    graphql,
  });
}

describe('<DropzoneWizard />', () => {
  // Every step is mounted at once, so the buttons are found by step: Next buttons come in step order
  it('asks for a name before leaving the first step', async () => {
    const screen = renderWizard();

    fireEvent.press(screen.getAllByText('Next')[0]);

    await waitFor(() => expect(screen.getByText('Your dropzone must have a name')).toBeTruthy());
  });

  it('clears the error as the name is typed, then asks for an organization on the next step', async () => {
    const screen = renderWizard();

    fireEvent.press(screen.getAllByText('Next')[0]);
    await waitFor(() => expect(screen.getByText('Your dropzone must have a name')).toBeTruthy());

    fireEvent.changeText(screen.UNSAFE_getAllByType(TextInput)[0], 'Skydive Alpha');
    await waitFor(() => expect(screen.queryByText('Your dropzone must have a name')).toBeNull());
    expect(screen.getByDisplayValue('Skydive Alpha')).toBeTruthy();

    // Next on the name step, then Next on the affiliation step
    fireEvent.press(screen.getAllByText('Next')[0]);
    await waitFor(() => expect(screen.getAllByText('Next').length).toBeGreaterThan(1));
    fireEvent.press(screen.getAllByText('Next')[1]);

    await waitFor(() =>
      expect(screen.getByText('Your dropzone must have an associated organization')).toBeTruthy()
    );
  });

  it('creates the dropzone with what was entered when the banner step is done', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createDropzone: {
          __typename: 'CreateDropzonePayload',
          dropzone: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const screen = renderWizard([
      MOCK_QUERY_FEDERATIONS(),
      {
        request: {
          query: CreateDropzoneDocument,
          operationName: 'CreateDropzone',
          variables: {
            name: 'Skydive Alpha',
            banner: '',
            federation: 1,
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
      fireEvent.press(screen.getAllByText('Next')[0]);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
    };

    fireEvent.changeText(screen.UNSAFE_getAllByType(TextInput)[0], 'Skydive Alpha');
    await next(); // name
    // The affiliation step selects the only federation once the list has loaded
    await waitFor(() => expect(screen.getAllByText('APF').length).toBeGreaterThan(0));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    await next(); // affiliation
    await next(); // location
    fireEvent.press(screen.getByLabelText(`Color ${COLOR_PRESETS[0]}`));
    await next(); // branding
    await next(); // banner: creates the dropzone

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
