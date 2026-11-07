import {
  bodiesToAdd,
  crewRoleFacts,
  equipmentKindFacts,
  extraFacts,
  fieldCount,
  ticketFacts,
  vehicleFacts,
} from '../lists';
import { crewPermissions, crewRoleKey } from 'app/forms/crew_role/key';

// Echoes the key and its parameters, so the tests read what the list asks to translate
const t = (key: string, options?: Record<string, unknown>) =>
  options && 'count' in options ? `${key}:${options.count}` : key;
const term = (key: string) => key;
const flat = (facts: { label: string; value: string }[]) =>
  facts.map((fact) => `${fact.label}=${fact.value}`);

describe('setup list facts', () => {
  it('give a vehicle its registration, its seats as a range and its payload when it has one', () => {
    expect(flat(vehicleFacts({ registration: 'VH-OTR', minCapacity: 2, capacity: 16 }, t))).toEqual(
      ['forms.vehicle.registration=VH-OTR', 'resources.facts.seats=2–16']
    );
    expect(flat(vehicleFacts({ registration: '', capacity: 4, maxPayloadKg: 500 }, t))).toEqual([
      'resources.facts.seats=4',
      'resources.facts.payload=500 kg',
    ]);
  });

  it('give a ticket its price, where it goes and whether members book it themselves', () => {
    expect(
      flat(
        ticketFacts(
          {
            costCents: 3000,
            defaultDestination: { kind: 'site', altitudeM: null, name: 'Reef' },
            allowManifestingSelf: true,
          },
          t,
          term
        )
      )
    ).toEqual([
      'forms.ticket_type.price=$30.00',
      'destination=Reef',
      'resources.facts.public=resources.facts.yes',
    ]);
  });

  it('give an extra its price and the tickets it goes with', () => {
    expect(
      flat(extraFacts({ costCents: 500, ticketTypes: [{ name: 'Fun' }, { name: null }] }, t))
    ).toEqual(['forms.ticket_type_addon.price=$5.00', 'resources.facts.tickets=Fun']);
  });

  it('give a crew role how often it is filled, whether it must be, and who may fill it', () => {
    expect(
      flat(
        crewRoleFacts(
          { scope: 'vehicle', required: true, occupiesSlot: true, permission: 'actAsPilot' },
          t,
          term
        )
      )
    ).toEqual([
      'forms.crew_role.scope=forms.crew_role.scopes.vehicle',
      'forms.crew_role.required=resources.facts.yes',
      'forms.crew_role.occupiesSlot=resources.facts.yes',
      'forms.crew_role.permission=profile.acting.actAsPilot',
    ]);
    expect(flat(crewRoleFacts({ scope: 'load', required: false }, t, term))).toEqual([
      'forms.crew_role.scope=forms.crew_role.scopes.load',
      'forms.crew_role.required=resources.facts.no',
      'forms.crew_role.permission=forms.crew_role.anyone',
    ]);
  });

  it('give a kind of equipment its service interval and its inspection form', () => {
    expect(
      flat(
        equipmentKindFacts(
          {
            serviceIntervalDays: 180,
            inspectionValidDays: null,
            inspectionFormTemplate: { definition: '[{"label":"Pin"},{"label":"Closing loop"}]' },
          },
          t
        )
      )
    ).toEqual([
      'resources.facts.service=resources.facts.days:180',
      'resources.facts.checks=2',
      'resources.facts.inspectionValid=resources.facts.untilReplaced',
    ]);
    expect(equipmentKindFacts({}, t)).toEqual([]);
  });

  it('count the fields of an inspection form, and none of one it cannot read', () => {
    expect(fieldCount('[{}]')).toBe(1);
    expect(fieldCount('{oops')).toBe(0);
    expect(fieldCount(null)).toBe(0);
  });
});

describe('bodiesToAdd', () => {
  it('offers the bodies of the industry (or of none) that are not accepted yet', () => {
    const all = [
      { id: '1', industry: 'skydiving' },
      { id: '2', industry: 'scuba' },
      { id: '3', industry: null },
      { id: '4', industry: 'skydiving' },
    ];
    expect(bodiesToAdd(all, [{ id: '1' }], 'skydiving').map(({ id }) => id)).toEqual(['3', '4']);
  });
});

describe('crewRoleKey', () => {
  it('makes a key the API takes from the name', () => {
    expect(crewRoleKey('Camera flyer')).toBe('camera_flyer');
    expect(crewRoleKey('  Ground Control (GCA) ')).toBe('ground_control_gca');
    expect(crewRoleKey('2nd pilot')).toBe('nd_pilot');
    expect(crewRoleKey('Équipe')).toBe('equipe');
    expect(crewRoleKey('!!!')).toBe('crew');
  });

  it('does not reuse a key the operator has', () => {
    expect(crewRoleKey('Pilot', ['pilot', 'pilot_2'])).toBe('pilot_3');
  });

  it('offers the acting permissions for a role', () => {
    expect(crewPermissions(['actAsPilot', 'createLoad', 'actAsGCA'])).toEqual([
      'actAsPilot',
      'actAsGCA',
    ]);
  });
});
