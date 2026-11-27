import { mergeTerms, toI18nextTerms } from '../terms';
import generic from '../fixtures/generic.json';
import fallback from '../locales/en/terms.generic.json';
import skydiving from '../fixtures/skydiving.json';

describe('toI18nextTerms', () => {
  it('turns forms into plural keys and keeps the singular as the plain key', () => {
    expect(toI18nextTerms({ load: { one: 'Load', other: 'Loads' } })).toEqual({
      load: 'Load',
      load_one: 'Load',
      load_other: 'Loads',
    });
  });

  it('nests groups', () => {
    expect(toI18nextTerms({ crew: { pilot: { one: 'Pilot', other: 'Pilots' } } })).toEqual({
      crew: { pilot: 'Pilot', pilot_one: 'Pilot', pilot_other: 'Pilots' },
    });
  });

  it('treats a term named like a plural form as a term when its group holds other things', () => {
    expect(toI18nextTerms({ state: { one: { one: 'Open', other: 'Open' } } })).toEqual({
      state: { one: 'Open', one_one: 'Open', one_other: 'Open' },
    });
  });

  it('keeps plain strings and survives nothing', () => {
    expect(toI18nextTerms({ hello: 'Hi' })).toEqual({ hello: 'Hi' });
    expect(toI18nextTerms(null)).toEqual({});
    expect(toI18nextTerms(undefined)).toEqual({});
  });
});

describe('mergeTerms', () => {
  it('merges groups and replaces forms', () => {
    const base = {
      load: { one: 'Load', other: 'Loads' },
      crew: { pilot: { one: 'Pilot', other: 'Pilots' } },
    };
    const override = {
      load: { one: 'Trip', other: 'Trips' },
      crew: { guide: { one: 'Guide', other: 'Guides' } },
    };

    expect(mergeTerms(base, override)).toEqual({
      load: { one: 'Trip', other: 'Trips' },
      crew: { pilot: { one: 'Pilot', other: 'Pilots' }, guide: { one: 'Guide', other: 'Guides' } },
    });
  });

  it('does not change its inputs and accepts no override', () => {
    const base = { load: { one: 'Load', other: 'Loads' } };

    expect(mergeTerms(base, null)).toEqual(base);
    expect(mergeTerms(base, { load: { one: 'Trip', other: 'Trips' } })).not.toBe(base);
    expect(base.load.one).toBe('Load');
  });
});

describe('the synced fixtures', () => {
  it('bundle the generic words as the fallback', () => {
    expect(fallback).toEqual(generic);
  });

  it('cover every term key of GENERALISATION §13 in both templates', () => {
    const keys = [
      'operator',
      'member',
      'vehicle',
      'load',
      'slot',
      'ticket',
      'extra',
      'destination',
      'activity',
      'escort',
      'guest',
      'certification_body',
      'certification',
      'equipment',
      'inspection',
      'daily_log',
      'call',
      'load_count',
      'state',
    ];
    for (const fixture of [generic, skydiving]) {
      expect(Object.keys(fixture)).toEqual(expect.arrayContaining(keys));
    }
    expect(Object.keys(skydiving.crew)).toEqual(['pilot', 'gca', 'load_master']);
  });
});
