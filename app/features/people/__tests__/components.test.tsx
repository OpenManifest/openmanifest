import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderThemed } from 'app/ui/components/testing';
import { jo, personOf, stu } from 'app/__fixtures__/people.fixture';
import PeopleTable from '../PeopleTable';
import PeopleToolbar from '../PeopleToolbar';
import PersonRow from '../PersonRow';
import { NO_FILTER } from '../people';

describe('<PersonRow />', () => {
  it('shows who they are, their role, licence, credit and last load, and opens the profile', async () => {
    const onOpen = jest.fn();
    const { getByTestId, getByText, queryByTestId } = await renderThemed(
      <PersonRow person={jo()} lastLoad="1 Oct 2026" onOpen={onOpen} />
    );

    expect(getByText('Jo Jumper')).toBeTruthy();
    expect(getByText(/Fun Jumper · Certificate A · \$400\.00 · Last .*: 1 Oct 2026/)).toBeTruthy();
    expect(getByText('Ready')).toBeTruthy();
    expect(queryByTestId('people-row-5-reason')).toBeNull();

    await fireEvent.press(getByTestId('people-row-5-open'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: '5' }));
  });

  it('says why someone is blocked', async () => {
    const { getByTestId, getByText } = await renderThemed(
      <PersonRow person={stu()} lastLoad="Never" onOpen={jest.fn()} />
    );

    expect(getByText('Blocked')).toBeTruthy();
    expect(getByTestId('people-row-7-reason').props.children).toBe(
      'Not enough credits to manifest for this jump'
    );
  });

  it('names the rule when the server gives no message, and says what runs out soon', async () => {
    const { getByTestId, getByText } = await renderThemed(
      <PersonRow
        person={personOf('9', 'Exp Iring', {
          rules: [
            {
              __typename: 'EligibilityResult',
              code: 'membership',
              ok: true,
              status: 'EXPIRING',
              message: null,
              problem: null,
              bypassed: false,
              expiresAt: null,
              amountCents: null,
            },
          ],
        })}
        lastLoad="Never"
        onOpen={jest.fn()}
      />
    );

    expect(getByText('Expiring')).toBeTruthy();
    expect(getByTestId('people-row-9-reason').props.children).toBe('membership runs out soon');
  });

  it('offers the actions the viewer may take in the menu of the row', async () => {
    const onOpen = jest.fn();
    const onManifest = jest.fn();
    const onAddCredit = jest.fn();
    const { getByLabelText, getByTestId, findByTestId } = await renderThemed(
      <PersonRow
        person={jo()}
        lastLoad="Today"
        onOpen={onOpen}
        onManifest={onManifest}
        onAddCredit={onAddCredit}
      />
    );

    expect(getByLabelText('Actions for Jo Jumper')).toBe(getByTestId('people-row-5-menu'));
    await fireEvent.press(getByTestId('people-row-5-menu'));
    await fireEvent.press(await findByTestId('people-action-manifest'));
    expect(onManifest).toHaveBeenCalledWith(expect.objectContaining({ id: '5' }));

    await fireEvent.press(getByTestId('people-row-5-menu'));
    await fireEvent.press(await findByTestId('people-action-credit'));
    expect(onAddCredit).toHaveBeenCalledWith(expect.objectContaining({ id: '5' }));

    await fireEvent.press(getByTestId('people-row-5-menu'));
    await fireEvent.press(await findByTestId('people-action-profile'));
    expect(onOpen).toHaveBeenCalled();
  });

  it('leaves out what the viewer may not do', async () => {
    const { getByTestId, findByTestId, queryByTestId } = await renderThemed(
      <PersonRow person={jo()} lastLoad="Today" onOpen={jest.fn()} />
    );

    await fireEvent.press(getByTestId('people-row-5-menu'));
    expect(await findByTestId('people-action-profile')).toBeTruthy();
    expect(queryByTestId('people-action-manifest')).toBeNull();
    expect(queryByTestId('people-action-credit')).toBeNull();
  });
});

describe('<PeopleTable />', () => {
  it('is a table with a header and a row for each person', async () => {
    const onOpen = jest.fn();
    const { getAllByTestId, getAllByText, getByTestId, getByText } = await renderThemed(
      <PeopleTable
        people={[jo(), stu()]}
        lastLoadOf={(person) => (person.id === '5' ? '1 Oct 2026' : 'Never')}
        onOpen={onOpen}
      />
    );

    expect(getByTestId('people-table').props.role).toBe('table');
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Credit')).toBeTruthy();
    expect(getAllByTestId('people-row')).toHaveLength(2);
    expect(getByText('Fun Jumper')).toBeTruthy();
    // Stu's role and licence
    expect(getAllByText('Student')).toHaveLength(2);
    expect(getByTestId('people-row-5-credit').props.children).toBe('$400.00');
    expect(getByTestId('people-row-7-credit').props.children).toBe('-$20.00');
    expect(getByTestId('people-row-5-last').props.children).toBe('1 Oct 2026');
    expect(getByTestId('people-row-7-last').props.children).toBe('Never');
    expect(getByTestId('people-row-7-reason')).toBeTruthy();

    await fireEvent.press(getByTestId('people-row-7-open'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: '7' }));
  });

  it('says when someone has no role or licence', async () => {
    const { getAllByText } = await renderThemed(
      <PeopleTable
        people={[personOf('3', 'New Person', { role: null, licence: null })]}
        lastLoadOf={() => 'Never'}
        onOpen={jest.fn()}
      />
    );

    expect(getAllByText('None')).toHaveLength(2);
  });
});

describe('<PeopleToolbar />', () => {
  const toolbar = (props: Partial<React.ComponentProps<typeof PeopleToolbar>> = {}) => (
    <PeopleToolbar
      search=""
      onSearch={jest.fn()}
      roles={[
        { id: '1', label: 'Fun Jumper' },
        { id: '2', label: 'Student' },
      ]}
      filter={NO_FILTER}
      onFilter={jest.fn()}
      sort="name"
      onSort={jest.fn()}
      {...props}
    />
  );

  it('searches as the person types', async () => {
    const onSearch = jest.fn();
    const { getByTestId } = await renderThemed(toolbar({ onSearch }));

    await fireEvent.changeText(getByTestId('people-search'), 'Jo');
    expect(onSearch).toHaveBeenCalledWith('Jo');
  });

  it('filters by whether people are ready', async () => {
    const onFilter = jest.fn();
    const { getByRole } = await renderThemed(toolbar({ onFilter }));

    await fireEvent.press(getByRole('radio', { name: 'Blocked' }));
    expect(onFilter).toHaveBeenCalledWith({ roleId: null, status: 'blocked' });
  });

  it('filters by role, and back to every role', async () => {
    const onFilter = jest.fn();
    const { getByTestId, findByRole } = await renderThemed(
      toolbar({ onFilter, filter: { roleId: '1', status: 'all' } })
    );

    await fireEvent.press(getByTestId('people-role'));
    await fireEvent.press(await findByRole('option', { name: 'Student' }));
    expect(onFilter).toHaveBeenLastCalledWith({ roleId: '2', status: 'all' });

    await fireEvent.press(getByTestId('people-role'));
    await fireEvent.press(await findByRole('option', { name: 'All roles' }));
    expect(onFilter).toHaveBeenLastCalledWith({ roleId: null, status: 'all' });
  });

  it('says how the people are sorted and changes it from the menu', async () => {
    const onSort = jest.fn();
    const { getByTestId, findByTestId } = await renderThemed(toolbar({ onSort, sort: 'credit' }));

    expect(getByTestId('people-sort')).toBeTruthy();
    await fireEvent.press(getByTestId('people-sort'));
    await fireEvent.press(await findByTestId('people-sort-status'));
    expect(onSort).toHaveBeenCalledWith('status');
  });
});
