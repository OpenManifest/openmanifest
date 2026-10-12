import * as React from 'react';
import { render } from '../../__mocks__/render';
import Buttons from './Buttons';

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
});
