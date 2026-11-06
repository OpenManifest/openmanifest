import * as React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { LoadState } from 'app/api/schema.d';
import { renderThemed } from 'app/ui/components/testing';
import ConditionsStrip from '../ConditionsStrip';
import CrewChip from '../CrewChip';
import DestinationLabel from '../DestinationLabel';
import LoadCard from '../LoadCard';
import PlacesMeter from '../PlacesMeter';
import { vehicleGlyph } from '../vehicleGlyph';
import { isOver, statusOf } from '../loadStatus';
import {
  guideRole,
  loadVehicle,
  makeLoad,
  membership,
  pilotRole,
  caravan,
} from 'app/__fixtures__/board.fixture';

describe('vehicleGlyph', () => {
  it('maps a kind to its glyph, and an unknown kind to a car', () => {
    expect(vehicleGlyph('aircraft')).toBe('airplane');
    expect(vehicleGlyph('tug')).toBe('airplane-takeoff');
    expect(vehicleGlyph('raft')).toBe('rowing');
    expect(vehicleGlyph('hovercraft')).toBe('car');
    expect(vehicleGlyph(null)).toBe('car');
  });
});

describe('loadStatus', () => {
  it('maps the states to status tokens and tells the loads that are over', () => {
    expect(statusOf(LoadState.Completed)).toBe('landed');
    expect(statusOf(LoadState.Boarding)).toBe('boarding');
    expect(statusOf(undefined)).toBe('open');
    expect(isOver(LoadState.Cancelled)).toBe(true);
    expect(isOver(LoadState.Departed)).toBe(false);
  });
});

describe('<PlacesMeter />', () => {
  it('says how many places are taken, in the operator’s word', async () => {
    const { getByRole } = await renderThemed(<PlacesMeter load={makeLoad()} />);

    const meter = getByRole('progressbar');
    expect(meter.props['aria-valuetext']).toBe('5 of 16 slots');
    expect(meter.props['aria-label']).toBe('Slots filled');
  });

  it('turns red when the load is full', async () => {
    const load = makeLoad({ vehicles: [loadVehicle('a', caravan, 16)] });
    const { getByTestId } = await renderThemed(<PlacesMeter load={load} testID="meter" />);

    expect(getByTestId('meter').props['aria-valuenow']).toBe(16);
  });
});

describe('<CrewChip />', () => {
  it('names the person who fills the role', async () => {
    const { getByLabelText } = await renderThemed(
      <CrewChip role={pilotRole} member={membership('Pat Jones', 'Pat')} />
    );

    expect(getByLabelText('Pilot: Pat')).toBeTruthy();
  });

  it('flags a required role nobody fills, and keeps an optional one quiet', async () => {
    const { getByLabelText } = await renderThemed(
      <>
        <CrewChip role={pilotRole} />
        <CrewChip role={guideRole} />
      </>
    );

    expect(getByLabelText('Pilot needed')).toBeTruthy();
    expect(getByLabelText('No Guide')).toBeTruthy();
  });
});

describe('<DestinationLabel />', () => {
  it('joins the destinations of the load', async () => {
    const { getByText } = await renderThemed(
      <DestinationLabel
        destinations={
          [
            { id: '1', kind: 'site', name: 'Reef 2' },
            { id: '2', kind: 'site', name: 'Wreck' },
          ] as any
        }
      />
    );

    expect(getByText('Reef 2 · Wreck')).toBeTruthy();
  });

  it('shows nothing for a load without one', async () => {
    const { toJSON } = await renderThemed(<DestinationLabel destinations={[]} />);
    expect(toJSON()).toBeNull();
  });
});

describe('<ConditionsStrip />', () => {
  const conditions = {
    jumpRun: 270.4,
    temperatureC: 21,
    winds: [
      { altitudeM: 1000, speedMps: 5, direction: 200, temperatureC: 10 },
      { altitudeM: 4000, speedMps: 12, direction: 245, temperatureC: -5 },
    ],
  } as any;

  it('reads the wind at the highest altitude, the heading and the ground temperature', async () => {
    const { getByText } = await renderThemed(<ConditionsStrip conditions={conditions} />);

    expect(getByText(/Wind .* from 245° at .*Heading 270°.*Ground 21/)).toBeTruthy();
  });

  it('says so when there are no conditions, and offers no Update to someone who may not', async () => {
    const { getByText, queryByText } = await renderThemed(<ConditionsStrip conditions={null} />);

    expect(getByText('No conditions yet')).toBeTruthy();
    expect(queryByText('Update')).toBeNull();
  });

  it('offers Update to someone who may', async () => {
    const onUpdate = jest.fn();
    const { getByText } = await renderThemed(
      <ConditionsStrip conditions={null} onUpdate={onUpdate} />
    );

    await fireEvent.press(getByText('Update'));

    expect(onUpdate).toHaveBeenCalled();
  });
});

describe('<LoadCard />', () => {
  it('shows the number, the state, the vehicles, the places and who is on the crew', async () => {
    const load = makeLoad({
      name: 'Sunset',
      destinations: [{ id: '1', kind: 'site', name: 'Reef 2' }],
      crew: [
        {
          id: 'c1',
          crewRole: pilotRole,
          membership: membership('Pat Jones', 'Pat'),
          loadVehicle: { id: 'lv1' },
        },
      ],
    });
    const { getByText, getByTestId, getByLabelText } = await renderThemed(
      <LoadCard load={load} crewRoles={[pilotRole, guideRole]} />
    );

    expect(getByText('Load #3')).toBeTruthy();
    expect(getByText('Sunset')).toBeTruthy();
    expect(getByTestId('load-card-state')).toBeTruthy();
    expect(getByText('Caravan')).toBeTruthy();
    expect(getByText('Reef 2')).toBeTruthy();
    expect(getByTestId('load-card-places').props['aria-valuetext']).toBe('5 of 15 slots');
    expect(getByLabelText('Pilot: Pat')).toBeTruthy();
    expect(getByLabelText('No Guide')).toBeTruthy();
  });

  it('shows the call countdown as its largest numeral while the load is boarding', async () => {
    const load = makeLoad({
      state: LoadState.Boarding,
      dispatchAt: Math.floor(Date.now() / 1000) + 600,
    });
    const { getByTestId, queryByTestId } = await renderThemed(<LoadCard load={load} />);

    expect(getByTestId('load-card-countdown-clock').props.children).toMatch(/^(09|10):\d\d$/);
    expect(queryByTestId('load-card-countdown-announcement')).toBeTruthy();
  });

  it('has no countdown for a load that is not on call', async () => {
    const { queryByTestId } = await renderThemed(<LoadCard load={makeLoad()} />);
    expect(queryByTestId('load-card-countdown')).toBeNull();
  });

  it('says there is no vehicle yet, in the operator’s word', async () => {
    const { getByText } = await renderThemed(<LoadCard load={makeLoad({ vehicles: [] })} />);
    expect(getByText('No vehicle yet')).toBeTruthy();
  });

  it('opens when pressed, and keeps the action outside of the pressable', async () => {
    const onPress = jest.fn();
    const onAction = jest.fn();
    const { getByTestId, getByText } = await renderThemed(
      <LoadCard
        load={makeLoad()}
        onPress={onPress}
        action={
          <Pressable onPress={onAction}>
            <Text>Call</Text>
          </Pressable>
        }
      />
    );

    await fireEvent.press(getByTestId('load-card-open'));
    await fireEvent.press(getByText('Call'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
