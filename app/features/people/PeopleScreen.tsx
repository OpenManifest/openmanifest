import * as React from 'react';
import { RefreshControl, ScrollView, View, type TextInput } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import useDebounce from 'react-use/lib/useDebounce';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Skeleton, Text, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import { usePeopleQuery, useRolesQuery } from 'app/api/reflection';
import type { LoadDetailsFragment, MembershipDetailsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorToday } from 'app/hooks/useOperatorToday';
import useOpenUser from 'app/navigation/useOpenUser';
import { useManifestContext, useOperatorContext } from 'app/providers';
import MemberPicker from 'app/features/picker/MemberPicker';
import ManifestOnSheet from './ManifestOnSheet';
import PeopleTable from './PeopleTable';
import PeopleToolbar from './PeopleToolbar';
import PersonRow from './PersonRow';
import { useLastLoad } from './PersonParts';
import {
  filterPeople,
  nameOf,
  NO_FILTER,
  peopleOf,
  roleOptions,
  sortPeople,
  type PeopleFilter,
  type PeopleSort,
  type Person,
} from './people';
import useSearchShortcut from './useSearchShortcut';

const PAGE = 50;

export type UserListRoute = {
  UserListScreen: undefined;
};

/**
 * The people of the operator: search ("/" on the web), filter by role and by whether they are ready, sort, and act on
 * one (open, "Manifest on…", "Add credit") from the menu of their row. A table on wide windows, rows elsewhere. Staff
 * who may add people add a walk-in member with the short form.
 */
export default function PeopleScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const navigation = useNavigation();
  const openUser = useOpenUser();
  const isFocused = useIsFocused();
  const breakpoint = useBreakpoint();
  const today = useOperatorToday();
  const {
    operator: { operator },
    dialogs: operatorDialogs,
  } = useOperatorContext();
  const {
    manifest: { loads },
    dialogs,
  } = useManifestContext();
  const canCreateUser = useRestriction(Permission.CreateUser);
  const canManifest = useRestriction(Permission.CreateUserSlot);
  const canAddCredit = useRestriction(Permission.CreateUserTransaction);

  const [search, setSearch] = React.useState('');
  const [term, setTerm] = React.useState('');
  const [filter, setFilter] = React.useState<PeopleFilter>(NO_FILTER);
  const [sort, setSort] = React.useState<PeopleSort>('name');
  const [size, setSize] = React.useState(PAGE);
  const [placing, setPlacing] = React.useState<Person | null>(null);
  const [picking, setPicking] = React.useState<{ person: Person; loadId: string } | null>(null);
  const searchRef = React.useRef<TextInput>(null);
  useDebounce(() => setTerm(search.trim()), 250, [search]);
  useSearchShortcut(searchRef, isFocused);

  const { data, loading, refetch } = usePeopleQuery({
    variables: { operatorId: operator?.id as string, search: term || undefined, first: size },
    skip: !operator?.id,
    fetchPolicy: 'cache-and-network',
  });
  const { data: roleData } = useRolesQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });

  const everyone = React.useMemo(() => peopleOf(data), [data]);
  const people = React.useMemo(
    () => sortPeople(filterPeople(everyone, filter), sort),
    [everyone, filter, sort]
  );
  const roles = React.useMemo(
    () => roleOptions(roleData?.operator?.roles, everyone),
    [everyone, roleData?.operator?.roles]
  );
  const lastLoadOf = useLastLoad(today, operator?.timeZone);
  const waiting = !operator || (loading && !data);
  const filtered = filter.roleId !== null || filter.status !== 'all';
  const table = breakpoint === 'expanded';
  // The load as the manifest has it now (places fill while the picker is open)
  const pickedLoad = picking
    ? (loads.find((load): load is LoadDetailsFragment => load?.id === picking.loadId) ?? null)
    : null;

  const actions = {
    onOpen: (person: Person) => openUser('ProfileScreen', { userId: person.id }),
    onManifest: canManifest ? setPlacing : undefined,
    onAddCredit: canAddCredit
      ? (person: Person) =>
          dialogs.credits.open({ membership: person as unknown as MembershipDetailsFragment })
      : undefined,
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="people"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
          <View style={{ flex: 1 }}>
            <Text variant="title" role="heading" aria-level={2} testID="people-count">
              {waiting ? '' : t('people.count', { count: people.length })}
            </Text>
          </View>
          {canCreateUser ? (
            <Button
              icon="account-plus"
              label={t('people.add')}
              testID="people-add-primary-action"
              onPress={() => operatorDialogs.createUser.open()}
            />
          ) : null}
        </View>
        <PeopleToolbar
          search={search}
          onSearch={setSearch}
          searchRef={searchRef}
          roles={roles}
          filter={filter}
          onFilter={setFilter}
          sort={sort}
          onSort={setSort}
          wide={breakpoint !== 'compact'}
        />
        {waiting ? (
          <View style={{ gap: theme.space.md }} testID="people-loading">
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </View>
        ) : !people.length ? (
          <EmptyState
            testID="people-empty"
            icon="account-search-outline"
            title={t('people.empty.title')}
            body={t('people.empty.body')}
            action={
              filtered
                ? { label: t('people.empty.clear'), onPress: () => setFilter(NO_FILTER) }
                : undefined
            }
          />
        ) : table ? (
          <PeopleTable people={people} lastLoadOf={lastLoadOf} {...actions} />
        ) : (
          <View
            testID="people-list"
            style={{
              backgroundColor: theme.colour.surface,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colour.border,
              paddingVertical: theme.space.xs,
            }}
          >
            {people.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                lastLoad={lastLoadOf(person)}
                {...actions}
              />
            ))}
          </View>
        )}
        {data?.memberships?.pageInfo?.hasNextPage ? (
          <Button
            variant="tertiary"
            testID="people-more"
            label={t('people.more')}
            loading={loading}
            onPress={() => setSize((current) => current + PAGE)}
          />
        ) : null}
      </ScrollView>

      <ManifestOnSheet
        open={!!placing}
        name={placing ? nameOf(placing) : ''}
        loads={loads}
        onClose={() => setPlacing(null)}
        onPick={(load) => {
          if (placing) setPicking({ person: placing, loadId: load.id });
          setPlacing(null);
        }}
        onBoard={() => {
          setPlacing(null);
          navigation.navigate('Authenticated', { screen: 'Manifest' } as never);
        }}
      />
      {picking && pickedLoad ? (
        <MemberPicker
          open
          load={pickedLoad}
          member={{ id: picking.person.id, name: picking.person.user.name ?? '' }}
          onClose={() => setPicking(null)}
          testID="people-picker"
        />
      ) : null}
    </ScreenContainer>
  );
}
