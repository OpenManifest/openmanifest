import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { isBefore } from 'date-fns';

import LoadCrewChips from 'app/components/chips/LoadCrewChips';
import VehicleChip from 'app/components/chips/VehicleChip';
import Chip from 'app/components/chips/Chip';

import { LoadState } from 'app/api/schema.d';
import { useLoadContext, withLoadContext } from 'app/providers/load';
import { StatusBadge, Text, useTheme, type StatusKey } from 'app/ui';
import Countdown from '../Countdown';
import PressableCard from '../../PressableCard';
import Loading from './Loading';

interface ILoadCardSmall {
  onPress(): void;
}

const LOAD_STATES: Record<LoadState, { status: StatusKey; label: string }> = {
  [LoadState.Open]: { status: 'open', label: 'Open' },
  [LoadState.Boarding]: { status: 'boarding', label: 'On call' },
  [LoadState.Cancelled]: { status: 'cancelled', label: 'Cancelled' },
  [LoadState.Departed]: { status: 'departed', label: 'In air' },
  [LoadState.Completed]: { status: 'completed', label: 'Completed' },
};

function LoadCard(props: ILoadCardSmall) {
  const { onPress } = props;
  const theme = useTheme();
  const {
    load: { load, loading, updateVehicle, updateCrew },
  } = useLoadContext();

  if (loading) {
    return <Loading />;
  }

  const state = load?.state ? LOAD_STATES[load.state] : null;
  const title = `Load #${load?.loadNumber || '?'}`;
  return (
    <PressableCard
      testID="load-card"
      label={title}
      onPress={onPress}
      style={{
        margin: theme.space.lg,
        padding: theme.space.lg,
        gap: theme.space.sm,
        minWidth: 280,
        maxWidth: 450,
        opacity: ['cancelled', 'completed'].includes(load?.state || '') ? 0.5 : 1.0,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
        <View style={{ flex: 1, gap: theme.space.xs }}>
          <Text variant="title">{title}</Text>
          {load?.name ? <Text tone="muted">{load.name}</Text> : null}
        </View>
        {!load?.dispatchAt || isBefore(new Date(), load?.dispatchAt) ? null : (
          <Countdown end={new Date(load.dispatchAt * 1000)} />
        )}
        {state ? <StatusBadge status={state.status} label={state.label} /> : null}
      </View>

      <ScrollView horizontal style={{ width: '100%' }}>
        <VehicleChip
          value={load?.vehicle}
          small
          color={theme.colour.text}
          onSelect={async (vehicle) => {
            await updateVehicle(vehicle);
          }}
        />
        <LoadCrewChips color={theme.colour.text} load={load} onSelect={updateCrew} small />
        <Chip small icon="parachute" color={theme.colour.text}>
          {`${load?.occupiedSlots || 0} / ${load?.vehicle?.capacity}`}
        </Chip>
      </ScrollView>
    </PressableCard>
  );
}

export default withLoadContext(LoadCard);
