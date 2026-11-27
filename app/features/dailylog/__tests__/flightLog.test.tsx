import * as React from 'react';
import type { DailyLogLoadFragment } from 'app/api/operations';
import { LoadVehicleRole } from 'app/api/schema.d';
import { renderThemed } from 'app/ui/components/testing';
import FlightLogLoad, { crewLabel, vehicleName, vehiclesOf } from '../FlightLogLoad';
import { vehicleKindName, vehicleKindOptions } from 'app/forms/vehicle/kinds';

const vehicle = (id: string, name: string, kind: string, role: LoadVehicleRole) => ({
  __typename: 'DailyLogVehicle' as const,
  id,
  name,
  registration: `R-${id}`,
  kind,
  role,
});

const load: DailyLogLoadFragment = {
  __typename: 'DailyLogLoad',
  id: '7',
  loadNumber: 2,
  name: 'Dawn',
  dispatchAt: '2026-11-26T05:00:00+10:00',
  departedAt: '2026-11-26T05:30:00+10:00',
  completedAt: '2026-11-26T06:35:00+10:00',
  durationMinutes: 65,
  destinations: ['Valley field'],
  vehicle: vehicle('1', 'Sunrise', 'balloon', LoadVehicleRole.Carrying),
  vehicles: [
    vehicle('2', 'Chase One', 'chase_vehicle', LoadVehicleRole.Support),
    vehicle('1', 'Sunrise', 'balloon', LoadVehicleRole.Carrying),
  ],
  gca: null,
  pilot: null,
  loadMaster: null,
  crew: [
    {
      __typename: 'DailyLogCrew',
      id: '5',
      role: 'Pilot',
      name: 'Aria Pilot',
      phone: null,
      vehicle: 'Sunrise',
    },
    {
      __typename: 'DailyLogCrew',
      id: '6',
      role: 'Chase crew',
      name: 'Cole Chaser',
      phone: null,
      vehicle: 'Chase One',
    },
  ],
  slots: [
    {
      __typename: 'DailyLogSlot',
      id: '31',
      name: 'Fay Flyer',
      phone: null,
      email: null,
      emergencyContact: null,
      ticketType: 'Adult with child',
      escort: null,
      altitudeM: null,
      activityType: null,
    },
    {
      __typename: 'DailyLogSlot',
      id: '32',
      name: 'Ivy Young',
      phone: null,
      email: null,
      emergencyContact: null,
      ticketType: 'Adult with child',
      escort: 'Fay Flyer',
      altitudeM: null,
      activityType: null,
    },
  ],
};

describe('the flight log', () => {
  it('shows when the flight left and came back, how long it took, both vehicles and the crew of each', async () => {
    const { getByTestId, getByText } = await renderThemed(
      <FlightLogLoad load={load} timeZone="Australia/Brisbane" />
    );

    expect(getByTestId('daily-log-load-7-departed-value').props.children).toBe('05:30');
    expect(getByTestId('daily-log-load-7-back-value').props.children).toBe('06:35');
    expect(getByTestId('daily-log-load-7-duration-value').props.children).toBe('65 minutes');
    expect(getByTestId('daily-log-load-7-count-value').props.children).toBe('2');
    expect(getByText('Sunrise R-1')).toBeTruthy();
    expect(getByText('Chase One R-2')).toBeTruthy();
    expect(getByText('Pilot · Sunrise')).toBeTruthy();
    expect(getByText('Chase crew · Chase One')).toBeTruthy();
    expect(getByText('Ivy Young')).toBeTruthy();
  });

  it('says a flight that has not left yet has no times', async () => {
    const { getByTestId } = await renderThemed(
      <FlightLogLoad
        load={{ ...load, departedAt: null, completedAt: null, durationMinutes: null }}
      />
    );
    expect(getByTestId('daily-log-load-7-duration-value').props.children).toBe('Not yet');
  });

  it('puts the vehicle that carried first, and falls back to the single vehicle', () => {
    expect(vehiclesOf(load).map(({ name }) => name)).toEqual(['Sunrise', 'Chase One']);
    expect(vehiclesOf({ vehicle: load.vehicle, vehicles: [] }).map(({ name }) => name)).toEqual([
      'Sunrise',
    ]);
    expect(vehicleName({ name: 'Kestrel', registration: null })).toBe('Kestrel');
    expect(crewLabel({ role: 'Pilot', vehicle: 'Kestrel' }, false)).toBe('Pilot');
  });

  it('names vehicle kinds, and offers them only to an operator with several', () => {
    expect(vehicleKindName('chase_vehicle')).toBe('Chase vehicle');
    expect(vehicleKindOptions(['boat'])).toEqual([]);
    expect(vehicleKindOptions(['helicopter', 'aeroplane']).map(({ value }) => value)).toEqual([
      'helicopter',
      'aeroplane',
    ]);
  });
});
