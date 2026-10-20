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
  Switch,
  Text,
  TextField,
  useTheme,
} from 'app/ui';
import {
  useActivityTypesQuery,
  useDestinationsQuery,
  useMemberPickerQuery,
  useSelfBookingQuery,
  useTicketTypesQuery,
} from 'app/api/reflection';
import type { LoadDetailsFragment } from 'app/api/operations';
import useManifestValidator from 'app/hooks/useManifestValidator';
import useOpenUser from 'app/navigation/useOpenUser';
import { useOperatorToday } from 'app/hooks/useOperatorToday';
import { useManifestContext, useOperatorContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import { formatMoney } from 'app/i18n/format';
import { moduleEnabled } from 'app/utils/modules';
import ChoiceFields from './ChoiceFields';
import DefaultsCard from './DefaultsCard';
import GroupCard from './GroupCard';
import GuestsEditor from './GuestsEditor';
import MemberPickerRow from './MemberPickerRow';
import { nextGroupNumber, resolveDefaults, type SlotChoice, type TicketOption } from './choices';
import { emptyGuest, guestInputs, guestProblem, needsDateOfBirth, type GuestValue } from './guests';
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
  /** `desk` picks anyone of the dropzone; `self` is a member booking themselves: no search, their own defaults, confirm */
  mode?: 'desk' | 'self';
  /** Starts with this member searched for and picked (People's "Manifest on…") */
  member?: { id: string; name: string } | null;
  open: boolean;
  onClose(): void;
  testID?: string;
};

const FILTERS: PickerFilter[] = ['everyone', 'ready', 'today'];

const creditKey = (self: boolean, short: boolean) =>
  self
    ? short
      ? ('common:picker.self.creditShort' as const)
      : ('common:picker.self.creditLeft' as const)
    : short
      ? ('common:picker.creditShort' as const)
      : ('common:picker.creditLeft' as const);

const PAGE = 50;

/**
 * Adds a member to a load in three steps: search, pick (their last slot is filled in), confirm. Whether each member can
 * be added shows before the tap, with the reason and a way to fix it. The ticket and the type of jump can be changed in
 * place; a ticket that takes guests along asks for them. "A group" picks several people for one ticket and one group
 * number. "Change…" opens the full form. In `self` mode the member sees only themselves, already picked.
 */
export default function MemberPicker({ open, ...props }: MemberPickerProps) {
  // Closed, it asks for nothing: the members are fetched when the picker opens
  return open ? <OpenPicker {...props} /> : null;
}

function OpenPicker({
  load,
  mode = 'desk',
  member: initial,
  onClose,
  testID = 'member-picker',
}: Omit<MemberPickerProps, 'open'>) {
  const self = mode === 'self';
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const notify = useNotifications();
  const openUser = useOpenUser();
  const today = useOperatorToday();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const {
    manifest: { manifestUser, manifestGroup, permissions },
    dialogs,
  } = useManifestContext();

  const [search, setSearch] = React.useState(initial?.name ?? '');
  const [term, setTerm] = React.useState(initial?.name.trim() ?? '');
  const [filter, setFilter] = React.useState<PickerFilter>('everyone');
  const [selectedId, setSelectedId] = React.useState<string | null>(initial?.id ?? null);
  const [size, setSize] = React.useState(PAGE);
  const [adding, setAdding] = React.useState(false);
  // What the person changed from the last slot, the guests of an escort, and the people of a group
  const [choice, setChoice] = React.useState<SlotChoice>({});
  const [guests, setGuests] = React.useState<GuestValue[]>([emptyGuest()]);
  const [group, setGroup] = React.useState(false);
  const [people, setPeople] = React.useState<PickerMember[]>([]);
  const [masses, setMasses] = React.useState<Record<string, number | null>>({});
  const [readiness, setReadiness] = React.useState<Record<string, boolean>>({});
  useDebounce(() => setTerm(search.trim()), 250, [search]);

  const { data, loading } = useMemberPickerQuery({
    variables: {
      operatorId: operator?.id as string,
      loadId: load.id,
      search: term || undefined,
      first: size,
    },
    skip: !operator?.id || self,
    fetchPolicy: 'cache-and-network',
  });
  const { data: selfData, loading: loadingSelf } = useSelfBookingQuery({
    variables: { operatorId: operator?.id as string, loadId: load.id },
    skip: !operator?.id || !self,
    fetchPolicy: 'cache-and-network',
  });
  const { data: ticketData } = useTicketTypesQuery({
    variables: { operator: operator?.id as string },
    skip: !operator?.id,
  });
  const tickets = React.useMemo(
    () => (ticketData?.ticketTypes ?? []) as TicketOption[],
    [ticketData?.ticketTypes]
  );

  const perSlotDestinations =
    !!operator?.modules && moduleEnabled(operator.modules, 'destinations');
  const { data: destinationData } = useDestinationsQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id || !perSlotDestinations,
  });
  const destinations = destinationData?.operator?.destinations ?? [];

  const me = (selfData?.operator?.currentUser ?? null) as PickerMember | null;
  const members = React.useMemo(() => {
    if (self) return me ? [me] : [];
    const all = (data?.memberships?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is PickerMember => !!node)
      // Someone who may only manifest themselves sees themselves
      .filter((node) => permissions.canManifestOthers || node.id === currentUser?.id);
    const filtered = filterMembers(all, filter, today);
    return filter === 'everyone' ? sortReadyFirst(filtered) : filtered;
  }, [
    currentUser?.id,
    data?.memberships?.edges,
    filter,
    me,
    permissions.canManifestOthers,
    self,
    today,
  ]);

  // One person: their last slot, and what was changed over it
  const selected = members.find(({ id }) => id === (self ? me?.id : selectedId)) ?? null;
  // A group: the first person's last slot is where the group starts from
  const lead = group ? (people[0] ?? null) : selected;
  const defaults = React.useMemo(
    () => resolveDefaults(defaultsOf(lead), choice, tickets),
    [choice, lead, tickets]
  );
  const ticket = tickets.find(({ id }) => id === defaults.ticketTypeId) ?? null;
  const escorts = !!ticket?.requiresEscort;
  const dateOfBirth = needsDateOfBirth(ticket?.participantLimits);
  const guestsMissing = escorts
    ? guestProblem(guests, ticket?.escortCapacity ?? 1, dateOfBirth)
    : null;

  const { data: activityData } = useActivityTypesQuery({
    variables: { allowedForMembershipIds: !group && selected ? [Number(selected.id)] : undefined },
    skip: !lead,
  });
  const activities = activityData?.activityTypes ?? [];

  const groupNumber = React.useMemo(() => nextGroupNumber(load.slots), [load.slots]);
  const validation = useManifestValidator(
    {
      loadId: load.id,
      membershipId: group ? null : selected?.id,
      ticketTypeId: defaults.ticketTypeId,
      activityTypeId: defaults.activityTypeId,
      extraIds: defaults.extraIds,
      equipmentIds: defaults.equipmentIds,
      bodyMassKg: defaults.bodyMassKg,
      guests: escorts ? guestInputs(guests) : undefined,
    },
    150
  );

  const loadName = t('common:loadNumber', {
    load: t('terms:load', { count: 1 }),
    number: load.loadNumber,
  });
  const name = selected?.user.nickname || selected?.user.name || '';
  // Where the slot goes is needed when each slot has its own destination: the ticket's, or a pick
  const placed = !perSlotDestinations || !!defaults.destinationId;
  const ready =
    !!selected &&
    hasDefaults(defaults) &&
    validation.canManifest &&
    !validation.loading &&
    !guestsMissing &&
    placed;
  const credit = creditAfter(selected?.creditsCents, defaults.costCents);
  const groupReady =
    people.length > 0 &&
    placed &&
    hasDefaults(defaults) &&
    !escorts &&
    people.every(({ id }) => readiness[id]);

  const reset = () => {
    setChoice({});
    setGuests([emptyGuest()]);
  };
  const toggleGroup = (value: boolean) => {
    setGroup(value);
    setSelectedId(null);
    setPeople([]);
    reset();
  };
  const select = (picked: PickerMember) => {
    if (group) {
      setPeople((current) =>
        current.some(({ id }) => id === picked.id)
          ? current.filter(({ id }) => id !== picked.id)
          : [...current, picked]
      );
      return;
    }
    reset();
    setSelectedId(picked.id === selectedId ? null : picked.id);
  };
  const setReady = React.useCallback((id: string, value: boolean | null) => {
    setReadiness((current) => {
      if (value === null) {
        const { [id]: _gone, ...rest } = current;
        return rest;
      }
      return current[id] === value ? current : { ...current, [id]: value };
    });
  }, []);

  const change = () => {
    if (!selected) return;
    onClose();
    dialogs.manifestUser.open({ load, slot: { membership: selected } });
  };

  const fail = (response: { error?: string; fieldErrors?: { message: string }[] }) =>
    notify.error(
      response.error ?? response.fieldErrors?.[0]?.message ?? t('common:board.actions.failed')
    );

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
        guests: escorts ? guestInputs(guests) : undefined,
      });
      if ('slot' in response) {
        notify.success(
          self
            ? t('common:picker.self.added', { load: loadName })
            : t('common:picker.added', { name, load: loadName })
        );
        onClose();
      } else fail(response);
    } finally {
      setAdding(false);
    }
  };

  const addGroup = async () => {
    setAdding(true);
    try {
      const response = await manifestGroup({
        load: load.id,
        ticketType: defaults.ticketTypeId,
        activityType: defaults.activityTypeId,
        groupNumber,
        userGroup: people.map((person) => {
          const personal = defaultsOf(person);
          return {
            id: Number(person.id),
            bodyMassKg: (masses[person.id] ?? personal.bodyMassKg) as number,
            equipment: personal.equipmentIds.length ? personal.equipmentIds : undefined,
          };
        }),
      });
      if ('load' in response) {
        notify.success(t('common:picker.groupAdded', { count: people.length, load: loadName }));
        onClose();
      } else fail(response);
    } finally {
      setAdding(false);
    }
  };

  const choices = lead ? (
    <ChoiceFields
      tickets={tickets}
      activities={activities}
      destinations={destinations}
      ticketTypeId={defaults.ticketTypeId}
      activityTypeId={defaults.activityTypeId}
      destinationId={defaults.destinationId}
      onChange={(next) => setChoice((current) => ({ ...current, ...next }))}
    />
  ) : null;

  return (
    <Overlay
      open
      onClose={onClose}
      title={t(self ? 'common:picker.self.title' : 'common:picker.title', { load: loadName })}
      testID={testID}
      footer={
        <View style={{ gap: theme.space.sm }}>
          {group ? (
            <Button
              testID={`${testID}-add`}
              label={t('common:picker.addGroup', { count: people.length, load: loadName })}
              disabled={!groupReady}
              loading={adding}
              fullWidth
              onPress={addGroup}
            />
          ) : (
            <Button
              testID={`${testID}-add`}
              label={
                self
                  ? t('common:picker.self.add', { load: loadName })
                  : t('common:picker.add', {
                      name: name || t('common:picker.member'),
                      load: loadName,
                    })
              }
              disabled={!ready}
              loading={adding}
              fullWidth
              onPress={add}
            />
          )}
          {!group && selected && hasDefaults(defaults) ? (
            <Text
              variant="caption"
              tone={credit.negative ? 'warning' : 'muted'}
              align="center"
              testID={`${testID}-credit`}
            >
              {defaults.costCents
                ? t(creditKey(self, credit.negative), {
                    name,
                    price: formatMoney(credit.price),
                    left: formatMoney(Math.abs(credit.left)),
                  })
                : t('common:picker.free')}
            </Text>
          ) : null}
          {group && escorts ? (
            <Text variant="caption" tone="muted" align="center" testID={`${testID}-group-escort`}>
              {t('common:picker.group.escort')}
            </Text>
          ) : null}
        </View>
      }
    >
      <View style={{ gap: theme.space.md }}>
        {self ? null : (
          <>
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
              options={FILTERS.map((value) => ({
                value,
                label: t(`common:picker.filter.${value}`),
              }))}
            />
            {permissions.canManifestOthers ? (
              <Switch
                label={t('common:picker.group.switch')}
                value={group}
                onChange={toggleGroup}
                testID={`${testID}-group`}
              />
            ) : null}
          </>
        )}
        {group && people.length ? (
          <GroupCard
            loadId={load.id}
            members={people}
            ticketTypeId={defaults.ticketTypeId}
            activityTypeId={defaults.activityTypeId}
            groupNumber={groupNumber}
            choices={choices}
            masses={masses}
            onMass={(id, value) => setMasses((current) => ({ ...current, [id]: value }))}
            onRemove={(id) => setPeople((current) => current.filter((person) => person.id !== id))}
            onReady={setReady}
          />
        ) : null}
        <ScrollView
          style={{ maxHeight: 520 }}
          contentContainerStyle={{ gap: theme.space.sm }}
          testID={`${testID}-list`}
        >
          {(self ? loadingSelf : loading) && !members.length ? (
            <Skeleton lines={4} />
          ) : members.length ? (
            members.map((member) => (
              <View key={member.id}>
                <MemberPickerRow
                  member={member}
                  selected={
                    self ||
                    (group ? people.some(({ id }) => id === member.id) : member.id === selectedId)
                  }
                  onSelect={self ? () => undefined : select}
                  onFix={(picked) => {
                    onClose();
                    openUser('ProfileScreen', { userId: picked.id });
                  }}
                />
                {!group && member.id === (self ? me?.id : selectedId) ? (
                  <>
                    <DefaultsCard
                      member={member}
                      defaults={defaults}
                      validation={validation}
                      choices={choices}
                      ticketChanged={defaults.ticketTypeId !== defaultsOf(member).ticketTypeId}
                      onChange={change}
                    />
                    {escorts ? (
                      <GuestsEditor
                        escort={member.user.nickname || member.user.name || ''}
                        guests={guests}
                        capacity={ticket?.escortCapacity ?? 1}
                        dateOfBirth={dateOfBirth}
                        onChange={setGuests}
                      />
                    ) : null}
                  </>
                ) : null}
              </View>
            ))
          ) : (
            <EmptyState icon="account-search-outline" title={t('common:picker.nobody')} />
          )}
          {!self && data?.memberships?.pageInfo?.hasNextPage ? (
            <Button
              variant="tertiary"
              testID={`${testID}-more`}
              label={t('common:picker.more')}
              onPress={() => setSize((current) => current + PAGE)}
            />
          ) : null}
        </ScrollView>
      </View>
    </Overlay>
  );
}
