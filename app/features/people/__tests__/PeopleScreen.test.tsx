import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { jo, stu } from 'app/__fixtures__/people.fixture';
import MOCK_QUERY_LOADS from 'app/__tests__/manifest/__mocks__/QueryLoads.mock';
import MOCK_QUERY_ROLES from 'app/__tests__/manifest/__mocks__/QueryRoles.mock';
import createMockedQuery from 'app/__tests__/manifest/__mocks__/createMockedQuery.mock';
import { PeopleDocument } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import PeopleScreen from '../PeopleScreen';

jest.setTimeout(30000);

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => true,
}));

const people = (nodes: unknown[], hasNextPage = false) =>
  createMockedQuery(PeopleDocument, { operatorId: '1', first: 50 }, {
    memberships: {
      __typename: 'MembershipConnection',
      edges: nodes.map((node, index) => ({
        __typename: 'MembershipEdge',
        cursor: `c${index}`,
        node,
      })),
      pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: null },
    },
  } as never);

async function renderPeople(permissions: Permission[] = [], hasNextPage = false) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const mock = people([jo(), stu()], hasNextPage);
  return render(<PeopleScreen />, {
    session: authenticatedSession,
    permissions,
    graphql: [mock(), mock(), MOCK_QUERY_ROLES(), MOCK_QUERY_LOADS()] as never,
  });
}

describe('<PeopleScreen />', () => {
  beforeEach(() => mockNavigate.mockClear());
  afterEach(() => jest.restoreAllMocks());

  it('lists the people with how many there are, and opens a profile', async () => {
    const screen = await renderPeople();

    await waitFor(() => expect(screen.getAllByTestId('people-row')).toHaveLength(2), {
      timeout: 10000,
    });
    expect(screen.getByTestId('people-count').props.children).toBe('2 people');
    await fireEvent.press(screen.getByTestId('people-row-5-open'));

    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Users',
      params: { screen: 'ProfileScreen', params: { userId: '5' }, initial: false },
    });
  });

  it('narrows the list to those who are blocked, and clears the filter when nobody is left', async () => {
    const screen = await renderPeople();
    await waitFor(() => expect(screen.getAllByTestId('people-row')).toHaveLength(2), {
      timeout: 10000,
    });

    await fireEvent.press(screen.getByRole('radio', { name: 'Blocked' }));
    expect(screen.getAllByTestId('people-row')).toHaveLength(1);
    expect(screen.getByText('Stu Student')).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'Expiring' }));
    expect(screen.getByTestId('people-empty')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Clear the filters' }));
    expect(screen.getAllByTestId('people-row')).toHaveLength(2);
  });

  it('gives staff the walk-in form and the actions on a person', async () => {
    const screen = await renderPeople([
      Permission.ReadUser,
      Permission.CreateUser,
      Permission.CreateUserSlot,
      Permission.CreateUserTransaction,
    ]);
    await waitFor(() => expect(screen.getByTestId('people-add-primary-action')).toBeTruthy(), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByTestId('people-row')).toHaveLength(2));

    await fireEvent.press(screen.getByTestId('people-row-5-menu'));
    expect(await screen.findByTestId('people-action-manifest')).toBeTruthy();
    expect(screen.getByTestId('people-action-credit')).toBeTruthy();

    // "Manifest on…" lists the open loads of the day
    await fireEvent.press(screen.getByTestId('people-action-manifest'));
    await waitFor(() => expect(screen.getByText('Manifest Jo Jumper on…')).toBeTruthy());
    await waitFor(() => expect(screen.getByTestId('people-manifest-on-1')).toBeTruthy());
    expect(screen.getByText('Load #2')).toBeTruthy();
  });

  it('keeps the walk-in form and the staff actions from those who may not use them', async () => {
    const screen = await renderPeople([Permission.ReadUser]);
    await waitFor(() => expect(screen.getAllByTestId('people-row')).toHaveLength(2), {
      timeout: 10000,
    });

    expect(screen.queryByTestId('people-add-primary-action')).toBeNull();
    await fireEvent.press(screen.getByTestId('people-row-5-menu'));
    expect(await screen.findByTestId('people-action-profile')).toBeTruthy();
    expect(screen.queryByTestId('people-action-manifest')).toBeNull();
    expect(screen.queryByTestId('people-action-credit')).toBeNull();
  });

  it('offers more people when there are more', async () => {
    const screen = await renderPeople([], true);

    await waitFor(() => expect(screen.getByTestId('people-more')).toBeTruthy(), {
      timeout: 10000,
    });
  });
});
