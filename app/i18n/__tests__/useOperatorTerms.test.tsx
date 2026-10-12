import * as React from 'react';
import { Text } from 'react-native';
import { act, waitFor } from '@testing-library/react-native';
import { render } from '../../__mocks__/render';
import MOCK_QUERY_OPERATOR from '../../__tests__/manifest/__mocks__/QueryOperator.mock';
import { authenticatedSession } from '../../__fixtures__/session.fixture';
import { applyTerms } from '../index';
import { industryOverride } from '../useOperatorTerms';
import useTerms from '../useTerms';
import skydiving from '../fixtures/skydiving.json';

function Probe() {
  const term = useTerms();

  return (
    <>
      <Text testID="operator">{term('operator')}</Text>
      <Text testID="members">{term('member', 2)}</Text>
    </>
  );
}

afterEach(() => act(() => applyTerms(null)));

describe('useOperatorTerms', () => {
  it('shows the generic words when logged out', () => {
    const screen = render(<Probe />, { graphql: [] });

    expect(screen.getByTestId('operator').props.children).toBe('Operator');
    expect(screen.getByTestId('members').props.children).toBe('Customers');
    screen.unmount();
  });

  it('shows the words of a template fixture passed to render', () => {
    const screen = render(<Probe />, { graphql: [], industry: 'skydiving' });

    expect(screen.getByTestId('operator').props.children).toBe('Dropzone');
    expect(screen.getByTestId('members').props.children).toBe('Jumpers');
    screen.unmount();
  });

  it('takes the terms from the current operator', async () => {
    const operator = MOCK_QUERY_OPERATOR({}, { operator: { terminology: skydiving as never } });
    const screen = render(<Probe />, { graphql: [operator], session: authenticatedSession });

    await waitFor(() => expect(screen.getByTestId('operator').props.children).toBe('Dropzone'));
    expect(screen.getByTestId('members').props.children).toBe('Jumpers');
    screen.unmount();
  });
});

describe('industryOverride', () => {
  it('reads ?industry=<slug> outside production', () => {
    expect(industryOverride('?industry=skydiving', 'staging')).toEqual(skydiving);
    expect(industryOverride('?x=1&industry=generic', 'local')).toBeTruthy();
  });

  it('is off in production, without the parameter and for an unknown template', () => {
    expect(industryOverride('?industry=skydiving', 'production')).toBeNull();
    expect(industryOverride('', 'staging')).toBeNull();
    expect(industryOverride(undefined, 'staging')).toBeNull();
    expect(industryOverride('?industry=nope', 'staging')).toBeNull();
  });
});
