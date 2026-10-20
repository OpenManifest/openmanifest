import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { LoadState } from 'app/api/schema.d';
import { renderThemed } from 'app/ui/components/testing';
import {
  guideRole,
  makeLoad,
  membership,
  pilotRole,
  slotOf,
  loadVehicle,
  caravan,
} from 'app/__fixtures__/board.fixture';
import EligibilityBadge from '../EligibilityBadge';
import EscortGroup from '../EscortGroup';
import FreePlaces from '../FreePlaces';
import LoadHeader from '../LoadHeader';
import PlaceRow from '../PlaceRow';
import VehicleHeader from '../VehicleHeader';

const rule = (code: string, status: string) =>
  ({ code, ok: status !== 'FAIL', status, bypassed: false }) as any;

describe('<EligibilityBadge />', () => {
  it('says what stops someone, and what runs out soon', async () => {
    const blocked = await renderThemed(
      <EligibilityBadge rules={[rule('certification', 'FAIL')]} />
    );
    expect(blocked.getByText('Not ready: certification')).toBeTruthy();
    await blocked.unmount();

    const soon = await renderThemed(
      <EligibilityBadge rules={[rule('equipment_service', 'EXPIRING')]} />
    );
    expect(soon.getByText('equipment service runs out soon')).toBeTruthy();
  });

  it('shows nothing for someone who is ready', async () => {
    const { toJSON } = await renderThemed(<EligibilityBadge rules={[rule('credits', 'PASS')]} />);
    expect(toJSON()).toBeNull();
  });
});

describe('<PlaceRow />', () => {
  it('shows the person, what they hold, and the prepaid and readiness badges', async () => {
    const { getByText, getByTestId } = await renderThemed(
      <PlaceRow
        slot={slotOf('1', 'Ann Lee', { prepaid: true })}
        rules={[rule('credits', 'FAIL')]}
      />
    );

    expect(getByText('Ann Lee')).toBeTruthy();
    expect(getByText('License A · Freefly · Fun jump')).toBeTruthy();
    expect(getByTestId('slot-row-prepaid')).toBeTruthy();
    expect(getByTestId('slot-row-eligibility')).toBeTruthy();
  });

  it('shows the destination of the place when it can differ', async () => {
    const slot = slotOf('1', 'Ann', { destination: { id: 'd', kind: 'site', name: 'Reef 2' } });
    const shown = await renderThemed(<PlaceRow slot={slot} showDestination />);
    expect(shown.getByText('Reef 2')).toBeTruthy();
    await shown.unmount();

    const hidden = await renderThemed(<PlaceRow slot={slot} />);
    expect(hidden.queryByText('Reef 2')).toBeNull();
  });

  it('has a menu with what may be done: edit, and take off', async () => {
    const onEdit = jest.fn();
    const onTakeOff = jest.fn();
    const slot = slotOf('1', 'Ann');
    const { getByLabelText, findByTestId } = await renderThemed(
      <PlaceRow slot={slot} canEdit canTakeOff onEdit={onEdit} onTakeOff={onTakeOff} />
    );

    await fireEvent.press(getByLabelText('Actions for Ann'));
    await fireEvent.press(await findByTestId('slot-row-take-off'));

    expect(onTakeOff).toHaveBeenCalledWith(slot);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('has no menu for someone who may do nothing with it', async () => {
    const { queryByLabelText } = await renderThemed(<PlaceRow slot={slotOf('1', 'Ann')} />);
    expect(queryByLabelText('Actions for Ann')).toBeNull();
  });

  it('opens the person when pressed', async () => {
    const onOpenPerson = jest.fn();
    const slot = slotOf('1', 'Ann');
    const { getByLabelText } = await renderThemed(
      <PlaceRow slot={slot} onOpenPerson={onOpenPerson} />
    );

    await fireEvent.press(getByLabelText('Ann'));

    expect(onOpenPerson).toHaveBeenCalledWith(slot);
  });
});

describe('<EscortGroup />', () => {
  it('shows the guests under their escort', async () => {
    const slot = slotOf('1', 'Gus', {
      guestSlots: [
        { id: 'g1', bodyMassKg: 70, guest: { id: 'x', name: 'Guest One' } },
        { id: 'g2', bodyMassKg: 0, guest: { id: 'y', name: 'Guest Two' } },
      ],
    });
    const { getAllByTestId, getByText } = await renderThemed(<EscortGroup slot={slot} />);

    expect(getAllByTestId('slot-row-guest')).toHaveLength(2);
    expect(getByText('Guest One')).toBeTruthy();
    expect(getByText('Guest · 70 kg')).toBeTruthy();
  });
});

describe('<FreePlaces />', () => {
  it('says how many places are free, and opens the picker for someone who may manifest', async () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = await renderThemed(
      <FreePlaces count={6} onPress={onPress} />
    );

    expect(getByText('6 free places')).toBeTruthy();
    await fireEvent.press(getByLabelText('6 free places'));
    expect(onPress).toHaveBeenCalled();
  });

  it('says one free place in the singular, and is not pressable without permission', async () => {
    const { getByText, queryByRole } = await renderThemed(<FreePlaces count={1} />);

    expect(getByText('1 free place')).toBeTruthy();
    expect(queryByRole('button')).toBeNull();
  });
});

describe('<VehicleHeader />', () => {
  it('names the vehicle and how many of its places are taken', async () => {
    const { getByText } = await renderThemed(
      <VehicleHeader title="Otter" kind="aircraft" filled={3} capacity={10} />
    );

    expect(getByText('Otter')).toBeTruthy();
    expect(getByText('3 of 10')).toBeTruthy();
  });
});

describe('<LoadHeader />', () => {
  it('shows the call countdown and when the call was made', async () => {
    const load = makeLoad({
      state: LoadState.Boarding,
      dispatchAt: Math.floor(Date.now() / 1000) + 600,
      calledAt: new Date().toISOString(),
    });
    const { getByTestId } = await renderThemed(
      <LoadHeader load={load} timeZone="Australia/Brisbane" />
    );

    expect(getByTestId('load-header-countdown-clock').props.children).toMatch(/^(09|10):\d\d$/);
    expect(getByTestId('load-header-called-at').props.children).toMatch(/made at \d\d:\d\d/);
  });

  it('shows when the load left once it has', async () => {
    const load = makeLoad({ state: LoadState.Departed, departedAt: '2026-10-19T02:30:00Z' });
    const { getByTestId, queryByTestId } = await renderThemed(
      <LoadHeader load={load} timeZone="Australia/Brisbane" />
    );

    expect(getByTestId('load-header-departed-at').props.children).toMatch(/Left at 12:30/);
    expect(queryByTestId('load-header-countdown')).toBeNull();
  });

  it('shows the crew by role, flags an empty required one, and the places', async () => {
    const load = makeLoad({
      vehicles: [loadVehicle('lv1', caravan, 4)],
      crew: [
        {
          id: 'c',
          crewRole: pilotRole,
          membership: membership('Pat Jones', 'Pat'),
          loadVehicle: { id: 'lv1' },
        },
      ],
    });
    const { getByLabelText, getByTestId } = await renderThemed(
      <LoadHeader load={load} crewRoles={[pilotRole, { ...guideRole, required: true }]} />
    );

    expect(getByLabelText('Pilot: Pat')).toBeTruthy();
    expect(getByLabelText('Guide needed')).toBeTruthy();
    expect(getByTestId('load-header-places').props['aria-valuetext']).toBe('4 of 15 slots');
  });
});
