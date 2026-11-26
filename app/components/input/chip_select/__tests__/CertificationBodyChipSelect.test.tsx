import * as React from 'react';
import { View } from 'react-native';
import type { CertificationBodyEssentialsFragment } from 'app/api/operations';
import { fireEvent, render, waitFor, within } from '../../../../__mocks__/render';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import MOCK_QUERY_CERTIFICATION_BODIES from 'app/__tests__/manifest/__mocks__/QueryCertificationBodies.mock';
import CertificationBodyChipSelect from '../CertificationBodyChipSelect';

const apf = {
  __typename: 'CertificationBody',
  id: '1',
  name: 'APF',
  slug: 'apf',
  industry: 'skydiving',
  verificationProvider: 'apf',
} as CertificationBodyEssentialsFragment;
const uspa = { ...apf, id: '2', name: 'USPA', slug: 'uspa', verificationProvider: null };
const padi = {
  ...apf,
  id: '3',
  name: 'PADI',
  slug: 'padi',
  industry: 'scuba',
  verificationProvider: null,
};

async function renderSelect(
  props: Partial<React.ComponentProps<typeof CertificationBodyChipSelect>>
) {
  const screen = await render(
    <View testID="under-test">
      <CertificationBodyChipSelect value={[]} onChange={jest.fn()} {...props} />
    </View>,
    {
      session: authenticatedSession,
      graphql: [MOCK_QUERY_CERTIFICATION_BODIES({}, { certificationBodies: [apf, uspa, padi] })],
    }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<CertificationBodyChipSelect />', () => {
  it('offers every body, and adds one to those already chosen', async () => {
    const onChange = jest.fn();
    const select = await renderSelect({ value: [apf], onChange });

    await waitFor(() => expect(select.getByText('USPA')).toBeTruthy());
    await fireEvent.press(select.getByText('USPA'));

    expect(onChange).toHaveBeenCalledWith([apf, uspa]);
  });

  it('takes one away when it is pressed again', async () => {
    const onChange = jest.fn();
    const select = await renderSelect({ value: [apf, uspa], onChange });

    await waitFor(() => expect(select.getByText('USPA')).toBeTruthy());
    await fireEvent.press(select.getByText('USPA'));

    expect(onChange).toHaveBeenCalledWith([apf]);
  });

  it("offers only the bodies of the operator's industry", async () => {
    const select = await renderSelect({ industry: 'skydiving' });

    await waitFor(() => expect(select.getByText('APF')).toBeTruthy());
    expect(select.getByText('USPA')).toBeTruthy();
    expect(select.queryByText('PADI')).toBeNull();
  });
});
