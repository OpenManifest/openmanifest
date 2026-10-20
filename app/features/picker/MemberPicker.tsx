import * as React from 'react';
import { ScrollView, View } from 'react-native';
import useDebounce from 'react-use/lib/useDebounce';
import { useTranslation } from 'react-i18next';
import {
  Button,
  EmptyState,
  Overlay,
  Segmented,
  Skeleton,
  Text,
  TextField,
  useTheme,
} from 'app/ui';
import { useMemberPickerQuery } from 'app/api/reflection';
import type { LoadDetailsFragment } from 'app/api/operations';
import useManifestValidator from 'app/hooks/useManifestValidator';
import useOpenUser from 'app/navigation/useOpenUser';
import { useOperatorToday } from 'app/hooks/useOperatorToday';
import { useManifestContext, useOperatorContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import { formatMoney } from 'app/i18n/format';
import DefaultsCard from './DefaultsCard';
import MemberPickerRow from './MemberPickerRow';
import {
  creditAfter,
  defaultsOf,
  filterMembers,
  hasDefaults,
  sortReadyFirst,
  type PickerFilter,
  type PickerMember,
} from './members';

export type MemberPickerProps = {
  load: LoadDetailsFragment;
  open: boolean;
  onClose(): void;
  testID?: string;
};

const FILTERS: PickerFilter[] = ['everyone', 'ready', 'today'];
const PAGE = 50;

/**
 * Adds a member to a load in three steps: search, pick (their last slot is filled in), confirm. Whether each member can
 * be added shows before the tap, with the reason and a way to fix it. "Change…" opens the full form.
 */
export default function MemberPicker({ open, ...props }: MemberPickerProps) {
  // Closed, it asks for nothing: the members are fetched when the picker opens
  return open ? <OpenPicker {...props} /> : null;
}

function OpenPicker({ load, onClose, testID = 'member-picker' }: Omit<MemberPickerProps, 'open'>) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const notify = useNotifications();
  const openUser = useOpenUser();
  const today = useOperatorToday();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const {
    manifest: { manifestUser, permissions },
    dialogs,
  } = useManifestContext();

  const [search, setSearch] = React.useState('');
  const [term, setTerm] = React.useState('');
  const [filter, setFilter] = React.useState<PickerFilter>('everyone');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  useDebounce(() => setTerm(search.trim()), 250, [search]);

  const { data, loading } = useMemberPickerQuery({
    variables: {
      operatorId: operator?.id as string,
      loadId: load.id,
      search: term || undefined,
      first: PAGE,
    },
    skip: !operator?.id,
    fetchPolicy: 'cache-and-network',
  });

  const members = React.useMemo(() => {
    const all = (data?.memberships?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is PickerMember => !!node)
      // Someone who may only manifest themselves sees themselves
      .filter((node) => permissions.canManifestOthers || node.id === currentUser?.id);
    const filtered = filterMembers(all, filter, today);
    return filter === 'everyone' ? sortReadyFirst(filtered) : filtered;
  }, [currentUser?.id, data?.memberships?.edges, filter, permissions.canManifestOthers, today]);

  const selected = members.find(({ id }) => id === selectedId) ?? null;
  const defaults = React.useMemo(() => defaultsOf(selected), [selected]);
  const validation = useManifestValidator(
    {
      loadId: load.id,
      membershipId: selected?.id,
      ticketTypeId: defaults.ticketTypeId,
      activityTypeId: defaults.activityTypeId,
      extraIds: defaults.extraIds,
      equipmentIds: defaults.equipmentIds,
      bodyMassKg: defaults.bodyMassKg,
    },
    150
  );

  const loadName = t('common:loadNumber', {
    load: t('terms:load', { count: 1 }),
    number: load.loadNumber,
  });
  const name = selected?.user.nickname || selected?.user.name || '';
  const ready =
    !!selected && hasDefaults(defaults) && validation.canManifest && !validation.loading;
  const credit = creditAfter(selected?.creditsCents, defaults.costCents);

  const change = () => {
    if (!selected) return;
    onClose();
    dialogs.manifestUser.open({ load, slot: { membership: selected } });
  };

  const add = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      const response = await manifestUser({
        load: load.id,
        membership: selected.id,
        ticketType: defaults.ticketTypeId,
        activityType: defaults.activityTypeId,
        destination: defaults.destinationId ?? undefined,
        equipment: defaults.equipmentIds.length ? defaults.equipmentIds : undefined,
        extras: defaults.extraIds.length ? defaults.extraIds : undefined,
        bodyMassKg: defaults.bodyMassKg ?? undefined,
      });
      if ('slot' in response) {
        notify.success(t('common:picker.added', { name, load: loadName }));
        onClose();
      } else {
        notify.error(
          response.error ?? response.fieldErrors?.[0]?.message ?? t('common:board.actions.failed')
        );
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Overlay
      open
      onClose={onClose}
      title={t('common:picker.title', { load: loadName })}
      testID={testID}
      footer={
        <View style={{ gap: theme.space.sm }}>
          <Button
            testID={`${testID}-add`}
            label={t('common:picker.add', {
              name: name || t('common:picker.member'),
              load: loadName,
            })}
            disabled={!ready}
            loading={adding}
            fullWidth
            onPress={add}
          />
          {selected && hasDefaults(defaults) ? (
            <Text
              variant="caption"
              tone={credit.negative ? 'warning' : 'muted'}
              align="center"
              testID={`${testID}-credit`}
            >
              {defaults.costCents
                ? t(credit.negative ? 'common:picker.creditShort' : 'common:picker.creditLeft', {
                    name,
                    price: formatMoney(credit.price),
                    left: formatMoney(Math.abs(credit.left)),
                  })
                : t('common:picker.free')}
            </Text>
          ) : null}
        </View>
      }
    >
      <View style={{ gap: theme.space.md }}>
        <TextField
          label={t('common:picker.search')}
          testID={`${testID}-search`}
          value={search}
          onChange={setSearch}
          placeholder={t('common:picker.searchHint')}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Segmented<PickerFilter>
          label={t('common:picker.filter.label')}
          testID={`${testID}-filter`}
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({ value, label: t(`common:picker.filter.${value}`) }))}
        />
        <ScrollView
          style={{ maxHeight: 520 }}
          contentContainerStyle={{ gap: theme.space.sm }}
          testID={`${testID}-list`}
        >
          {loading && !members.length ? (
            <Skeleton lines={4} />
          ) : members.length ? (
            members.map((member) => (
              <View key={member.id}>
                <MemberPickerRow
                  member={member}
                  selected={member.id === selectedId}
                  onSelect={(picked) => setSelectedId(picked.id === selectedId ? null : picked.id)}
                  onFix={(picked) => {
                    onClose();
                    openUser('ProfileScreen', { userId: picked.id });
                  }}
                />
                {member.id === selectedId ? (
                  <DefaultsCard
                    member={member}
                    defaults={defaults}
                    validation={validation}
                    onChange={change}
                  />
                ) : null}
              </View>
            ))
          ) : (
            <EmptyState icon="account-search-outline" title={t('common:picker.nobody')} />
          )}
        </ScrollView>
      </View>
    </Overlay>
  );
}
