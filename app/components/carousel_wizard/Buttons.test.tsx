import * as React from 'react';
import { render } from '../../__mocks__/render';
import Buttons from './Buttons';

describe('wizard Buttons', () => {
  it('marks the next button of the current page as the primary action', () => {
    const screen = render(
      <Buttons nextLabel="Next" backLabel="Back" onNext={jest.fn()} onBack={jest.fn()} />,
      { graphql: [] }
    );

    expect(screen.getByTestId('wizard-next-primary-action')).toBeTruthy();
    screen.unmount();
  });

  it('does not mark the buttons of pages that are not shown', () => {
    const screen = render(
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
    screen.unmount();
  });
});
