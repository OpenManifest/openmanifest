import * as React from 'react';
import { Platform, Share } from 'react-native';
import type { DailyLogLoadFragment } from 'app/api/operations';
import { renderThemed } from 'app/ui/components/testing';
import GuestListLoad, { contactOf } from '../GuestListLoad';
import { csvFileName, exportCsv } from '../exportCsv';

const load: DailyLogLoadFragment = {
  __typename: 'DailyLogLoad',
  id: '9',
  loadNumber: 3,
  name: 'Morning',
  dispatchAt: '2026-11-26T09:00:00+10:00',
  departedAt: null,
  completedAt: null,
  destinations: ['Bay run'],
  vehicle: { __typename: 'DailyLogVehicle', id: '1', name: 'Ocean Spirit', registration: 'WW-301' },
  gca: null,
  pilot: null,
  loadMaster: null,
  crew: [
    { __typename: 'DailyLogCrew', id: '5', role: 'Skipper', name: 'Skye Skipper', phone: null },
  ],
  slots: [
    {
      __typename: 'DailyLogSlot',
      id: '21',
      name: 'Morgan Parent',
      phone: '0400 333 444',
      email: 'morgan@example.com',
      emergencyContact: 'Jo Parent 0400 333 555',
      ticketType: 'Adult with child',
      escort: null,
      altitudeM: null,
      activityType: null,
    },
    {
      __typename: 'DailyLogSlot',
      id: '22',
      name: 'Charlie Child',
      phone: null,
      email: null,
      emergencyContact: null,
      ticketType: 'Adult with child',
      escort: 'Morgan Parent',
      altitudeM: null,
      activityType: null,
    },
  ],
};

describe('the guest list', () => {
  it('lists the crew and each person with a contact and an emergency contact', async () => {
    const { getByTestId, getByText } = await renderThemed(<GuestListLoad load={load} />);

    expect(getByText('Skye Skipper')).toBeTruthy();
    expect(getByText('Bay run')).toBeTruthy();
    expect(getByTestId('daily-log-load-9-count-value').props.children).toBe('2');
    expect(getByText('0400 333 444 · morgan@example.com')).toBeTruthy();
    expect(getByText('Emergency contact: Jo Parent 0400 333 555')).toBeTruthy();
    expect(getByText('No phone or email')).toBeTruthy();
    expect(getByText('Emergency contact: none given')).toBeTruthy();
    expect(getByTestId('daily-log-person-22')).toBeTruthy();
  });

  it('joins what there is of a phone and an email', () => {
    expect(contactOf({ phone: '0400', email: null })).toBe('0400');
    expect(contactOf({ phone: null, email: null })).toBe('');
  });

  it('names the file by the operator’s word for the log and the day', () => {
    expect(csvFileName('Guest list', '2026-11-26')).toBe('guest-list-2026-11-26.csv');
    expect(csvFileName('', '2026-11-26')).toBe('daily-log-2026-11-26.csv');
  });

  it('shares the CSV on a phone', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    expect(Platform.OS).not.toBe('web');
    await exportCsv('Name\nMorgan', 'guest-list-2026-11-26.csv');
    expect(share).toHaveBeenCalledWith({
      message: 'Name\nMorgan',
      title: 'guest-list-2026-11-26.csv',
    });
    share.mockRestore();
  });
});
