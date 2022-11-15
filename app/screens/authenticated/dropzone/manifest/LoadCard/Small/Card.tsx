import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, Card, Chip } from 'react-native-paper';
import { isBefore } from 'date-fns';

import PilotChip from 'app/components/chips/PilotChip';
import PlaneChip from 'app/components/chips/PlaneChip';

import { View } from 'app/components/Themed';
import { LoadState } from 'app/api/schema.d';
import { useAppSelector } from 'app/state';
import { errorColor, warningColor } from 'app/constants/Colors';
import { useLoadContext, withLoadContext } from 'app/providers/load';
import Countdown from '../Countdown';
import Loading from './Loading';

interface ILoadCardSmall {
  onPress(): void;
}

function LoadCard(props: ILoadCardSmall) {
  const { onPress } = props;
  const { theme, palette } = useAppSelector((root) => root.global);
  const {
    load: { load, loading, updatePlane, updatePilot },
  } = useLoadContext();
  const LOAD_BADGE_COLOR: { [K in LoadState]?: string } = React.useMemo(
    () => ({
      open: palette.accent.main,
      cancelled: errorColor,
      boarding_call: warningColor,
    }),
    [palette.accent.main]
  );

  if (loading) {
    return <Loading />;
  }

  const loadStates = {
    [LoadState.Open]: 'Open',
    [LoadState.BoardingCall]: 'On call',
    [LoadState.Cancelled]: 'Cancelled',
    [LoadState.InFlight]: 'In air',
    [LoadState.Landed]: 'Landed',
  };
  return (
    <Card
      testID="load-card"
      style={{
        margin: 16,
        borderRadius: 8,
        minWidth: 300,
        opacity: ['cancelled', 'landed'].includes(load?.state || '') ? 0.5 : 1.0,
      }}
      elevation={1}
      onPress={onPress}
    >
      <Badge
        style={{
          backgroundColor: load?.state ? LOAD_BADGE_COLOR[load.state] : undefined,
          marginTop: -5,
          marginRight: -5,
          color: 'white',
          fontSize: 12,
        }}
      >
        {load?.state ? loadStates[load?.state] : ''}
      </Badge>
      <Card.Title
        style={{ justifyContent: 'space-between' }}
        title={`Load #${load?.loadNumber || '?'}`}
        subtitle={load?.name}
        right={() =>
          !load?.dispatchAt || isBefore(new Date(), load?.dispatchAt) ? null : (
            <View style={{ marginRight: 16 }}>
              <Countdown end={new Date(load.dispatchAt * 1000)} />
            </View>
          )
        }
      />

      <Card.Content style={styles.cardContent}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'nowrap',
            backgroundColor: 'transparent',
            width: '100%',
          }}
        >
          <PlaneChip
            value={load?.plane}
            small
            color={theme.colors.onSurface}
            onSelect={async (plane) => {
              await updatePlane(plane);
            }}
          />
          <PilotChip
            color={theme.colors.onSurface}
            value={load?.pilot}
            onSelect={updatePilot}
            small
          />
          <Chip
            mode="outlined"
            icon="parachute"
            style={{
              marginHorizontal: 4,
              backgroundColor: 'transparent',
              height: 25,
              alignItems: 'center',
              borderColor: theme.colors.onSurface,
            }}
            textStyle={{ color: theme.colors.onSurface, fontSize: 12, marginTop: 0 }}
          >
            {load?.occupiedSlots || 0} / {load?.plane?.maxSlots}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    marginVertical: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  smallChip: {
    height: 25,
    margin: 4,
    alignItems: 'center',
  },
  smallChipText: { fontSize: 12 },
});

export default withLoadContext(LoadCard);
