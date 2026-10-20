import * as React from 'react';
import { Platform, View, type TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Menu, Segmented, Select, TextField, useTheme } from 'app/ui';
import { SORTS, type PeopleFilter, type PeopleSort, type StatusFilter } from './people';

const STATUSES: StatusFilter[] = ['all', 'ready', 'expiring', 'blocked'];
/** The value of "All roles" in the role select */
const ALL_ROLES = '__all__';
/** The narrowest each control gets side by side: the four statuses need room for their words */
const SEARCH_WIDTH = 240;
const ROLE_WIDTH = 180;
const STATUS_WIDTH = 340;

export type PeopleToolbarProps = {
  search: string;
  onSearch(text: string): void;
  /** The search box, for the "/" shortcut */
  searchRef?: React.Ref<TextInput>;
  roles: { id: string; label: string }[];
  filter: PeopleFilter;
  onFilter(filter: PeopleFilter): void;
  sort: PeopleSort;
  onSort(sort: PeopleSort): void;
  /** Side by side (wide windows), or one under the other */
  wide?: boolean;
  testID?: string;
};

/** Search, the filters (role; ready, expiring or blocked) and the order of the people */
export default function PeopleToolbar({
  search,
  onSearch,
  searchRef,
  roles,
  filter,
  onFilter,
  sort,
  onSort,
  wide = false,
  testID = 'people',
}: PeopleToolbarProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const sortLabel = t('people.sort.by', { sort: t(`people.sort.${sort}`) });

  // Side by side they share the width, and wrap to a second line before a segment gets too narrow to read
  const field = (flex: number, minWidth: number, child: React.ReactNode) => (
    <View style={wide ? { flexGrow: flex, flexBasis: minWidth, minWidth } : undefined}>
      {child}
    </View>
  );

  return (
    <View
      style={{
        flexDirection: wide ? 'row' : 'column',
        flexWrap: wide ? 'wrap' : 'nowrap',
        alignItems: wide ? 'flex-end' : 'stretch',
        gap: theme.space.md,
      }}
    >
      {field(
        3,
        SEARCH_WIDTH,
        <TextField
          label={t('people.search')}
          testID={`${testID}-search`}
          inputRef={searchRef}
          value={search}
          onChange={onSearch}
          placeholder={t(
            Platform.OS === 'web' && wide ? 'people.searchHintWeb' : 'people.searchHint'
          )}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      )}
      {field(
        2,
        ROLE_WIDTH,
        <Select
          label={t('people.role.label')}
          testID={`${testID}-role`}
          value={filter.roleId ?? ALL_ROLES}
          onChange={(value) => onFilter({ ...filter, roleId: value === ALL_ROLES ? null : value })}
          options={[
            { value: ALL_ROLES, label: t('people.role.all') },
            ...roles.map(({ id, label }) => ({ value: id, label })),
          ]}
        />
      )}
      {field(
        3,
        STATUS_WIDTH,
        <Segmented<StatusFilter>
          label={t('people.status.label')}
          testID={`${testID}-status`}
          value={filter.status}
          onChange={(status) => onFilter({ ...filter, status })}
          options={STATUSES.map((value) => ({ value, label: t(`people.status.${value}`) }))}
        />
      )}
      <View style={{ alignSelf: wide ? 'flex-end' : 'flex-start' }}>
        <Menu
          label={t('people.sort.label')}
          trigger={
            <Button variant="tertiary" icon="sort" label={sortLabel} testID={`${testID}-sort`} />
          }
          items={SORTS.map((value) => ({
            label: t(`people.sort.${value}`),
            selected: value === sort,
            testID: `${testID}-sort-${value}`,
            onPress: () => onSort(value),
          }))}
        />
      </View>
    </View>
  );
}
