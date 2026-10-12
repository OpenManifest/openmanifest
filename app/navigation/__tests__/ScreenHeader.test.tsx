import * as React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from 'app/test-utils/render';
import ScreenHeader from '../ScreenHeader';
import type { ScreenHeaderProps } from '../ScreenHeader';

const mockOperatorContext = {
  operator: {
    loading: false,
    operator: { name: 'Skydive Test', settings: {} },
    currentUser: {
      id: '5',
      creditsCents: 100,
      expiresAt: null,
      rigInspections: [],
      user: { bodyMassKg: 80, rigs: [] },
    },
  },
};
jest.mock('app/providers/operator/context', () => ({
  ...jest.requireActual('app/providers/operator/context'),
  useOperatorContext: () => mockOperatorContext,
}));

function header(props: Partial<ScreenHeaderProps> & { title?: string } = {}) {
  const { title = 'Board', ...rest } = props;
  const goBack = jest.fn();
  const element = (
    <ScreenHeader
      {...({
        back: undefined,
        navigation: { goBack, navigate: jest.fn() },
        options: { title },
        ...rest,
      } as unknown as ScreenHeaderProps)}
    />
  );
  return { element, goBack };
}

describe('ScreenHeader', () => {
  it('is the banner landmark and names the screen with a heading', async () => {
    const screen = await renderWithProviders(header().element);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Board' })).toBeTruthy());
    expect(screen.getByTestId('screen-header').props.role).toBe('banner');
  });

  it('has no back button on a root screen', async () => {
    const screen = await renderWithProviders(header().element);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Board' })).toBeTruthy());
    expect(screen.queryByRole('button', { name: /^Back/ })).toBeNull();
  });

  it('names the back button after the screen it returns to, and goes back', async () => {
    const { element, goBack } = header({ back: { title: 'Board' } as never, title: 'Load #3' });
    const screen = await renderWithProviders(element);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Back to Board' })).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Back to Board' }));

    expect(goBack).toHaveBeenCalled();
  });

  it('falls back to a plain Back when the previous screen has no title', async () => {
    const screen = await renderWithProviders(
      header({ back: { title: undefined } as never }).element
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy());
  });

  it('shows the actions of the screen', async () => {
    const { element } = header({
      options: { title: 'Board', headerRight: () => <></> } as never,
    });
    const screen = await renderWithProviders(element);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Board' })).toBeTruthy());
  });

  const search = {
    visible: false,
    text: '',
    placeholder: 'Search people',
    setVisible: jest.fn(),
    onChange: jest.fn(),
  };

  it('opens the search box from its button', async () => {
    const screen = await renderWithProviders(header({ search }).element);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Search people' })).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Search people' }));

    expect(search.setVisible).toHaveBeenCalledWith(true);
  });

  it('types in the open search box and closes it', async () => {
    const screen = await renderWithProviders(
      header({ search: { ...search, visible: true } }).element
    );

    await waitFor(() => expect(screen.getByRole('searchbox')).toBeTruthy());
    await fireEvent.changeText(screen.getByRole('searchbox'), 'ana');
    expect(search.onChange).toHaveBeenCalledWith('ana');
    await fireEvent.press(screen.getByRole('button', { name: 'Close search' }));
    expect(search.setVisible).toHaveBeenCalledWith(false);
  });

  it('shows the setup warnings under the header', async () => {
    mockOperatorContext.operator.currentUser.user.bodyMassKg = 0;
    const screen = await renderWithProviders(header().element);

    await waitFor(() => expect(screen.getByTestId('setup-banner')).toBeTruthy());
  });

  it('shows no setup warnings when told to hide them', async () => {
    mockOperatorContext.operator.currentUser.user.bodyMassKg = 0;
    const screen = await renderWithProviders(header({ hideWarnings: true }).element);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Board' })).toBeTruthy());
    expect(screen.queryByTestId('setup-banner')).toBeNull();
  });

  afterEach(() => {
    mockOperatorContext.operator.currentUser.user.bodyMassKg = 80;
  });
});
