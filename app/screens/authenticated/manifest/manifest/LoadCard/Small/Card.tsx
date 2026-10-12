import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Badge, Card, Chip } from 'react-native-paper';
import { isBefore } from 'date-fns';

import LoadCrewChips from 'app/components/chips/LoadCrewChips';
import VehicleChip from 'app/components/chips/VehicleChip';

import { LoadState } from 'app/api/schema.d';
import { errorColor, warningColor } from 'app/constants/Colors';
import { useLoadContext, withLoadContext } from 'app/providers/load';
import Countdown from '../Countdown';
import Loading from './Loading';
import { useAppTheme } from 'app/theme';

interface ILoadCardSmall {
  onPress(): void;
}

function LoadCard(props: ILoadCardSmall) {
  const { onPress } = props;
  const { theme, palette } = useAppTheme();
  const {
    load: { load, loading, updateVehicle, updateCrew },
  } = useLoadContext();
  const LOAD_BADGE_COLOR: { [K in LoadState]?: string } = React.useMemo(
    () => ({
      open: palette.accent.main,
      cancelled: errorColor,
      boarding: warningColor,
    }),
    [palette.accent.main]
  );

  if (loading) {
    return <Loading />;
  }

  const loadStates = {
    [LoadState.Open]: 'Open',
    [LoadState.Boarding]: 'On call',
    [LoadState.Cancelled]: 'Cancelled',
    [LoadState.Departed]: 'In air',
    [LoadState.Completed]: 'Completed',
  };
  return (
    <Card
      testID="load-card"
      style={{
        margin: 16,
        borderRadius: 8,
        minWidth: 280,
        maxWidth: 450,
        opacity: ['cancelled', 'completed'].includes(load?.state || '') ? 0.5 : 1.0,
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
          // Grows with the text size instead of clipping the label to Paper's fixed 20 dp pill
          height: 'auto',
          minHeight: 20,
          lineHeight: undefined,
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
        <ScrollView
          style={{
            flexDirection: 'row',
            flexWrap: 'nowrap',
            backgroundColor: 'transparent',
            width: '100%',
          }}
          horizontal
        >
          <VehicleChip
            value={load?.vehicle}
            small
            color={theme.colors.onSurface}
            onSelect={async (vehicle) => {
              await updateVehicle(vehicle);
            }}
          />
          <LoadCrewChips color={theme.colors.onSurface} load={load} onSelect={updateCrew} small />
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
            {load?.occupiedSlots || 0} / {load?.vehicle?.capacity}
          </Chip>
        </ScrollView>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    marginVertical: 8,
    overflow: 'hidden',
    maxWidth: 450,
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
