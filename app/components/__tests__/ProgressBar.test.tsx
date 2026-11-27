import * as React from 'react';
import { renderWithProviders } from 'app/test-utils/render';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('is named "Loading" unless it is given a name', async () => {
    const screen = await renderWithProviders(
      <>
        <ProgressBar indeterminate visible />
        <ProgressBar indeterminate visible accessibilityLabel="Saving" />
      </>
    );

    expect(screen.getByLabelText('Loading')).toBeTruthy();
    expect(screen.getByLabelText('Saving')).toBeTruthy();
  });
});
