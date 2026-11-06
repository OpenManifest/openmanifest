import * as React from 'react';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import Buttons from './Buttons';
import Dots from './Dots';

describe('wizard Buttons', () => {
  it('marks the next button of the current page as the primary action', async () => {
    const screen = await render(
      <Buttons nextLabel="Next" backLabel="Back" onNext={jest.fn()} onBack={jest.fn()} />,
      { graphql: [] }
    );

    expect(screen.getByTestId('wizard-next-primary-action')).toBeTruthy();
    await screen.unmount();
  });

  it('does not mark the buttons of pages that are not shown', async () => {
    const screen = await render(
      <Buttons
        isCurrent={false}
        nextLabel="Next"
        backLabel="Back"
        onNext={jest.fn()}
        onBack={jest.fn()}
      />,
      { graphql: [] }
    );

    expect(screen.queryByTestId('wizard-next-primary-action')).toBeNull();
    await screen.unmount();
  });

  it('names the buttons Next and Back unless told otherwise, and stays when the step refuses', async () => {
    const onNext = jest.fn(() => Promise.reject(new Error('invalid')));
    const onBack = jest.fn();
    const screen = await render(<Buttons onNext={onNext} onBack={onBack} />, { graphql: [] });

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
    // The refusal is the step's to show: the button is pressable again
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Back' }).props['aria-disabled']).toBeFalsy()
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    await screen.unmount();
  });
});

describe('wizard Dots', () => {
  it('says which step of how many is shown', async () => {
    const screen = await render(<Dots count={4} index={1} />, { graphql: [] });

    expect(screen.getByLabelText('Step 2 of 4')).toBeTruthy();
    await screen.unmount();
  });
});
